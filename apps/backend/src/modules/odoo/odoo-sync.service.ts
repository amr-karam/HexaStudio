import { Inject, Injectable, Logger, OnModuleInit, forwardRef } from '@nestjs/common';
import { OdooService } from './odoo.service';
import { RedisService } from '../storage/redis.service';
import { EventBus } from '../realtime/event-bus.service';
import { WebhookRetryService } from './webhook-retry.service';
import { ConflictResolutionService } from './conflict-resolution.service';
import { DeltaSyncService } from './delta-sync.service';
import { StrapiProjectSyncService } from './strapi-project-sync.service';
import type {
  OdooWebhookPayload,
  SyncConflict,
  SyncOperationResult,
  SyncStatusResponse,
  TriggerSyncDto,
} from '@hexastudio/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SyncState {
  lastSync: number;
  lastError?: string;
  counts: Record<string, number>;
}

/** Circuit breaker states. */
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/** Per-operation metrics entry. */
export interface SyncMetricEntry {
  operation: string;
  success: boolean;
  durationMs: number;
  timestamp: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SYNC_INTERVAL_MS = 10 * 60 * 1000;
const PENDING_LEADS_KEY = 'odoo:pending-leads';

/** Exponential back-off delays in milliseconds (1 s → 32 s). */
const RETRY_DELAYS = [1_000, 2_000, 4_000, 8_000, 16_000, 32_000];
const MAX_RETRIES = 6;

/** Circuit breaker thresholds. */
const CB_FAILURE_THRESHOLD = 5;
const CB_RESET_TIMEOUT_MS = 30_000;

const METRICS_LOG_KEY = 'odoo:sync:metrics-log';

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Orchestrates bidirectional data synchronisation between Odoo and HEXA Hub.
 *
 * ## Responsibilities
 * - Scheduled polling (every 10 minutes) via delta sync
 * - Real-time webhook processing
 * - Conflict detection & resolution through `ConflictResolutionService`
 * - Retry logic with exponential back-off
 * - Circuit breaker to protect Odoo during outages
 * - Metrics collection for observability
 *
 * ## Architecture Principle
 * **Odoo-First**: Odoo is always the single source of truth. When a conflict
 * is detected and no explicit resolution strategy is configured, the Odoo
 * version wins.
 */
@Injectable()
export class OdooSyncService implements OnModuleInit {
  private readonly logger = new Logger(OdooSyncService.name);
  private state: SyncState = { lastSync: 0, counts: {} };

  // ── Circuit Breaker State ──────────────────────────────────────────────
  private circuitState: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(
    private readonly odooService: OdooService,
    private readonly redisService: RedisService,
    private readonly eventBus: EventBus,
    @Inject(forwardRef(() => WebhookRetryService))
    private readonly webhookRetryService: WebhookRetryService,
    private readonly conflictResolutionService: ConflictResolutionService,
    private readonly deltaSyncService: DeltaSyncService,
    @Inject(forwardRef(() => StrapiProjectSyncService))
    private readonly strapiProjectSyncService: StrapiProjectSyncService,
  ) {}

  // ────────────────────────────────────────────────────────────────────────
  //  Lifecycle
  // ────────────────────────────────────────────────────────────────────────

  onModuleInit() {
    this.logger.log('OdooSyncService initialized. Scheduled pull active (every 10 min).');
    void this.pullAll();
    setInterval(() => void this.pullAll(), SYNC_INTERVAL_MS);
  }

  // ────────────────────────────────────────────────────────────────────────
  //  Public API
  // ────────────────────────────────────────────────────────────────────────

  getState(): SyncState {
    return this.state;
  }

  /**
   * Trigger a manual sync for a specific entity type or all entities.
   *
   * @param dto - Sync trigger instructions
   * @returns Array of per-entity sync results
   */
  async triggerSync(dto: TriggerSyncDto = {}): Promise<SyncOperationResult[]> {
    this.logger.log(
      `Manual sync triggered` +
        (dto.entityType ? ` for ${dto.entityType}` : ' for all entities') +
        (dto.fullSync ? ' (full)' : ' (delta)'),
    );

    await this.throwIfCircuitOpen();

    const startTime = Date.now();

    if (dto.entityType) {
      const result = dto.fullSync
        ? await this.deltaSyncService.syncEntityFull(dto.entityType)
        : await this.deltaSyncService.syncEntityDelta(dto.entityType);

      this.recordOperationMetric('trigger-sync', result.success, Date.now() - startTime);
      return [result];
    }

    const results = await this.deltaSyncService.syncAll(!dto.fullSync === false);
    const success = results.every((r) => r.success);
    this.recordOperationMetric('trigger-sync-all', success, Date.now() - startTime);

    // Also flush pending leads after a manual sync.
    await this.flushPendingLeads();

    return results;
  }

