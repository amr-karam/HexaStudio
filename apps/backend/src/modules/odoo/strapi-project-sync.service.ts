import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { OdooApiService } from './odoo-api.service';
import { OdooService } from './odoo.service';
import { RedisService } from '../storage/redis.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { getEnv } from '../../config/env';
import type { OdooProject } from '@hexastudio/types';

export interface SyncStatus {
  backfilled: boolean;
  lastBackfill: number | null;
  lastReconciliation: number | null;
  odooProjectCount: number;
  strapiPortfolioCount: number;
  syncedCount: number;
  errors: string[];
}

/** Slug↔ID mapping stored in Redis hash: odoo:project:mapping */
export interface ProjectIdMapping {
  slug: string;
  strapiId: number | null;
  odooId: number | null;
  lastSyncedAt: number;
  syncedFrom: 'strapi' | 'odoo' | 'reconcile';
}

const SYNC_SKIP_PREFIX = 'sync:skip:';
const SYNC_SKIP_TTL = 30;
const STATUS_KEY = 'odoo:project-sync:status';
const MAPPING_HASH = 'odoo:project:mapping';
const PROJECT_CACHE_PREFIX = 'odoo:project-cache:';
const MILESTONE_CACHE_PREFIX = 'odoo:milestone-progress:';
const PROJECT_CACHE_TTL = 300; // 5 minutes
const MILESTONE_CACHE_TTL = 300; // 5 minutes

/**
 * Bidirectional Strapi ↔ Odoo project sync service.
 *
 * 1. Backfill — creates Odoo projects for all Strapi portfolio entries missing a counterpart.
 * 2. Real-time sync — invoked by StrapiWebhookController and OdooSyncService.
 * 3. Reconciliation — scheduled every 10 minutes to catch drift.
 * 4. Loop prevention — short-lived Redis skip keys break the Odoo→Strapi→Odoo ping-pong.
 */
