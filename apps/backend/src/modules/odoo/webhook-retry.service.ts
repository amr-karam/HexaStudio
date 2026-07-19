import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RedisService } from '../storage/redis.service';
import { OdooSyncService } from './odoo-sync.service';
import { getEnv } from '../../config/env';
import type { OdooWebhookPayload } from '@hexastudio/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RetryItem extends Omit<OdooWebhookPayload, 'data'> {
  data?: Record<string, unknown>;
  attempts: number;
  lastError: string;
  enqueuedAt: string; // ISO 8601
  nextRetryAt: string; // ISO 8601 — earliest time this item may be retried
}

export interface DLQEntry extends RetryItem {
  failedAt: string; // ISO 8601 — when the item was moved to the DLQ
}

// ---------------------------------------------------------------------------
// Redis keys
// ---------------------------------------------------------------------------

const RETRY_QUEUE_KEY = 'odoo:webhook:retry';
const DLQ_KEY = 'odoo:webhook:dlq';

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Manages a Redis-backed retry queue with a dead-letter queue (DLQ) for Odoo
 * webhook processing failures.
 *
 * Architecture:
 *   - **Retry queue**: Redis List (`odoo:webhook:retry`) – strict FIFO
 *   - **Dead-letter queue**: Redis Sorted Set (`odoo:webhook:dlq`) scored by
 *     Unix-ms timestamp of when the entry failed permanently
 *   - **Sweeper**: a `@Cron` every 30 seconds drains the retry queue and
 *     either re-processes or escalates entries
 *
 * Exponential back-off is applied between retries (base = WEBHOOK_RETRY_BACKOFF_MS).
 */
@Injectable()
export class WebhookRetryService {
  private readonly logger = new Logger(WebhookRetryService.name);

  private get maxAttempts(): number {
    return getEnv().WEBHOOK_RETRY_MAX_ATTEMPTS;
  }

  private get backoffMs(): number {
    return getEnv().WEBHOOK_RETRY_BACKOFF_MS;
  }

  constructor(
    private readonly redisService: RedisService,

    @Inject(forwardRef(() => OdooSyncService))
    private readonly odooSyncService: OdooSyncService,
  ) {}

  // -----------------------------------------------------------------------
  //  Public API
  // -----------------------------------------------------------------------

  /**
   * Enqueue a failed webhook payload for later retry.
   * If it is already in the queue (same model + id + action) the existing
   * entry is updated in-place so we don't accumulate duplicates.
   */
  async enqueue(payload: OdooWebhookPayload, error: string): Promise<void> {
    const now = new Date().toISOString();
    const nextRetry = new Date(
      Date.now() + this.backoffMs,
    ).toISOString();

    const item: RetryItem = {
      model: payload.model,
      id: payload.id,
      action: payload.action,
      data: payload.data,
      attempts: 1,
      lastError: error,
      enqueuedAt: now,
      nextRetryAt: nextRetry,
    };

    // Deduplicate: if a pending item for the same model+id+action already
    // exists, update its attempts/error rather than appending a duplicate.
    await this.deduplicatePush(item);

    this.logger.warn(
      `Enqueued webhook retry [1/${this.maxAttempts}] for ${payload.model}:${payload.id} — ${error}`,
    );
  }

  /**
   * Drain the entire retry queue.  For each item:
   *  - if `nextRetryAt` is in the future → push back to the queue
   *  - otherwise attempt re-processing via `OdooSyncService.processRetryWebhook`
   *    - on success → item is dropped (done)
   *    - on failure → increment attempts; if ≥ MAX_ATTEMPTS move to DLQ,
   *      otherwise re-enqueue with updated back-off
   */
  async processRetryQueue(): Promise<void> {
    const items = await this.redisService.lrange<RetryItem>(
      RETRY_QUEUE_KEY,
      0,
      -1,
    );

    if (items.length === 0) return;

    // Atomically clear the queue — we will re-push items that are not yet
    // ready or that failed again.
    await this.redisService.del(RETRY_QUEUE_KEY);

    const now = Date.now();
    let processed = 0;
    let escalated = 0;

    for (const item of items) {
      // --- back-off guard --------------------------------------------------
      const waitUntil = new Date(item.nextRetryAt).getTime();
      if (waitUntil > now) {
        await this.redisService.lpush(RETRY_QUEUE_KEY, item);
        continue;
      }

      // --- attempt re-process ----------------------------------------------
      try {
        await this.odooSyncService.processRetryWebhook(item);
        processed++;
        // Success — item is consumed; do NOT re-push
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        item.attempts++;
        item.lastError = errMsg;

        if (item.attempts >= this.maxAttempts) {
          await this.moveToDLQ(item);
          escalated++;
        } else {
          // Exponential back-off: base × attempt
          const delay = this.backoffMs * item.attempts;
          item.nextRetryAt = new Date(Date.now() + delay).toISOString();
          await this.redisService.lpush(RETRY_QUEUE_KEY, item);
        }
      }
    }

    if (processed > 0 || escalated > 0) {
      this.logger.log(
        `Retry sweep: ${processed} processed, ${escalated} escalated to DLQ, ` +
          `${items.length - processed - escalated} still pending`,
      );
    }
  }

