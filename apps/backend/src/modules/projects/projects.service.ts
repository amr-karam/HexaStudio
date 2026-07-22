import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Project, ProjectResponse, Category, ProjectLiveStatus } from '@hexastudio/types';
import { getEnv } from '../../config/env';
import { OdooService } from '../odoo/odoo.service';
import { RedisService } from '../storage/redis.service';

interface StrapiRelation {
  id?: number;
  name?: string;
  slug?: string;
  url?: string;
  alternativeText?: string;
  data?: {
    id?: number;
    attributes?: {
      name?: string;
      slug?: string;
      url?: string;
      alternativeText?: string;
    };
  };
}

function mapCategory(relation: StrapiRelation | undefined): Category | undefined {
  if (!relation) return undefined;

  // Strapi v4/v5 nested relation shape: { data: { attributes: { name, slug } } }
  const attrs = relation.data?.attributes;
  const id = relation.data?.id ?? relation.id;
  const name = attrs?.name ?? relation.name;
  const slug = attrs?.slug ?? relation.slug;

  if (!id || !name) return undefined;
  return { id: String(id), name, slug: slug ?? '' };
}

function mapMedia(relation: StrapiRelation | undefined, baseUrl?: string): string | undefined {
  if (!relation) return undefined;
  let url: string | undefined;
  if (typeof relation === 'string') {
    url = relation;
  } else if (relation.data?.attributes?.url) {
    // Strapi v4/v5 nested media shape: { data: { attributes: { url } } }
    url = relation.data.attributes.url;
  } else if (relation.url) {
    url = relation.url;
  }
  if (!url) return undefined;
  // Strapi returns relative URLs like /uploads/image.jpg — resolve against CMS base
  if (baseUrl && url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }
  return url;
}

interface OdooEnrichment {
  status?: string;
  milestones?: { total: number; completed: number };
  liveStatus?: ProjectLiveStatus;
}

