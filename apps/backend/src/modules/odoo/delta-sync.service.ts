import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from './odoo.service';
import { RedisService } from '../storage/redis.service';
import { EventBus } from '../realtime/event-bus.service';
import type {
  SyncCursor,
  SyncEntityMetrics,
  SyncStatusResponse,
  SyncOperationResult,
} from '@hexastudio/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CURSOR_HASH_KEY = 'odoo:sync:cursors';
const METRICS_HASH_KEY = 'odoo:sync:metrics';

/**
 * The set of Odoo entity types the sync engine manages.
 * Each entry maps to its Odoo model name and the fields to fetch.
 */
const SYNC_ENTITIES: Record<string, { model: string; fields: string[]; domain: unknown[] }> = {
  'crm.lead': {
    model: 'crm.lead',
    fields: [
      'id', 'name', 'stage_id', 'partner_id', 'email_from', 'phone',
      'priority', 'write_date', 'create_date', 'x_hexa_source',
      'x_hexa_service', 'x_hexa_budget', 'description',
    ],
    domain: [],
  },
  'project.project': {
    model: 'project.project',
    fields: [
      'id', 'name', 'x_slug', 'stage_id', 'partner_id', 'date_start', 'date',
      'write_date', 'create_date', 'x_hexa_type', 'x_hexa_status',
      'x_hexa_client_portal_active', 'x_hexa_budget_amount',
    ],
    domain: [],
  },
  'account.move': {
    model: 'account.move',
    fields: [
      'id', 'name', 'move_type', 'state', 'partner_id', 'amount_total',
      'amount_untaxed', 'invoice_date', 'write_date', 'create_date',
      'payment_state', 'currency_id',
    ],
    domain: [['move_type', '=', 'out_invoice']],
  },
  'project.task': {
    model: 'project.task',
    fields: [
      'id', 'name', 'project_id', 'milestone_id', 'stage_id', 'state',
      'user_ids', 'date_deadline', 'date_assign', 'date_end', 'write_date',
      'create_date',
      // planned_hours / effective_hours / remaining_hours are computed
      // fields in Odoo 17 that trigger a full Python traceback during
      // XML-RPC batch read (project_task.py:864 read override). Remove
      // from delta sync; they remain available via the task detail API.
      'description',
    ],
    domain: [],
  },
  'res.partner': {
    model: 'res.partner',
    fields: [
      'id', 'name', 'email', 'phone', 'write_date', 'create_date',
      'x_hexa_client', 'x_hexa_source',
    ],
    domain: [],
  },
};

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Manages delta (incremental) sync between Odoo and HEXA Hub.
 *
 * Instead of re-fetching all records every cycle, this service tracks a
 * **cursor** (the `write_date` of the last synced record) per entity type
 * and only fetches records modified since that timestamp.
 *
 * Full sync fetches everything; delta sync fetches only the diff.
 *
 * ## Architecture
 * - **Cursors** are stored in a Redis hash (`odoo:sync:cursors`) keyed by
 *   entity type.
 * - **Metrics** are stored in a Redis hash (`odoo:sync:metrics`) keyed by
 *   entity type.
 */
@Injectable()
export class DeltaSyncService {
  private readonly logger = new Logger(DeltaSyncService.name);