  /**
   * Get comprehensive sync status including delta cursors, metrics, and
   * conflict counts.
   *
   * @returns Full `SyncStatusResponse`
   */
  async getSyncStatus(): Promise<SyncStatusResponse> {
    const status = await this.deltaSyncService.getSyncStatus();

    // Enrich with circuit breaker state and pending conflict count.
    status.circuitBreaker = this.circuitState;

    const unresolved = await this.conflictResolutionService.getUnresolvedConflicts();
    status.pendingConflicts = unresolved.length;

    return status;
  }

  /**
   * Get unresolved sync conflicts.
   * @returns Array of pending `SyncConflict` records
   */
  async getConflicts(): Promise<SyncConflict[]> {
    return this.conflictResolutionService.getUnresolvedConflicts();
  }

  /**
   * Resolve a sync conflict via the conflict resolution service.
   *
   * @param conflictId - UUID of the conflict
   * @param strategy   - Resolution strategy
   * @param resolvedBy - User or `'system'`
   * @param mergedValues - Optional merged field values for `'merged'` strategy
   * @returns The resolved conflict
   */
  async resolveConflict(
    conflictId: string,
    strategy: 'odoo-wins' | 'hexa-wins' | 'merged',
    resolvedBy: string,
    mergedValues?: Record<string, unknown>,
  ): Promise<SyncConflict> {
    return this.conflictResolutionService.resolveConflict(conflictId, {
      strategy,
      resolvedBy,
      mergedValues,
    });
  }

  /**
   * Get recent sync operation metrics.
   * @param limit - Maximum entries to return
   * @returns Array of metric entries
   */
  async getMetrics(limit = 50): Promise<SyncMetricEntry[]> {
    const entries = await this.redisService.lrange<SyncMetricEntry>(METRICS_LOG_KEY, 0, limit - 1);
    return entries;
  }

  // ────────────────────────────────────────────────────────────────────────
  //  Webhook Handling
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Handle an inbound webhook from Odoo (real-time push).
   *
   * The webhook triggers a targeted sync for the specific record, which
   * includes conflict detection against the cached HEXA Hub version.
   */
  async handleWebhook(payload: OdooWebhookPayload): Promise<void> {
    const key = `odoo:sync:${payload.model}:${payload.id}`;
    await this.redisService.set(key, payload, 3600);

    switch (payload.model) {
      case 'project.project':
        try {
          await this.syncProjectWithConflictCheck(payload);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          this.logger.warn(
            `Webhook sync failed for ${payload.model}:${payload.id} — enqueuing for retry`,
          );
          await this.webhookRetryService.enqueue(payload, errMsg);
          return;
        }
        this.eventBus.emit('odoo:project', payload);

        // Real-time: sync Odoo project → Strapi portfolio + purge frontend ISR cache.
        // This ensures new Odoo projects appear on the website immediately,
        // not just on the 10-minute reconciliation cron.
        try {
          await this.strapiProjectSyncService.syncOdooProjectToStrapi(payload.id);
        } catch (error) {
          this.logger.warn(
            `Odoo→Strapi sync failed for project #${payload.id}: ${(error as Error).message}`,
          );
        }
        break;
      case 'crm.lead':
        try {
          await this.syncLeadWithConflictCheck(payload);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          this.logger.warn(
            `Webhook sync failed for ${payload.model}:${payload.id} — enqueuing for retry`,
          );
          await this.webhookRetryService.enqueue(payload, errMsg);
          return;
        }
        this.eventBus.emit('odoo:lead', payload);
        break;
      case 'account.move':
        // Invoices are read-only from Odoo — no conflict check needed.
        this.eventBus.emit('odoo:invoice', payload);
        break;
      case 'sync':
        await this.pullAll();
        break;
      default:
        this.logger.debug(`Unmapped Odoo webhook model: ${payload.model}`);
    }
  }