@Injectable()
export class StrapiProjectSyncService implements OnModuleInit {
  private readonly logger = new Logger(StrapiProjectSyncService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly _odooApiService: OdooApiService,
    private readonly odooService: OdooService,
    private readonly redisService: RedisService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  // ── Helpers ────────────────────────────────────────────────

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  private get cmsHeaders(): Record<string, string> | undefined {
    const token = getEnv().CMS_API_TOKEN;
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }

  /** Mark a record as "synced, skip the reverse webhook". */
  private async markSynced(domain: 'odoo' | 'strapi', id: string): Promise<void> {
    const key = `${SYNC_SKIP_PREFIX}${domain}:${id}`;
    await this.redisService.set(key, '1', SYNC_SKIP_TTL);
  }

  /** Check if a record was just synced by us (to skip reverse webhook processing). */
  async isSynced(domain: 'odoo' | 'strapi', id: string): Promise<boolean> {
    const key = `${SYNC_SKIP_PREFIX}${domain}:${id}`;
    const val = await this.redisService.get<string>(key);
    return val === '1';
  }

  /** Persist sync status to Redis for dashboard / admin visibility. */
  private async persistStatus(partial: Partial<SyncStatus>): Promise<void> {
    const prev = await this.redisService.get<SyncStatus>(STATUS_KEY);
    const next: SyncStatus = {
      backfilled: false,
      lastBackfill: null,
      lastReconciliation: null,
      odooProjectCount: 0,
      strapiPortfolioCount: 0,
      syncedCount: 0,
      errors: [],
      ...(prev ?? {}),
      ...partial,
    };
    await this.redisService.set(STATUS_KEY, next, 86_400); // 24h TTL
  }

  async getStatus(): Promise<SyncStatus | null> {
    return this.redisService.get<SyncStatus>(STATUS_KEY);
  }

  // ── Slug↔ID Mapping Registry (Gap 1) ─────────────────────

  /**
   * Update the slug↔ID mapping in Redis.
   * Used by every sync operation so queries can resolve slugs cheaply.
   */
  async updateMapping(
    slug: string,
    strapiId: number | null,
    odooId: number | null,
    syncedFrom: ProjectIdMapping['syncedFrom'] = 'reconcile',
  ): Promise<void> {
    const mapping: ProjectIdMapping = {
      slug,
      strapiId,
      odooId,
      lastSyncedAt: Date.now(),
      syncedFrom,
    };
    await this.redisService.hset(MAPPING_HASH, slug, mapping);
  }

  /**
   * Resolve a slug to its Strapi + Odoo IDs.
   * Returns null if the slug has never been synced.
   */
  async getMapping(slug: string): Promise<ProjectIdMapping | null> {
    const raw = await this.redisService.hget<ProjectIdMapping>(MAPPING_HASH, slug);
    return raw ?? null;
  }

  /**
   * Return all known slug↔ID mappings (for admin / reconciliation UI).
   */
  async getAllMappings(): Promise<Record<string, ProjectIdMapping>> {
    return (await this.redisService.hgetall<ProjectIdMapping>(MAPPING_HASH)) ?? {};
  }

  // ── Project Cache (Gap 2) ─────────────────────────────────

  /**
   * Cache a full (merged) project data blob in Redis so the frontend
   * can serve local queries without hitting Strapi or Odoo every time.
   */
  async cacheProjectData(slug: string, data: Record<string, unknown>): Promise<void> {
    await this.redisService.set(
      `${PROJECT_CACHE_PREFIX}${slug}`,
      data,
      PROJECT_CACHE_TTL,
    );
  }

  /**
   * Retrieve cached project data for local queries.
   */
  async getCachedProjectData(slug: string): Promise<Record<string, unknown> | null> {
    return this.redisService.get<Record<string, unknown>>(`${PROJECT_CACHE_PREFIX}${slug}`);
  }

  /**
   * Invalidate the project cache for a given slug (after a new sync).
   */
  async invalidateProjectCache(slug: string): Promise<void> {
    await this.redisService.del(`${PROJECT_CACHE_PREFIX}${slug}`);
  }

  // ── Milestone Progress Cache (Gap 9) ──────────────────────

  /**
   * Cache milestone progress for a project so dashboards don't
   * hammer Strapi/Odoo on every page load.
   */
  async cacheMilestoneProgress(
    slug: string,
    milestones: { total: number; completed: number; percentage: number },
  ): Promise<void> {
    await this.redisService.set(
      `${MILESTONE_CACHE_PREFIX}${slug}`,
      milestones,
      MILESTONE_CACHE_TTL,
    );
  }

  /**
   * Retrieve cached milestone progress.
   */
  async getCachedMilestoneProgress(
    slug: string,
  ): Promise<{ total: number; completed: number; percentage: number } | null> {
    return this.redisService.get<{ total: number; completed: number; percentage: number }>(
      `${MILESTONE_CACHE_PREFIX}${slug}`,
    );
  }

  // ── Real-time Push via Socket.IO (Gap 6) ──────────────────

  /**
   * Emit a project sync event to all connected clients in the project room.
   * Relies on the existing RealtimeGateway / socket.io infrastructure.
   */
  private emitProjectSync(
    slug: string,
    action: 'synced' | 'created' | 'updated' | 'conflict-resolved',
    data: Record<string, unknown>,
  ): void {
    try {
      this.realtimeGateway.emitToRoom(`project:${slug}`, 'project:sync', {
        action,
        slug,
        timestamp: new Date().toISOString(),
        data,
      });
      this.logger.debug(`Emitted ${action} for project ${slug}`);
    } catch (error) {
      this.logger.warn(`Failed to emit project:sync for ${slug}: ${(error as Error).message}`);
    }
  }

  // ── OnModuleInit ───────────────────────────────────────────

  async onModuleInit(): Promise<void> {
    this.logger.log('StrapiProjectSyncService initialized. Running initial backfill…');
    try {
      await this.backfill();
    } catch (error) {
      this.logger.error(`Initial backfill failed: ${(error as Error).message}`);
    }
  }

  // ── Backfill ───────────────────────────────────────────────

  /**
   * Create Odoo projects for every Strapi portfolio entry that does not yet
   * have a corresponding Odoo project (matched by x_slug).
   */
  async backfill(): Promise<{ created: number; skipped: number; errors: string[] }> {
    this.logger.log('Starting Odoo project backfill from Strapi portfolios…');
    const errors: string[] = [];
    let created = 0;
    let skipped = 0;

    try {
      const entries = await this.fetchAllPortfolioEntries();
      this.logger.log(`Found ${entries.length} Strapi portfolio entries`);

      for (const entry of entries) {
        const slug = entry.slug;
        if (!slug) {
          skipped++;
          continue;
        }

        const existing = await this._odooApiService.findProjectBySlug(slug);
        if (existing) {
          skipped++;
          continue;
        }

        try {
          const odooId = await this.syncEntryToOdoo(entry);
          if (odooId) {
            created++;
            this.logger.log(`Created Odoo project #${odooId} for slug "${slug}"`);
          }
        } catch (error) {
          const msg = `Failed to create Odoo project for slug "${slug}": ${(error as Error).message}`;
          errors.push(msg);
          this.logger.warn(msg);
        }
      }
    } catch (error) {
      const msg = `Backfill fetch failed: ${(error as Error).message}`;
      errors.push(msg);
      this.logger.error(msg);
    }

    await this.persistStatus({
      backfilled: true,
      lastBackfill: Date.now(),
      odooProjectCount: await this.countOdooProjects(),
      strapiPortfolioCount: await this.countStrapiPortfolios(),
      syncedCount: created,
      errors: errors.slice(0, 10),
    });

    this.logger.log(`Backfill complete: ${created} created, ${skipped} skipped, ${errors.length} errors`);
    return { created, skipped, errors };
  }

  // ── Sync Strapi → Odoo ────────────────────────────────────

  /**
   * Sync a single Strapi portfolio entry to Odoo (create or update).
   * Called from the Strapi webhook controller on portfolio.create / portfolio.update.
   *
   * @returns Odoo project ID if created/updated, null if skipped or errored.
   */
  async syncPortfolioToOdoo(slug: string): Promise<number | null> {
    this.logger.log(`Syncing Strapi portfolio "${slug}" → Odoo…`);

    // Guard: skip if this was just synced from Odoo (prevents loops)
    if (await this.isSynced('odoo', slug)) {
      this.logger.debug(`Skipping Strapi→Odoo sync for "${slug}" — recently synced from Odoo`);
      return null;
    }

    const entry = await this.fetchPortfolioBySlug(slug);
    if (!entry) {
      this.logger.warn(`Strapi portfolio "${slug}" not found, skipping`);
      return null;
    }

    const existing = await this._odooApiService.findProjectBySlug(slug);
    let odooId: number;

    // Resolve partner ID if client name is present
    let partnerId: number | undefined;
    if (entry.client) {
      try {
        partnerId = await this._odooApiService.getOrCreatePartner(entry.client);
      } catch (error) {
        this.logger.warn(`Could not resolve partner for "${entry.client}": ${(error as Error).message}`);
      }
    }

    const projectData = this.buildOdooProjectData(entry, partnerId);

    if (existing) {
      try {
        await this._odooApiService.updateProject(existing.id, projectData);
        odooId = existing.id;
        this.logger.log(`Updated Odoo project #${odooId} for slug "${slug}"`);
      } catch (error) {
        this.logger.warn(`Failed to update Odoo project #${existing.id}: ${(error as Error).message}. Continuing with local cache.`);
        odooId = existing.id;
      }
    } else {
      try {
        odooId = await this._odooApiService.createProject(projectData);
        this.logger.log(`Created Odoo project #${odooId} for slug "${slug}"`);
      } catch (error) {
        const errMessage = (error as Error).message;
        this.logger.warn(
          `Failed to create Odoo project for slug "${slug}": ${errMessage}. ` +
          `Graceful fallback: caching locally in Redis. Remediation: Verify Odoo credentials and ensure ODOO_USER has Project Administrator/Manager (project.group_project_manager) permissions.`
        );
        await this.cacheProjectData(slug, {
          slug,
          strapiId: entry.id,
          odooId: null,
          title: entry.title,
          description: entry.description ?? '',
          client: entry.client ?? null,
          syncStatus: 'odoo-create-failed-cached-locally',
          error: errMessage,
          syncedAt: new Date().toISOString(),
        });
        return null;
      }
    }

    // Mark the Odoo project as recently synced so its webhook is skipped
    await this.markSynced('strapi', String(odooId));

    // Update slug↔ID mapping
    await this.updateMapping(slug, entry.id, odooId, 'strapi');

    // Cache full merged project data
    const mergedCache: Record<string, unknown> = {
      slug,
      strapiId: entry.id,
      odooId,
      title: entry.title ?? projectData.name ?? '',
      description: entry.description ?? '',
      client: entry.client ?? null,
      syncedAt: new Date().toISOString(),
    };
    await this.cacheProjectData(slug, mergedCache);

    // Push real-time event to connected clients
    this.emitProjectSync(slug, existing ? 'updated' : 'created', mergedCache);

    return odooId;
  }

  // ── Sync Odoo → Strapi ────────────────────────────────────

  /**
   * Sync a single Odoo project to Strapi (create or update portfolio entry).
   * Called from OdooSyncService when a project.project webhook arrives.
   *
   * @returns Strapi entry ID if created/updated, null if skipped or errored.
   */
  async syncOdooProjectToStrapi(odooId: number): Promise<number | null> {
    this.logger.log(`Syncing Odoo project #${odooId} → Strapi…`);

    const project = await this._odooApiService.getProjectDetail(odooId);
    const slug = project.x_slug;

    if (!slug) {
      this.logger.debug(`Odoo project #${odooId} has no x_slug, skipping Strapi sync`);
      return null;
    }

    // Guard: skip if this was just synced from Strapi (prevents loops)
    if (await this.isSynced('strapi', slug)) {
      this.logger.debug(`Skipping Odoo→Strapi sync for #${odooId} — recently synced from Strapi`);
      return null;
    }

    const existingEntry = await this.fetchPortfolioBySlug(slug);
    const data = this.buildPortfolioData(project);

    let entryId: number;

    if (existingEntry) {
      entryId = existingEntry.id;
      await this.updatePortfolioEntry(entryId, data);
      this.logger.log(`Updated Strapi portfolio #${entryId} for slug "${slug}"`);
    } else {
      entryId = await this.createPortfolioEntry(data);
      this.logger.log(`Created Strapi portfolio #${entryId} for slug "${slug}"`);
    }

    // Mark the Strapi entry as recently synced so its webhook is skipped
    await this.markSynced('odoo', slug);

    // Update slug↔ID mapping
    await this.updateMapping(slug, entryId, odooId, 'odoo');

    // Cache full merged project data
    const mergedCache = {
      slug,
      strapiId: entryId,
      odooId,
      title: project.name ?? data.title ?? '',
      description: project.name ?? '',
      client: Array.isArray(project.partner_id) ? project.partner_id[1] : data.client ?? null,
      status: Array.isArray(project.stage_id) ? project.stage_id[1] : data.status ?? null,
      syncedAt: new Date().toISOString(),
    };
    await this.cacheProjectData(slug, mergedCache);

    // Cache milestone progress if available — x_hexa_milestone_ids holds milestone IDs
    if (project.x_hexa_milestone_ids?.length) {
      const total = project.x_hexa_milestone_ids.length;
      // Milestone state would need a separate fetch; cache total count for now
      await this.cacheMilestoneProgress(slug, {
        total,
        completed: 0,
        percentage: 0,
      });
    }

    // Push real-time event to connected clients
    this.emitProjectSync(slug, existingEntry ? 'updated' : 'created', mergedCache);

    // Purge frontend ISR cache so the new/updated project appears immediately
    // on the homepage, /projects listing, and the project detail page.
    await this.revalidateFrontend(slug);

    return entryId;
  }

  // ── Frontend ISR Revalidation ──────────────────────────────

  /**
   * Purge the Next.js ISR cache for all pages that display project data.
   *
   * Called after every Odoo→Strapi sync so new projects appear on the
   * website in real time, not just on the 1-hour ISR refresh cycle.
   */
  private async revalidateFrontend(slug: string): Promise<void> {
    const frontendUrl = getEnv().FRONTEND_URL;
    const revalidateSecret = getEnv().REVALIDATE_SECRET;

    if (!frontendUrl || !revalidateSecret) {
      this.logger.debug('FRONTEND_URL or REVALIDATE_SECRET not configured — skipping ISR purge');
      return;
    }

    try {
      await firstValueFrom(
        this.httpService.post(
          `${frontendUrl}/api/revalidate`,
          {
            paths: [
              '/',                    // homepage (project grid)
              '/projects',            // projects listing
              `/projects/${slug}`,    // project detail page
              '/studio',              // 3D studio experience
            ],
            type: 'page',
          },
          {
            headers: {
              'x-revalidate-secret': revalidateSecret,
              'Content-Type': 'application/json',
            },
            timeout: 10_000,
          },
        ),
      );
      this.logger.log(`Frontend ISR cache purged for slug "${slug}"`);
    } catch (error) {
      // Non-fatal: the ISR cache will self-heal on the next 1-hour cycle.
      this.logger.warn(
        `Frontend revalidation failed for slug "${slug}": ${(error as Error).message}`,
      );
    }
  }

  // ── Reconciliation ────────────────────────────────────────

  /** Scheduled reconciliation: runs every 10 minutes to catch drift. */
  @Cron('*/10 * * * *')
  async reconcile(): Promise<{ created: number; updated: number; errors: string[] }> {
    this.logger.log('Starting Strapi ↔ Odoo reconciliation…');
    const errors: string[] = [];
    let created = 0;
    let updated = 0;

    try {
      const [strapiEntries, odooProjects] = await Promise.all([
        this.fetchAllPortfolioEntries(),
        this.fetchAllOdooProjects(),
      ]);

      const strapiBySlug = new Map<string, (typeof strapiEntries)[0]>();
      for (const e of strapiEntries) {
        if (e.slug) strapiBySlug.set(e.slug, e);
      }

      const odooBySlug = new Map<string, OdooProject>();
      for (const p of odooProjects) {
        if (p.x_slug) odooBySlug.set(p.x_slug, p);
      }

      // 1. Strapi entries missing in Odoo → create Odoo projects
      for (const [slug, entry] of strapiBySlug) {
        if (!odooBySlug.has(slug)) {
          try {
            let partnerId: number | undefined;
            if (entry.client) {
              partnerId = await this._odooApiService.getOrCreatePartner(entry.client).catch(() => undefined);
            }
            const odooId = await this._odooApiService.createProject(
              this.buildOdooProjectData(entry, partnerId),
            );
            created++;
            this.logger.log(`[Recon] Created Odoo project #${odooId} for slug "${slug}"`);
          } catch (error) {
            const msg = `[Recon] Failed to create Odoo project for slug "${slug}": ${(error as Error).message}`;
            errors.push(msg);
            this.logger.warn(msg);
          }
        }
      }

      // 2. Odoo projects missing in Strapi → create Strapi entries
      for (const [slug, project] of odooBySlug) {
        if (!strapiBySlug.has(slug)) {
          try {
            const data = this.buildPortfolioData(project);
            const entryId = await this.createPortfolioEntry(data);
            updated++;
            this.logger.log(`[Recon] Created Strapi portfolio #${entryId} for slug "${slug}"`);
          } catch (error) {
            const msg = `[Recon] Failed to create Strapi entry for slug "${slug}": ${(error as Error).message}`;
            errors.push(msg);
            this.logger.warn(msg);
          }
        }
      }

      // 3. Conflict resolution: last-write-wins (Gap 7)
      //    For entries in both Strapi and Odoo, compare updatedAt timestamps.
      //    The side with the newer timestamp becomes the source of truth.
      for (const [slug, entry] of strapiBySlug) {
        const odooProject = odooBySlug.get(slug);
        if (!odooProject) continue;

        const strapiUpdated = entry.updatedAt ? new Date(entry.updatedAt).getTime() : 0;
        const odooUpdated = odooProject.date ? new Date(odooProject.date).getTime() : odooProject.date_start ? new Date(odooProject.date_start).getTime() : 0;

        if (strapiUpdated > odooUpdated) {
          // Strapi is newer → push to Odoo
          let partnerId: number | undefined;
          if (entry.client) {
            partnerId = await this._odooApiService.getOrCreatePartner(entry.client).catch(() => undefined);
          }
          const updateData = this.buildOdooProjectData(entry, partnerId);
          if (
            (updateData.name && updateData.name !== odooProject.name) ||
            (updateData.partner_id && (!Array.isArray(odooProject.partner_id) || odooProject.partner_id[0] !== updateData.partner_id))
          ) {
            try {
              await this._odooApiService.updateProject(odooProject.id, updateData);
              updated++;
              await this.updateMapping(slug, entry.id, odooProject.id, 'reconcile');
              this.emitProjectSync(slug, 'conflict-resolved', {
                winner: 'strapi',
                odooId: odooProject.id,
                strapiId: entry.id,
              });
              this.logger.log(`[Recon] Strapi→Odoo update #${odooProject.id} for slug "${slug}" (Strapi newer)`);
            } catch (error) {
              const msg = `[Recon] Failed to update Odoo project #${odooProject.id}: ${(error as Error).message}`;
              errors.push(msg);
              this.logger.warn(msg);
            }
          }
        } else if (odooUpdated > strapiUpdated) {
          // Odoo is newer → pull to Strapi
          if (odooProject.x_slug) {
            try {
              const odooData = this.buildPortfolioData(odooProject);
              const existingEntry = strapiBySlug.get(slug);
              if (existingEntry) {
                await this.updatePortfolioEntry(existingEntry.id, odooData);
                updated++;
                await this.updateMapping(slug, existingEntry.id, odooProject.id, 'reconcile');
                this.emitProjectSync(slug, 'conflict-resolved', {
                  winner: 'odoo',
                  odooId: odooProject.id,
                  strapiId: existingEntry.id,
                });
                this.logger.log(`[Recon] Odoo→Strapi update #${existingEntry.id} for slug "${slug}" (Odoo newer)`);
              }
            } catch (error) {
              const msg = `[Recon] Failed to update Strapi entry for slug "${slug}": ${(error as Error).message}`;
              errors.push(msg);
              this.logger.warn(msg);
            }
          }
        }
        // If timestamps are equal, no action needed
      }
    } catch (error) {
      const msg = `Reconciliation fetch failed: ${(error as Error).message}`;
      errors.push(msg);
      this.logger.error(msg);
    }

    await this.persistStatus({
      lastReconciliation: Date.now(),
      odooProjectCount: await this.countOdooProjects(),
      strapiPortfolioCount: await this.countStrapiPortfolios(),
      errors: errors.slice(0, 10),
    });

    this.logger.log(
      `Reconciliation complete: ${created} created, ${updated} updated, ${errors.length} errors`,
    );
    return { created, updated, errors };
  }

  // ── Public API — used by ProjectsController for POST/PATCH ──

  /**
   * Create a Strapi portfolio entry programmatically.
   * Returns the new entry's Strapi ID.
   */
  async createStrapiProject(data: { title: string; slug: string; description?: string; client?: string; services?: string[] }): Promise<number> {
    const entryData: Record<string, unknown> = {
      title: data.title,
      slug: data.slug,
    };
    if (data.description) entryData.description = data.description;
    if (data.client) entryData.client = data.client;
    if (data.services) entryData.services = data.services;
    return this.createPortfolioEntry(entryData);
  }

  // ── Internal: sync a single entry to Odoo ─────────────────

  private async syncEntryToOdoo(entry: {
    id: number;
    slug: string;
    title: string;
    description?: string;
    client?: string;
    services?: string[];
  }): Promise<number | null> {
    try {
      let partnerId: number | undefined;
      if (entry.client) {
        try {
          partnerId = await this._odooApiService.getOrCreatePartner(entry.client);
        } catch (error) {
          this.logger.warn(
            `Could not resolve partner for "${entry.client}": ${(error as Error).message}`,
          );
        }
      }
      const data = this.buildOdooProjectData(entry, partnerId);
      const odooId = await this._odooApiService.createProject(data);
      await this.markSynced('strapi', String(odooId));
      return odooId;
    } catch (error) {
      const errMessage = (error as Error).message;
      this.logger.warn(
        `Odoo project sync/creation failed for slug "${entry.slug}": ${errMessage}. ` +
        `Graceful fallback: caching project data locally in Redis. ` +
        `Remediation: Verify Odoo credentials and ensure the Odoo user has Project Administrator/Manager (project.group_project_manager) permissions.`
      );
      await this.cacheProjectData(entry.slug, {
        slug: entry.slug,
        strapiId: entry.id,
        odooId: null,
        title: entry.title,
        description: entry.description ?? '',
        client: entry.client ?? null,
        syncStatus: 'odoo-sync-failed-permission-or-offline',
        error: errMessage,
        syncedAt: new Date().toISOString(),
      });
      return null;
    }
  }

  // ── Strapi API helpers ────────────────────────────────────

  private async fetchAllPortfolioEntries(): Promise<
    Array<{
      id: number;
      slug: string;
      title: string;
      description?: string;
      client?: string;
      services?: string[];
      updatedAt?: string;
    }>
  > {
    const entries: Array<Record<string, unknown>> = [];
    let page = 1;
    const pageSize = 100;
    let total = 0;

    do {
      const response = await firstValueFrom(
        this.httpService.get(`${this.cmsUrl}/api/portfolios`, {
          headers: this.cmsHeaders,
          params: {
            populate: '*',
            'pagination[page]': page,
            'pagination[pageSize]': pageSize,
          },
        }),
      );
      const data = response.data;
      total = data.meta?.pagination?.total ?? data.data.length;
      for (const item of data.data) {
        const attrs = item.attributes ?? item;
        entries.push({
          id: item.id,
          slug: attrs.slug,
          title: attrs.title,
          description: attrs.description,
          client: attrs.client,
          services: attrs.services,
          updatedAt: attrs.updatedAt,
        });
      }
      page++;
    } while (entries.length < total);

    return entries as Array<{
      id: number;
      slug: string;
      title: string;
      description?: string;
      client?: string;
      services?: string[];
      updatedAt?: string;
    }>;
  }

  private async fetchPortfolioBySlug(slug: string): Promise<{
    id: number;
    slug: string;
    title: string;
    description?: string;
    client?: string;
    services?: string[];
    updatedAt?: string;
  } | null> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/portfolios`, {
        headers: this.cmsHeaders,
        params: {
          populate: '*',
          'filters[slug][$eq]': slug,
        },
      }),
    );
    const items = response.data.data;
    if (!items?.length) return null;
    const item = items[0];
    const attrs = item.attributes ?? item;
    return {
      id: item.id,
      slug: attrs.slug,
      title: attrs.title,
      description: attrs.description,
      client: attrs.client,
      services: attrs.services,
      updatedAt: attrs.updatedAt,
    };
  }

  private async createPortfolioEntry(data: Record<string, unknown>): Promise<number> {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.cmsUrl}/api/portfolios`,
        { data },
        {
          headers: { ...this.cmsHeaders, 'Content-Type': 'application/json' },
        },
      ),
    );
    return response.data.data?.id ?? response.data.id;
  }

  private async updatePortfolioEntry(id: number, data: Record<string, unknown>): Promise<void> {
    await firstValueFrom(
      this.httpService.put(
        `${this.cmsUrl}/api/portfolios/${id}`,
        { data },
        {
          headers: { ...this.cmsHeaders, 'Content-Type': 'application/json' },
        },
      ),
    );
  }

  // ── Odoo API helpers ──────────────────────────────────────

  private async fetchAllOdooProjects(): Promise<OdooProject[]> {
    return this._odooApiService.getProjects(10_000, 0);
  }

  private async countOdooProjects(): Promise<number> {
    const ids = await this.odooService.execute<number[]>('project.project', 'search', [[]]);
    return ids.length;
  }

  private async countStrapiPortfolios(): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.cmsUrl}/api/portfolios`, {
          headers: this.cmsHeaders,
          params: { 'pagination[pageSize]': 1 },
        }),
      );
      return response.data.meta?.pagination?.total ?? 0;
    } catch {
      return 0;
    }
  }

  // ── Data mapping ──────────────────────────────────────────

  /**
   * Map a Strapi portfolio entry → Odoo project.project create/update data.
   */
  private buildOdooProjectData(
    entry: {
      title: string;
      slug: string;
      description?: string;
      client?: string;
      services?: string[];
    },
    partnerId?: number,
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {
      name: entry.title,
      x_slug: entry.slug,
    };
    if (entry.description) {
      data.description = entry.description;
    }
    if (partnerId) {
      data.partner_id = partnerId;
    }
    if (entry.services?.length) {
      const primaryType = entry.services[0]?.toLowerCase();
      if (['residential', 'commercial', 'interior'].includes(primaryType)) {
        data.x_hexa_type = primaryType;
      }
    }
    return data;
  }

  /**
   * Map an Odoo project → Strapi portfolio create/update data.
   */
  private buildPortfolioData(project: OdooProject): Record<string, unknown> {
    const data: Record<string, unknown> = {
      title: project.name,
      slug: project.x_slug ?? '',
    };
    if (project.x_hexa_status) {
      data.status = project.x_hexa_status;
    } else if (project.stage_id) {
      const stageName = Array.isArray(project.stage_id) ? project.stage_id[1] : '';
      if (stageName) data.status = stageName;
    }
    // Mark as published if status is not inquiry/archived
    if (project.x_hexa_status && !['inquiry', 'archived'].includes(project.x_hexa_status)) {
      data.isPublished = true;
    }
    return data;
  }
}