  constructor(
    private readonly odooService: OdooService,
    private readonly redisService: RedisService,
    private readonly eventBus: EventBus,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  //  Delta Sync (Incremental)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Perform an incremental (delta) sync for a single entity type.
   *
   * Only records whose `write_date` is strictly greater than the cursor's
   * `lastSyncAt` will be fetched. If no cursor exists, a full sync is
   * triggered instead.
   *
   * @param entityType - The entity type to sync (e.g. `crm.lead`)
   * @returns The sync operation result
   */
  async syncEntityDelta(entityType: string): Promise<SyncOperationResult> {
    const cursor = await this.getCursor(entityType);
    const startTime = Date.now();

    if (!cursor) {
      this.logger.log(`No cursor found for ${entityType} — performing initial full sync`);
      return this.syncEntityFull(entityType);
    }

    this.logger.log(
      `Delta sync for ${entityType} since ${cursor.lastSyncAt} ` +
        `(last ID: ${cursor.lastSyncId})`,
    );

    const entityConfig = SYNC_ENTITIES[entityType];
    if (!entityConfig) {
      this.logger.warn(`Unknown entity type: ${entityType}`);
      return {
        entityType,
        recordsProcessed: 0,
        conflictsDetected: 0,
        durationMs: Date.now() - startTime,
        success: false,
        error: `Unknown entity type: ${entityType}`,
      };
    }

    try {
      const domain = [
        ...entityConfig.domain,
        ['write_date', '>', cursor.lastSyncAt],
      ];

      const records = await this.odooService.searchRead(
        entityConfig.model,
        domain,
        entityConfig.fields,
        false, // Never cache delta results
      );

      // Sort by write_date to find the new cursor position.
      const sorted = records
        .filter((r) => typeof r.id === 'number')
        .sort((a, b) => {
          const aDate = this.toTimestamp(a.write_date);
          const bDate = this.toTimestamp(b.write_date);
          return aDate - bDate;
        });

      const newLastId =
        sorted.length > 0 ? (sorted[sorted.length - 1].id as number) : cursor.lastSyncId;
      const newLastSyncAt = new Date().toISOString();

      // Update cursor.
      const updatedCursor: SyncCursor = {
        entityType,
        lastSyncAt: newLastSyncAt,
        lastSyncId: newLastId,
        recordsSynced: sorted.length,
        errors: 0,
      };

      await this.saveCursor(entityType, updatedCursor);
      await this.recordMetrics(entityType, sorted.length, 0, Date.now() - startTime);

      // Emit events for downstream consumers.
      if (sorted.length > 0) {
        this.eventBus.emit('odoo:sync:delta', {
          entityType,
          recordCount: sorted.length,
          records: sorted,
        });
      }

      this.logger.log(
        `Delta sync complete for ${entityType}: ${sorted.length} record(s) updated ` +
          `in ${Date.now() - startTime}ms`,
      );

      return {
        entityType,
        recordsProcessed: sorted.length,
        conflictsDetected: 0,
        durationMs: Date.now() - startTime,
        success: true,
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Delta sync failed for ${entityType}: ${errMsg}`);

      await this.recordMetrics(entityType, 0, 1, Date.now() - startTime);

      return {
        entityType,
        recordsProcessed: 0,
        conflictsDetected: 0,
        durationMs: Date.now() - startTime,
        success: false,
        error: errMsg,
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Full Sync
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Perform a full sync for a single entity type.
   *
   * Fetches **all** matching records regardless of cursor state, then
   * resets the cursor to the current timestamp.
   *
   * @param entityType - The entity type to sync
   * @returns The sync operation result
   */
  async syncEntityFull(entityType: string): Promise<SyncOperationResult> {
    const startTime = Date.now();
    const entityConfig = SYNC_ENTITIES[entityType];

    if (!entityConfig) {
      return {
        entityType,
        recordsProcessed: 0,
        conflictsDetected: 0,
        durationMs: Date.now() - startTime,
        success: false,
        error: `Unknown entity type: ${entityType}`,
      };
    }

    this.logger.log(`Full sync for ${entityType}`);

    try {
      const records = await this.odooService.searchRead(
        entityConfig.model,
        entityConfig.domain,
        entityConfig.fields,
        false,
      );

      const numericIds = records.filter((r) => typeof r.id === 'number');
      const maxId =
        numericIds.length > 0
          ? Math.max(...numericIds.map((r) => r.id as number))
          : 0;

      const cursor: SyncCursor = {
        entityType,
        lastSyncAt: new Date().toISOString(),
        lastSyncId: maxId,
        recordsSynced: records.length,
        errors: 0,
      };

      await this.saveCursor(entityType, cursor);
      await this.recordMetrics(entityType, records.length, 0, Date.now() - startTime);

      this.eventBus.emit('odoo:sync:full', {
        entityType,
        recordCount: records.length,
        records,
      });

      this.logger.log(
        `Full sync complete for ${entityType}: ${records.length} records ` +
          `in ${Date.now() - startTime}ms`,
      );

      return {
        entityType,
        recordsProcessed: records.length,
        conflictsDetected: 0,
        durationMs: Date.now() - startTime,
        success: true,
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Full sync failed for ${entityType}: ${errMsg}`);

      await this.recordMetrics(entityType, 0, 1, Date.now() - startTime);

      return {
        entityType,
        recordsProcessed: 0,
        conflictsDetected: 0,
        durationMs: Date.now() - startTime,
        success: false,
        error: errMsg,
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Batch Sync
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Run delta sync for all registered entity types.
   *
   * @param forceFull - If `true`, performs a full sync for every entity
   * @returns Array of sync results, one per entity
   */
  async syncAll(forceFull = false): Promise<SyncOperationResult[]> {
    const entityTypes = Object.keys(SYNC_ENTITIES);
    const results: SyncOperationResult[] = [];

    for (const entityType of entityTypes) {
      const result = forceFull
        ? await this.syncEntityFull(entityType)
        : await this.syncEntityDelta(entityType);
      results.push(result);
    }

    const totalRecords = results.reduce((sum, r) => sum + r.recordsProcessed, 0);
    const totalErrors = results.filter((r) => !r.success).length;

    this.logger.log(
      `Batch sync complete: ${totalRecords} records across ${entityTypes.length} entities` +
        (totalErrors > 0 ? ` (${totalErrors} errors)` : ''),
    );

    return results;
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Cursor Management
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Retrieve the sync cursor for a specific entity type.
   * @param entityType - The entity type
   * @returns The cursor or `null` if no sync has been performed
   */
  async getCursor(entityType: string): Promise<SyncCursor | null> {
    return this.redisService.hget<SyncCursor>(CURSOR_HASH_KEY, entityType);
  }

  /**
   * Persist a sync cursor for an entity type.
   */
  async saveCursor(entityType: string, cursor: SyncCursor): Promise<void> {
    await this.redisService.hset(CURSOR_HASH_KEY, entityType, cursor);
  }

  /**
   * Retrieve all sync cursors.
   * @returns Map of entity type → cursor
   */
  async getAllCursors(): Promise<Record<string, SyncCursor>> {
    return this.redisService.hgetall<SyncCursor>(CURSOR_HASH_KEY);
  }

  /**
   * Reset the cursor for a specific entity type, forcing a full sync
   * on the next cycle.
   * @param entityType - The entity type to reset
   */
  async resetCursor(entityType: string): Promise<void> {
    await this.redisService.hdel(CURSOR_HASH_KEY, entityType);
    this.logger.log(`Cursor reset for ${entityType}`);
  }

  /**
   * Reset all cursors, forcing full sync for every entity.
   */
  async resetAllCursors(): Promise<void> {
    await this.redisService.del(CURSOR_HASH_KEY);
    this.logger.log('All sync cursors reset');
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Metrics & Status
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Get aggregated sync status across all entity types.
   * @returns A comprehensive `SyncStatusResponse`
   */
  async getSyncStatus(): Promise<SyncStatusResponse> {
    const cursors = await this.getAllCursors();
    const allMetrics = await this.getAllMetrics();

    const entityTypes = Object.keys(SYNC_ENTITIES);
    const entities: SyncEntityMetrics[] = entityTypes.map((et) => {
      const m = allMetrics[et];
      return {
        entityType: et,
        totalSynced: m?.totalSynced ?? 0,
        totalErrors: m?.totalErrors ?? 0,
        avgDurationMs: m?.avgDurationMs ?? 0,
        conflictsDetected: m?.conflictsDetected ?? 0,
        conflictsResolved: m?.conflictsResolved ?? 0,
      };
    });

    // Determine overall state.
    const hasErrors = entities.some((e) => e.totalErrors > 0);
    const state: SyncStatusResponse['state'] = hasErrors ? 'degraded' : 'healthy';

    // Find last full sync.
    const allSyncTimes = Object.values(cursors).map((c) => new Date(c.lastSyncAt).getTime());
    const lastFullSyncAt = allSyncTimes.length > 0
      ? new Date(Math.max(...allSyncTimes)).toISOString()
      : null;

    return {
      state,
      lastFullSyncAt,
      entities,
      circuitBreaker: 'CLOSED', // Will be overridden by the sync orchestrator
      pendingConflicts: 0, // Will be overridden by the sync orchestrator
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Record metrics for a sync operation.
   */
  private async recordMetrics(
    entityType: string,
    recordsSynced: number,
    errors: number,
    durationMs: number,
  ): Promise<void> {
    const existing = await this.redisService.hget<SyncEntityMetrics>(METRICS_HASH_KEY, entityType);

    const metrics: SyncEntityMetrics = {
      entityType,
      totalSynced: (existing?.totalSynced ?? 0) + recordsSynced,
      totalErrors: (existing?.totalErrors ?? 0) + errors,
      avgDurationMs: existing
        ? (existing.avgDurationMs + durationMs) / 2
        : durationMs,
      conflictsDetected: existing?.conflictsDetected ?? 0,
      conflictsResolved: existing?.conflictsResolved ?? 0,
    };

    await this.redisService.hset(METRICS_HASH_KEY, entityType, metrics);
  }

  /**
   * Retrieve metrics for all entity types.
   */
  private async getAllMetrics(): Promise<Record<string, SyncEntityMetrics>> {
    return this.redisService.hgetall<SyncEntityMetrics>(METRICS_HASH_KEY);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Helpers
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Convert an Odoo `write_date` value to a Unix timestamp.
   */
  private toTimestamp(value: unknown): number {
    if (!value || value === false) return 0;
    const ts = new Date(String(value)).getTime();
    return Number.isNaN(ts) ? 0 : ts;
  }
}