  // -----------------------------------------------------------------------
  //  Dead-Letter Queue
  // -----------------------------------------------------------------------

  /** Number of entries currently in the DLQ. */
  async getDLQSize(): Promise<number> {
    try {
      return await this.redisService.zcard(DLQ_KEY);
    } catch {
      return 0;
    }
  }

  /** Number of entries currently in the retry queue. */
  async getRetryQueueSize(): Promise<number> {
    try {
      return await this.redisService.llen(RETRY_QUEUE_KEY);
    } catch {
      return 0;
    }
  }

  /** Permanently delete every entry in the DLQ. */
  async flushDLQ(): Promise<void> {
    await this.redisService.del(DLQ_KEY);
    this.logger.warn('DLQ flushed — all entries permanently deleted');
  }

  /**
   * Move every DLQ entry back into the retry queue with reset attempt counters,
   * so they get a fresh chance at processing.
   * Returns the number of replayed entries.
   */
  async replayDLQ(): Promise<number> {
    const entries = await this.redisService.zrange(
      DLQ_KEY,
      0,
      -1,
    );

    if (entries.length === 0) return 0;

    // Remove all from DLQ
    await this.redisService.del(DLQ_KEY);

    for (const raw of entries) {
      const entry = JSON.parse(raw) as DLQEntry;
      const retryItem: RetryItem = {
        model: entry.model,
        id: entry.id,
        action: entry.action,
        data: entry.data,
        attempts: 0,
        lastError: `Replayed from DLQ — ${entry.lastError}`,
        enqueuedAt: new Date().toISOString(),
        nextRetryAt: new Date().toISOString(), // eligible immediately
      };
      await this.redisService.lpush(RETRY_QUEUE_KEY, retryItem);
    }

    this.logger.warn(`Replayed ${entries.length} items from DLQ back to retry queue`);
    return entries.length;
  }

  /**
   * Return DLQ entries, optionally filtered by `failedAt >= since`.
   */
  async getDLQEntries(since?: Date): Promise<DLQEntry[]> {
    const minScore = since ? since.getTime() : '-inf';
    const maxScore = '+inf';

    const raw = await this.redisService.zrangebyscore(
      DLQ_KEY,
      minScore,
      maxScore,
    );

    return raw.map((r) => JSON.parse(r) as DLQEntry);
  }

  // -----------------------------------------------------------------------
  //  Cron sweeper
  // -----------------------------------------------------------------------

  /** Run every 30 seconds. */
  @Cron('*/30 * * * * *')
  async retrySweeper(): Promise<void> {
    await this.processRetryQueue();
  }

  // -----------------------------------------------------------------------
  //  Internal helpers
  // -----------------------------------------------------------------------

  /**
   * Move an item that has exhausted its retries into the dead-letter set.
   * The score is the current Unix timestamp in milliseconds so entries are
   * naturally ordered by failure time.
   */
  private async moveToDLQ(item: RetryItem): Promise<void> {
    const dlqEntry: DLQEntry = {
      ...item,
      failedAt: new Date().toISOString(),
    };

    await this.redisService.zadd(
      DLQ_KEY,
      Date.now(),
      JSON.stringify(dlqEntry),
    );

    this.logger.error(
      `Webhook moved to DLQ after ${item.attempts} failed attempts: ` +
        `${item.model}:${item.id} — ${item.lastError}`,
    );
  }

  /**
   * Push to the retry queue, but deduplicate by model+id+action so the
   * queue doesn't accumulate stale entries for the same logical event.
   *
   * We achieve this by reading the whole queue, replacing any matching
   * entry, and writing it back.  Because the queue is small (< a few
   * hundred items) this is perfectly adequate.
   */
  private async deduplicatePush(item: RetryItem): Promise<void> {
    const existing = await this.redisService.lrange<RetryItem>(
      RETRY_QUEUE_KEY,
      0,
      -1,
    );

    const deduped = existing.filter(
      (e) => !(e.model === item.model && e.id === item.id && e.action === item.action),
    );

    deduped.push(item); // newest entry last (FIFO tail)

    // Rewrite the whole list
    await this.redisService.del(RETRY_QUEUE_KEY);
    for (const entry of deduped) {
      await this.redisService.lpush(RETRY_QUEUE_KEY, entry);
    }
  }
}
