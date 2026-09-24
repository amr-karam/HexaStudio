import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { Env } from '../../config/env';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hitCount: number;
}

interface CacheStats {
  totalEntries: number;
  hitRate: number;
  memoryUsage: number;
  topKeys: Array<{ key: string; hits: number }>;
}

/**
 * Generic data cache service with Redis + local fallback.
 * Used for hot-path data that doesn't change frequently:
 * - Project listings
 * - CMS content
 * - Configuration data
 * - Computed metrics
 */
@Injectable()
export class DataCacheService {
  private readonly logger = new Logger(DataCacheService.name);
  private redis: Redis | null = null;
  private localCache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly defaultTTL = 300; // 5 minutes
  private readonly useLocalCache = true;

  constructor(private configService: ConfigService<Env>) {
    try {
      this.redis = new Redis({
        host: this.configService.get('REDIS_HOST', 'redis'),
        port: this.configService.get('REDIS_PORT', 6379),
        password: this.configService.get('REDIS_PASSWORD'),
        db: 3, // Separate DB for data cache
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.error('Redis connection failed after 3 retries, using local cache');
            return null;
          }
          return Math.min(times * 100, 3000);
        },
      });

      this.redis.on('error', (error) => {
        this.logger.warn(`Redis error, falling back to local cache: ${error.message}`);
        this.redis = null;
      });

      this.redis.on('connect', () => {
        this.logger.log('Redis connected for data caching');
      });
    } catch (error) {
      this.logger.warn(`Redis initialization failed, using local cache: ${error}`);
      this.redis = null;
    }
  }

  /**
   * Generate cache key from prefix and parameters
   */
  private generateKey(prefix: string, params: Record<string, unknown>): string {
    const paramStr = JSON.stringify(params, Object.keys(params).sort());
    return `data:${prefix}:${Buffer.from(paramStr).toString('base64')}`;
  }

  /**
   * Get cached value
   */
  async get<T>(prefix: string, params: Record<string, unknown>): Promise<T | null> {
    const key = this.generateKey(prefix, params);

    try {
      if (this.redis) {
        const cached = await this.redis.get(key);
        if (cached) {
          const entry: CacheEntry<T> = JSON.parse(cached);
          entry.hitCount++;
          await this.redis.set(key, JSON.stringify(entry), 'EX', entry.ttl);
          return entry.data;
        }
      } else if (this.useLocalCache) {
        const entry = this.localCache.get(key) as CacheEntry<T> | undefined;
        if (entry && Date.now() - entry.timestamp < entry.ttl * 1000) {
          entry.hitCount++;
          return entry.data;
        }
      }
    } catch (error) {
      this.logger.error(`Cache get error for ${prefix}: ${error}`);
    }

    return null;
  }

  /**
   * Set cached value
   */
  async set<T>(
    prefix: string,
    params: Record<string, unknown>,
    data: T,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    const key = this.generateKey(prefix, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hitCount: 0,
    };

    try {
      if (this.redis) {
        await this.redis.set(key, JSON.stringify(entry), 'EX', ttl);
      } else if (this.useLocalCache) {
        this.localCache.set(key, entry);
      }
    } catch (error) {
      this.logger.error(`Cache set error for ${prefix}: ${error}`);
    }
  }

  /**
   * Invalidate cache by prefix
   */
  async invalidate(prefix: string): Promise<void> {
    try {
      if (this.redis) {
        const pattern = `data:${prefix}:*`;
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          this.logger.log(`Invalidated ${keys.length} cache entries for ${prefix}`);
        }
      } else if (this.useLocalCache) {
        const pattern = `data:${prefix}:`;
        let invalidated = 0;
        for (const key of this.localCache.keys()) {
          if (key.startsWith(pattern)) {
            this.localCache.delete(key);
            invalidated++;
          }
        }
        this.logger.log(`Invalidated ${invalidated} local cache entries for ${prefix}`);
      }
    } catch (error) {
      this.logger.error(`Cache invalidation error for ${prefix}: ${error}`);
    }
  }

  /**
   * Clear all data cache
   */
  async clear(): Promise<void> {
    try {
      if (this.redis) {
        const pattern = 'data:*';
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          this.logger.log(`Cleared ${keys.length} data cache entries`);
        }
      } else if (this.useLocalCache) {
        const count = this.localCache.size;
        this.localCache.clear();
        this.logger.log(`Cleared ${count} local data cache entries`);
      }
    } catch (error) {
      this.logger.error(`Cache clear error: ${error}`);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const redis = this.redis;
      if (redis) {
        const pattern = 'data:*';
        const keys = await redis.keys(pattern);
        const entries = await Promise.all(
          keys.map(async (key) => {
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) as CacheEntry<unknown> : null;
          })
        );

        const validEntries = entries.filter((e): e is CacheEntry<unknown> => e !== null);
        const totalHits = validEntries.reduce((sum, e) => sum + e.hitCount, 0);
        const totalRequests = totalHits + validEntries.length;

        const keyHits = new Map<string, number>();
        validEntries.forEach((entry, i) => {
          const key = keys[i];
          keyHits.set(key, (keyHits.get(key) || 0) + entry.hitCount);
        });

        const topKeys = Array.from(keyHits.entries())
          .map(([key, hits]) => ({ key, hits }))
          .sort((a, b) => b.hits - a.hits)
          .slice(0, 5);

        return {
          totalEntries: validEntries.length,
          hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
          memoryUsage: JSON.stringify(validEntries).length,
          topKeys,
        };
      } else if (this.useLocalCache) {
        const entries = Array.from(this.localCache.values());
        const totalHits = entries.reduce((sum, e) => sum + e.hitCount, 0);
        const totalRequests = totalHits + entries.length;

        const keyHits = new Map<string, number>();
        this.localCache.forEach((entry, key) => {
          keyHits.set(key, (keyHits.get(key) || 0) + entry.hitCount);
        });

        const topKeys = Array.from(keyHits.entries())
          .map(([key, hits]) => ({ key, hits }))
          .sort((a, b) => b.hits - a.hits)
          .slice(0, 5);

        return {
          totalEntries: entries.length,
          hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
          memoryUsage: JSON.stringify(entries).length,
          topKeys,
        };
      }
    } catch (error) {
      this.logger.error(`Cache stats error: ${error}`);
    }

    return {
      totalEntries: 0,
      hitRate: 0,
      memoryUsage: 0,
      topKeys: [],
    };
  }

  /**
   * Clean expired entries from local cache
   */
  async cleanExpired(): Promise<void> {
    if (!this.useLocalCache) return;

    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.localCache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.localCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned ${cleaned} expired local cache entries`);
    }
  }

  /**
   * Wrapper method for cached data calls
   */
  async withCache<T>(
    prefix: string,
    params: Record<string, unknown>,
    factory: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = await this.get<T>(prefix, params);
    if (cached !== null) {
      return cached;
    }

    const result = await factory();
    await this.set(prefix, params, result, ttl);
    return result;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ redis: boolean; localCache: boolean; totalEntries: number }> {
    const stats = await this.getStats();
    return {
      redis: this.redis !== null,
      localCache: this.useLocalCache,
      totalEntries: stats.totalEntries,
    };
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    }
    this.localCache.clear();
  }
}