const LIVE_STATUS_CACHE_PREFIX = 'projects:live-status:';
const LIVE_STATUS_CACHE_TTL = 300; // 5 minutes
const ODOO_ENRICHMENT_TIMEOUT_MS = 2000;

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly odooService: OdooService,
    private readonly redisService: RedisService,
  ) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  private get cmsHeaders(): Record<string, string> | undefined {
    const token = getEnv().CMS_API_TOKEN;
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }

  async getAllProjects(page = 1, limit = 20, locale?: string): Promise<ProjectResponse> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/portfolios`, {
        headers: this.cmsHeaders,
        params: {
          'populate': '*',
          'sort': 'order:asc',
          'pagination[page]': safePage,
          'pagination[pageSize]': safeLimit,
          ...(locale ? { locale } : {}),
        },
      }),
    );

    const data = response.data;
    const projects = data.data.map((item: Record<string, unknown>) => this.mapProject(item));

    // Batch Odoo status lookup in a single query instead of N+1
    const slugs = projects.map((p: Project) => p.slug);
    let enrichmentError: string | undefined;
    try {
      const odooData = await this.odooService.searchRead(
        'project.project',
        [['x_slug', 'in', slugs]],
        ['x_slug', 'stage_id']
      );
      const stageMap = new Map<string, string>();
      for (const row of odooData) {
        const slug = row.x_slug as string;
        const stage = row.stage_id;
        const stageName = Array.isArray(stage)
          ? String(stage[1])
          : String((stage as Record<string, unknown>)?.name ?? '');
        if (slug) stageMap.set(slug, stageName);
      }
      for (const project of projects) {
        const status = stageMap.get(project.slug);
        if (status) project.status = status;
      }

      // Batch milestone progress in a single query (total + completed per project).
      const milestones = await this.odooService.searchRead(
        'project.milestone',
        [['x_hexa_client_viewable', '=', true]],
        ['id', 'project_id', 'completed']
      );
      const msByProject = new Map<number, { total: number; completed: number }>();
      for (const ms of milestones) {
        const pid = (ms.project_id as [number, string])?.[0];
        if (!pid) continue;
        const entry = msByProject.get(pid) ?? { total: 0, completed: 0 };
        entry.total += 1;
        if (ms.completed) entry.completed += 1;
        msByProject.set(pid, entry);
      }
      const slugToPid = new Map<string, number>();
      for (const row of odooData) {
        const pid = (row.id as number) ?? 0;
        const slug = row.x_slug as string;
        if (slug && pid) slugToPid.set(slug, pid);
      }
      for (const project of projects) {
        const pid = slugToPid.get(project.slug);
        if (pid && msByProject.has(pid)) {
          project.milestones = msByProject.get(pid)!;
        }
      }
    } catch (error) {
      const msg = 'Failed to batch-enrich projects with Odoo data';
      this.logger.warn({ msg, error: (error as Error).message });
      enrichmentError = msg;
    }

    const total = data.meta?.pagination?.total ?? data.data.length;
    return {
      total,
      projects,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
      ...(enrichmentError ? { _enrichmentError: enrichmentError } : {}),
    } as ProjectResponse & { _enrichmentError?: string };
  }

  async getProjectBySlug(slug: string, locale?: string): Promise<Project> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/portfolios`, {
        headers: this.cmsHeaders,
        params: {
          'populate': '*',
          'filters[slug][$eq]': slug,
          ...(locale ? { locale } : {}),
        },
      }),
    );

    const items = response.data.data;
    if (!items || items.length === 0) {
      throw new NotFoundException(`Project with slug "${slug}" not found`);
    }

    const project = this.mapProject(items[0]);

    const { enrichment, error } = await this.getOdooEnrichment(slug);
    if (enrichment) {
      if (enrichment.status) project.status = enrichment.status;
      if (enrichment.milestones) project.milestones = enrichment.milestones;
      if (enrichment.liveStatus) project.liveStatus = enrichment.liveStatus;
    }
    if (error) {
      (project as Project & { _enrichmentError?: string })._enrichmentError = error;
    }

    return project;
  }

  /**
   * Look up live Odoo status for a slug, with a Redis cache (5 min) and a hard
   * timeout so a slow/unreachable Odoo never blocks the public response.
   */
  private async getOdooEnrichment(
    slug: string,
  ): Promise<{ enrichment: OdooEnrichment | null; error?: string }> {
    const cacheKey = `${LIVE_STATUS_CACHE_PREFIX}${slug}`;

    try {
      const cached = await this.redisService.get<OdooEnrichment>(cacheKey);
      if (cached) return { enrichment: cached };
    } catch (error) {
      this.logger.debug(`Live-status cache read failed for ${slug}: ${(error as Error).message}`);
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const timeout = new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ODOO_ENRICHMENT_TIMEOUT_MS);
      });
      const fetchPromise = this.fetchOdooEnrichment(slug);
      // Swallow late rejections when the timeout wins the race below.
      fetchPromise.catch(() => undefined);
      const enrichment = await Promise.race([fetchPromise, timeout]);

      if (enrichment === null) {
        this.logger.debug(`Odoo enrichment skipped for ${slug} (timeout or no match)`);
        return { enrichment: null };
      }

      try {
        await this.redisService.set(cacheKey, enrichment, LIVE_STATUS_CACHE_TTL);
      } catch (error) {
        this.logger.debug(`Live-status cache write failed for ${slug}: ${(error as Error).message}`);
      }

      return { enrichment };
    } catch (error) {
      const msg = `Failed to enrich project ${slug} with Odoo data`;
      this.logger.warn({ msg, slug, error: (error as Error).message });
      return { enrichment: null, error: msg };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /** Fetch the Odoo project record and milestone progress for a slug. */
  private async fetchOdooEnrichment(slug: string): Promise<OdooEnrichment | null> {
    const odooData = await this.odooService.searchRead(
      'project.project',
      [['x_slug', '=', slug]],
      ['id', 'stage_id', 'x_hexa_status', 'write_date']
    );

    if (!odooData || odooData.length === 0) return null;

    const record = odooData[0];
    // In Odoo, stage_id is often [id, name]
    const stage = record.stage_id;
    const stageName = Array.isArray(stage)
      ? String(stage[1])
      : String((stage as Record<string, unknown>)?.name ?? '');

    const pid = record.id as number;
    const milestones = await this.odooService.searchRead(
      'project.milestone',
      [['project_id', '=', pid], ['x_hexa_client_viewable', '=', true]],
      ['id', 'completed']
    );
    const completed = milestones.filter((m) => m.completed).length;
    const total = milestones.length;

    const lastUpdate =
      typeof record.write_date === 'string' && record.write_date
        ? record.write_date
        : new Date().toISOString();

    return {
      status: stageName || undefined,
      milestones: { total, completed },
      liveStatus: {
        stage: stageName || String(record.x_hexa_status ?? 'unknown'),
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        lastUpdate,
      },
    };
  }

  private mapProject(item: Record<string, unknown>): Project {
    const attrs = (item.attributes ?? item) as Record<string, unknown>;
    return {
      id: String(item.id),
      title: attrs.title as string,
      slug: attrs.slug as string,
      description: attrs.description as string,
      shortDescription: attrs.shortDescription as string | undefined,
      coverImage: mapMedia(attrs.coverImage as StrapiRelation, this.cmsUrl) ?? '',
      category: mapCategory(attrs.category as StrapiRelation),
      modelUrl: attrs.modelUrl as string | undefined,
      hotspots: (attrs.hotspots as Array<Record<string, unknown>>)?.map((h) => ({
        id: h.id as string,
        title: h.title as string,
        description: h.description as string,
        position: h.position as [number, number, number],
        lookAt: h.lookAt as [number, number, number],
      })) ?? [],
      client: attrs.client as string | undefined,
      location: attrs.location as string | undefined,
      year: attrs.year as number | undefined,
      area: attrs.area as string | undefined,
      services: attrs.services as string[] | undefined,
      isPublished: (attrs.isPublished as boolean) ?? true,
      createdAt: (attrs.createdAt as string) ?? new Date().toISOString(),
      updatedAt: (attrs.updatedAt as string) ?? new Date().toISOString(),
    };
  }
}
