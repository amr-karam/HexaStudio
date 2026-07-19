import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '../storage/redis.service';
import { WebhookConfigService } from './webhook-config.service';
import type { WebhookEvent, WebhookConfig } from '@hexastudio/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OutboundRetryItem {
  webhookConfigId: string;
  name: string;
  url: string;
  headers?: Record<string, string>;
  body: unknown;
  attempts: number;
  lastError: string;
  enqueuedAt: string;
  nextRetryAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OUTBOUND_RETRY_KEY = 'outbound:webhook:retry';
const MAX_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 30_000;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class WebhookDispatcher {
  private readonly logger = new Logger(WebhookDispatcher.name);

  constructor(
    private readonly http: HttpService,
    private readonly configService: WebhookConfigService,
    private readonly redisService: RedisService,
  ) {}

  async dispatch(event: WebhookEvent, payload: unknown): Promise<void> {
    const configs = await this.configService.findByEvent(event);
    if (configs.length === 0) return;

    const body = { event, payload, timestamp: new Date().toISOString() };

    const results = await Promise.allSettled(
      configs.map((cfg) => this.deliver(cfg, body)),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    if (succeeded > 0) {
      this.logger.log(`Dispatched ${event} to ${succeeded}/${configs.length} webhooks`);
    }
  }

  /**
   * Attempt delivery to a single webhook URL.  On failure, enqueue the
   * request into the outbound retry queue so it gets a second chance.
   */
  private async deliver(cfg: WebhookConfig, body: unknown): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(cfg.url, body, {
          headers: {
            'Content-Type': 'application/json',
            ...cfg.headers,
          },
          timeout: 10_000,
        }),
      );
    } catch (error) {
      this.logger.error(`Webhook ${cfg.name} (${cfg.id}) failed: ${error}`);
      // Enqueue for retry (first attempt)
      await this.enqueueOutboundRetry(cfg, body, error);
    }
  }

  // -----------------------------------------------------------------------
  //  Outbound retry queue
  // -----------------------------------------------------------------------

  private async enqueueOutboundRetry(
    cfg: WebhookConfig,
    body: unknown,
    error: unknown,
  ): Promise<void> {
    const item: OutboundRetryItem = {
      webhookConfigId: cfg.id,
      name: cfg.name,
      url: cfg.url,
      headers: cfg.headers,
      body,
      attempts: 1,
      lastError: error instanceof Error ? error.message : String(error),
      enqueuedAt: new Date().toISOString(),
      nextRetryAt: new Date(Date.now() + BASE_BACKOFF_MS).toISOString(),
    };

    // Deduplicate by webhookConfigId (don't stack retries for the same config)
    const existing = await this.redisService.lrange<OutboundRetryItem>(
      OUTBOUND_RETRY_KEY,
      0,
      -1,
    );
    const deduped = existing.filter((e) => e.webhookConfigId !== cfg.id);
    deduped.push(item);

    await this.redisService.del(OUTBOUND_RETRY_KEY);
    for (const entry of deduped) {
      await this.redisService.lpush(OUTBOUND_RETRY_KEY, entry);
    }

    this.logger.warn(
      `Enqueued outbound webhook retry [1/${MAX_ATTEMPTS}] for ${cfg.name} (${cfg.url})`,
    );
  }

  /**
   * Sweep the outbound retry queue every 60 seconds.
   * Exponential back-off is applied between attempts.
   */
  @Cron('0 * * * * *')
  async processOutboundRetryQueue(): Promise<void> {
    const items = await this.redisService.lrange<OutboundRetryItem>(
      OUTBOUND_RETRY_KEY,
      0,
      -1,
    );
    if (items.length === 0) return;

    await this.redisService.del(OUTBOUND_RETRY_KEY);

    const now = Date.now();
    let processed = 0;
    let dropped = 0;

    for (const item of items) {
      const waitUntil = new Date(item.nextRetryAt).getTime();
      if (waitUntil > now) {
        // Not yet ready — push back
        await this.redisService.lpush(OUTBOUND_RETRY_KEY, item);
        continue;
      }

      try {
        await firstValueFrom(
          this.http.post(item.url, item.body, {
            headers: {
              'Content-Type': 'application/json',
              ...item.headers,
            },
            timeout: 10_000,
          }),
        );
        processed++;
        // Success — consumed
      } catch (error) {
        item.attempts++;
        item.lastError = error instanceof Error ? error.message : String(error);

        if (item.attempts >= MAX_ATTEMPTS) {
          dropped++;
          this.logger.error(
            `Dropped outbound webhook after ${item.attempts} failed attempts: ` +
              `${item.name} (${item.url}) — ${item.lastError}`,
          );
        } else {
          const delay = BASE_BACKOFF_MS * item.attempts;
          item.nextRetryAt = new Date(Date.now() + delay).toISOString();
          await this.redisService.lpush(OUTBOUND_RETRY_KEY, item);
        }
      }
    }

    if (processed > 0 || dropped > 0) {
      this.logger.log(
        `Outbound retry sweep: ${processed} delivered, ${dropped} dropped after max attempts`,
      );
    }
  }

  /** Current size of the outbound retry queue. */
  async getOutboundRetryQueueSize(): Promise<number> {
    try {
      return await this.redisService.llen(OUTBOUND_RETRY_KEY);
    } catch {
      return 0;
    }
  }
}
