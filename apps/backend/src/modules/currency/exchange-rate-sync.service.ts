import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RedisService } from '../storage/redis.service';

interface ExchangeRateApiResponse {
  result: 'success' | 'error';
  provider?: string;
  documentation?: string;
  termsOfUse?: string;
  timeLastUpdateUtc?: string;
  timeNextUpdateUtc?: string;
  timeEx?: string;
  rates: Record<string, number>;
}

const REDIS_HASH_KEY = 'exchange_rates:latest';
const REDIS_LAST_SYNC_KEY = 'exchange_rates:last_sync';

@Injectable()
export class ExchangeRateSyncService implements OnModuleInit {
  private readonly logger = new Logger(ExchangeRateSyncService.name);
  private readonly API_URL = 'https://open.er-api.com/v6/latest/USD';
  private isSyncing = false;

  constructor(private readonly redis: RedisService) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Exchange rate sync service initialized — performing startup sync');
    await this.syncRates();
  }

  /** Scheduled sync — runs every 6 hours at minute 0 (cron: 0 at-slash-6 * * *) */
  @Cron('0 */6 * * *')
  async syncRates(): Promise<void> {
    if (this.isSyncing) {
      this.logger.warn('Exchange rate sync already in progress — skipping');
      return;
    }

    this.isSyncing = true;
    this.logger.log('Starting exchange rate sync from open.er-api.com');

    try {
      // Use AbortController for timeout (compatible with ES2021 target)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);
      const response = await fetch(this.API_URL, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as ExchangeRateApiResponse;

      if (data.result !== 'success') {
        throw new Error(`API returned error result: ${JSON.stringify(data)}`);
      }

      const rates = data.rates;
      const currencyCount = Object.keys(rates).length;

      // Store each rate in the Redis hash: exchange_rates:latest
      // field = currency code (e.g. "EUR"), value = rate (e.g. 0.92)
      for (const [code, rate] of Object.entries(rates)) {
        await this.redis.hset(REDIS_HASH_KEY, code, rate);
      }

      // Store the last sync timestamp
      const timestamp = new Date().toISOString();
      await this.redis.set(REDIS_LAST_SYNC_KEY, timestamp);

      // Set TTL on the hash to auto-expire stale data after 25 hours
      // (6 hour sync × 4 runs + 1 hour buffer)
      await this.redis.expire(REDIS_HASH_KEY, 25 * 60 * 60);

      this.logger.log(
        `Exchange rate sync completed: ${currencyCount} currencies synced at ${timestamp}`,
      );
    } catch (error) {
      this.logger.error(
        `Exchange rate sync failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Get all cached exchange rates (USD-based) from the Redis hash.
   * Returns a flat record of currency code → rate (e.g. { EUR: 0.92, GBP: 0.79 }).
   */
  async getRates(): Promise<Record<string, number>> {
    try {
      const rates = await this.redis.hgetall<number>(REDIS_HASH_KEY);
      return rates ?? {};
    } catch (error) {
      this.logger.warn(
        `Failed to read cached rates from Redis: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {};
    }
  }

  /**
   * Get the timestamp of the last successful sync.
   */
  async getLastSyncTime(): Promise<string | null> {
    try {
      return await this.redis.get<string>(REDIS_LAST_SYNC_KEY);
    } catch {
      return null;
    }
  }
}