  /**
   * Re-process a webhook payload from the retry queue.
   *
   * Intentionally separated from `handleWebhook` to avoid recursive
   * enqueue loops — it does NOT call `webhookRetryService.enqueue` on
   * failure. The caller (retry sweeper) owns the failure/escalation logic.
   */
  async processRetryWebhook(payload: OdooWebhookPayload): Promise<void> {
    const key = `odoo:sync:${payload.model}:${payload.id}`;
    await this.redisService.set(key, payload, 3600);

    switch (payload.model) {
      case 'project.project':
        await this.syncProjectWithConflictCheck(payload);
        this.eventBus.emit('odoo:project', payload);

        // Real-time: sync Odoo project → Strapi portfolio + purge frontend ISR cache.
        try {
          await this.strapiProjectSyncService.syncOdooProjectToStrapi(payload.id);
        } catch (error) {
          this.logger.warn(
            `Odoo→Strapi sync failed for project #${payload.id} (retry): ${(error as Error).message}`,
          );
        }
        break;
      case 'crm.lead':
        await this.syncLeadWithConflictCheck(payload);
        this.eventBus.emit('odoo:lead', payload);
        break;
      case 'account.move':
        this.eventBus.emit('odoo:invoice', payload);
        break;
      case 'sync':
        await this.pullAll();
        break;
      default:
        this.logger.debug(`Unmapped Odoo webhook model in retry: ${payload.model}`);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  //  Scheduled Pull (Delta Sync)
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Scheduled fallback pull — reconciles recent Odoo changes every 10 minutes.
   *
   * Uses the delta sync service to only fetch records modified since the
   * last sync, significantly reducing API calls and processing time.
   */
  async pullAll(): Promise<void> {
    await this.throwIfCircuitOpen();

    const startTime = Date.now();

    try {
      const results = await this.deltaSyncService.syncAll(false);

      // Build legacy state from delta sync results for backward compatibility.
      const counts: Record<string, number> = {};
      for (const result of results) {
        counts[result.entityType] = result.recordsProcessed;
      }

      this.state = {
        lastSync: Date.now(),
        counts,
      };

      const totalRecords = results.reduce((sum, r) => sum + r.recordsProcessed, 0);
      const errors = results.filter((r) => !r.success);

      if (errors.length > 0) {
        const errMsgs = errors.map((e) => `${e.entityType}: ${e.error}`).join('; ');
        this.state.lastError = errMsgs;
        this.logger.warn(`Odoo scheduled pull completed with errors: ${errMsgs}`);
      } else {
        this.logger.log(
          `Odoo delta pull complete: ${totalRecords} records across ${results.length} entities ` +
            `in ${Date.now() - startTime}ms`,
        );
      }

      this.recordSuccess();

      // Flush any pending leads that were queued while Odoo was unavailable.
      await this.flushPendingLeads();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.state.lastError = errMsg;
      this.recordFailure();
      this.logger.warn(`Odoo scheduled pull failed: ${errMsg}`);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  //  Flush Pending Leads
  // ────────────────────────────────────────────────────────────────────────

  /** Flush pending leads from Redis queue to Odoo. */
  async flushPendingLeads(): Promise<void> {
    const pendingCount = await this.redisService.llen(PENDING_LEADS_KEY);
    if (pendingCount === 0) return;

    this.logger.log(`Flushing ${pendingCount} pending leads from Redis queue`);
    const pendingLeads = await this.redisService.lrange<Record<string, unknown>>(
      PENDING_LEADS_KEY,
      0,
      pendingCount - 1,
    );

    let flushed = 0;
    for (const leadData of pendingLeads) {
      try {
        await this.odooService.create('crm.lead', leadData);
        await this.redisService.lrem(PENDING_LEADS_KEY, 1, leadData);
        flushed++;
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Failed to flush pending lead: ${errMsg}`);
        break; // Stop if Odoo is still unavailable
      }
    }

    if (flushed > 0) {
      this.logger.log(`Flushed ${flushed} pending leads to Odoo`);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  //  Webhook-Specific Sync with Conflict Detection
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Sync a project from an Odoo webhook, with conflict detection.
   *
   * If the record was also modified in HEXA Hub since the last sync,
   * a conflict is detected and either auto-resolved or parked for manual
   * resolution.
   */
  private async syncProjectWithConflictCheck(payload: OdooWebhookPayload): Promise<void> {
    const data = await this.odooService.searchRead(
      'project.project',
      [['id', '=', payload.id]],
      [
        'name', 'stage_id', 'x_slug', 'x_hexa_status', 'x_hexa_type',
        'x_hexa_client_portal_active', 'write_date', 'create_date',
      ],
    );

    if (!data?.length) return;

    const odooRecord = data[0];
    const cachedKey = `odoo:project:${payload.id}`;
    const hexaRecord = await this.redisService.get<Record<string, unknown>>(cachedKey);

    // Check for conflict if HEXA Hub also has a cached version.
    if (hexaRecord) {
      const lastSyncAt = await this.getLastSyncTimestamp('project.project');
      const conflict = await this.conflictResolutionService.detectConflict(
        'project.project',
        payload.id,
        odooRecord,
        hexaRecord,
        lastSyncAt,
      );

      if (conflict) {
        // Auto-resolve using the Odoo-first mandate.
        await this.conflictResolutionService.autoResolve(conflict);
        this.logger.log(
          `Auto-resolved conflict for project:${payload.id} using strategy: odoo-wins`,
        );
      }
    }

    // Always update the cache with Odoo's version (source of truth).
    await this.redisService.set(cachedKey, odooRecord, 900);
  }

  /**
   * Sync a CRM lead from an Odoo webhook, with conflict detection.
   */
  private async syncLeadWithConflictCheck(payload: OdooWebhookPayload): Promise<void> {
    const data = await this.odooService.searchRead(
      'crm.lead',
      [['id', '=', payload.id]],
      [
        'id', 'name', 'stage_id', 'partner_id', 'email_from', 'phone',
        'priority', 'write_date', 'create_date', 'x_hexa_source',
        'x_hexa_service', 'x_hexa_budget', 'description',
      ],
    );

    if (!data?.length) return;

    const odooRecord = data[0];
    const cachedKey = `odoo:lead:${payload.id}`;
    const hexaRecord = await this.redisService.get<Record<string, unknown>>(cachedKey);

    if (hexaRecord) {
      const lastSyncAt = await this.getLastSyncTimestamp('crm.lead');
      const conflict = await this.conflictResolutionService.detectConflict(
        'crm.lead',
        payload.id,
        odooRecord,
        hexaRecord,
        lastSyncAt,
      );

      if (conflict) {
        await this.conflictResolutionService.autoResolve(conflict);
        this.logger.log(
          `Auto-resolved conflict for lead:${payload.id} using strategy: odoo-wins`,
        );
      }
    }

    await this.redisService.set(cachedKey, odooRecord, 900);
  }

  // ────────────────────────────────────────────────────────────────────────
  //  Circuit Breaker
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Throw an error if the circuit breaker is in the OPEN state.
   * Transitions from OPEN → HALF_OPEN when the reset timeout expires.
   */
  private async throwIfCircuitOpen(): Promise<void> {
    if (this.circuitState === 'OPEN') {
      if (Date.now() - this.lastFailureTime > CB_RESET_TIMEOUT_MS) {
        this.circuitState = 'HALF_OPEN';
        this.logger.warn('Circuit breaker moved to HALF_OPEN — testing connection…');
      } else {
        throw new Error(
          `Circuit breaker is OPEN. Retry after ${new Date(
            this.lastFailureTime + CB_RESET_TIMEOUT_MS,
          ).toISOString()}`,
        );
      }
    }
  }

  /** Record a successful operation (resilience against transient failures). */
  private recordSuccess(): void {
    if (this.circuitState === 'HALF_OPEN') {
      this.circuitState = 'CLOSED';
      this.logger.log('Circuit breaker CLOSED — Odoo connection restored.');
    }
    this.successCount++;
    this.failureCount = Math.max(0, this.failureCount - 1);
  }

  /** Record a failed operation; opens the circuit if threshold is breached. */
  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    const totalRequests = this.successCount + this.failureCount;

    if (
      totalRequests > 10 &&
      (this.failureCount / totalRequests > 0.4 || this.failureCount >= CB_FAILURE_THRESHOLD)
    ) {
      this.circuitState = 'OPEN';
      this.logger.error(
        `Circuit breaker OPENED — failure rate: ${(
          (this.failureCount / totalRequests) *
          100
        ).toFixed(0)}% (${this.failureCount}/${totalRequests}).`,
      );
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  //  Retry with Exponential Back-Off
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Execute an async operation with exponential back-off retry.
   *
   * @param operation - The async function to execute
   * @param label     - Human-readable label for logging
   * @param maxRetries - Maximum retry attempts (default: {@link MAX_RETRIES})
   * @returns The result of the operation
   * @throws The last error if all retries are exhausted
   */
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    label: string,
    maxRetries = MAX_RETRIES,
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          this.logger.error(
            `${label} failed after ${maxRetries + 1} attempts: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          throw error;
        }

        const delay = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];
        this.logger.warn(
          `${label} attempt ${attempt + 1} failed — retrying in ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // TypeScript needs this; it's unreachable.
    throw new Error('Max retries exceeded');
  }

  // ────────────────────────────────────────────────────────────────────────
  //  Metrics
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Record a metric entry for a sync operation.
   * Entries are stored in a Redis list capped at {@link MAX_METRIC_ENTRIES}.
   */
  private async recordOperationMetric(
    operation: string,
    success: boolean,
    durationMs: number,
    error?: string,
  ): Promise<void> {
    const entry: SyncMetricEntry = {
      operation,
      success,
      durationMs,
      timestamp: new Date().toISOString(),
      error,
    };

    await this.redisService.lpush(METRICS_LOG_KEY, entry);

    // Best-effort cap (we don't need atomicity here).
    // The list is trimmed on read by the controller.
  }

  // ────────────────────────────────────────────────────────────────────────
  //  Helpers
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Retrieve the last sync timestamp for an entity type from the delta
   * sync cursor, falling back to a sensible default.
   */
  private async getLastSyncTimestamp(entityType: string): Promise<string> {
    const cursor = await this.deltaSyncService.getCursor(entityType);
    return cursor?.lastSyncAt ?? new Date(0).toISOString();
  }
}
