import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '../storage/redis.service';
import { CurrencyService } from './currency.service';
import type { Env } from '../../config/env';

interface ExchangeRateApiResponse {
  result?: 'success' | 'error';
  provider?: string;
  documentation?: string;
  termsOfUse?: string;
  timeLastUpdateUtc?: string;
  timeNextUpdateUtc?: string;
  timeEx?: string;
  rates: Record<string, number>;
  base?: string;
}

interface OpenExchangeRatesResponse {
  disclaimer?: string;
  license?: string;
  timestamp?: number;
  base?: string;
  rates: Record<string, number>;
}

const REDIS_HASH_KEY = 'exchange_rates:latest';
const REDIS_LAST_SYNC_KEY = 'exchange_rates:last_sync';

@Injectable()
export class ExchangeRateSyncService implements OnModuleInit {
  private readonly logger = new Logger(ExchangeRateSyncService.name);
  private isSyncing = false;

  constructor(
    private readonly redis: RedisService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<Env>,
    private readonly currencyService: CurrencyService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Exchange rate sync service initialized — performing startup sync');
    await this.syncRates();
  }

  /** Scheduled sync — runs every 6 hours at minute 0 (cron: every 6 hours) */
  @Cron('0 */6 * * *')
  async syncRates(): Promise<void> {
    if (this.isSyncing) {
      this.logger.warn('Exchange rate sync already in progress — skipping');
      return;
    }

    this.isSyncing = true;
    const apiKey = this.configService.get('EXCHANGE_RATE_API_KEY');
    const apiUrl = this.configService.get('EXCHANGE_RATE_API_URL');

    // Determine the endpoint and response type based on config
    const { url, isOpenErApi } = this.buildEndpoint(apiKey, apiUrl);

    this.logger.log(`Starting exchange rate sync from ${url}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<ExchangeRateApiResponse | OpenExchangeRatesResponse>(url, {
          timeout: 15_000,
        }),
      );

      // Validate response based on provider
      if (isOpenErApi) {
        const erData = data as ExchangeRateApiResponse;
        if (erData.result !== 'success') {
          throw new Error(`open.er-api.com returned error result: ${JSON.stringify(data)}`);
        }
      }

      const rates = data.rates;
      if (!rates || Object.keys(rates).length === 0) {
        throw new Error('API returned empty rates object');
      }

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

      // Also update the in-memory rates in CurrencyService
      await this.currencyService.updateRatesFromSync(rates);

      this.logger.log(
        `Exchange rate sync completed: ${currencyCount} currencies synced at ${timestamp}`,
      );
    } catch (error) {
      this.logger.error(
        `Exchange rate sync failed: ${error instanceof Error ? error.message : String(error)} — falling back to existing rates`,
      );
      // Fallback: try to load whatever is in Redis already, or keep existing defaults
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Build the API endpoint URL based on configuration.
   *
   * Strategy:
   * 1. If EXCHANGE_RATE_API_KEY is set, use OpenExchangeRates with the key.
   * 2. If EXCHANGE_RATE_API_URL is explicitly provided (non-default), use it as-is.
   * 3. Otherwise, use the default free open.er-api.com endpoint (no key required).
   */
  private buildEndpoint(
    apiKey: string | undefined,
    apiUrl: string,
  ): { url: string; isOpenErApi: boolean } {
    const DEFAULT_ER_API = 'https://open.er-api.com/v6/latest/USD';

    if (apiKey) {
      // Upgrade path: OpenExchangeRates requires an API key
      return {
        url: `https://openexchangerates.org/api/latest.json?app_id=${encodeURIComponent(apiKey)}`,
        isOpenErApi: false,
      };
    }

    if (apiUrl !== DEFAULT_ER_API) {
      // Custom URL was provided in env
      return { url: apiUrl, isOpenErApi: false };
    }

    // Default: free open.er-api.com (no key required)
    return { url: DEFAULT_ER_API, isOpenErApi: true };
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
