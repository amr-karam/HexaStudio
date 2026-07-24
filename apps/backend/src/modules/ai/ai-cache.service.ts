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

@Injectable()
export class AiCacheService {
  private readonly logger = new Logger(AiCacheService.name);
  private redis: Redis | null = null;
  private localCache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly defaultTTL = 3600; // 1 hour
  private readonly useLocalCache = true;

  constructor(private configService: ConfigService<Env>) {
    try {
      this.redis = new Redis({
        host: this.configService.get('REDIS_HOST', 'redis'),
        port: this.configService.get('REDIS_PORT', 6379),
        password: this.configService.get('REDIS_PASSWORD'),
        db: 2, // Use separate DB for AI cache
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
        this.logger.log('Redis connected for AI caching');
      });
    } catch (error) {
      this.logger.warn(`Redis initialization failed, using local cache: ${error}`);
      this.redis = null;
    }
  }

  /**
   * Generate cache key from method name and parameters
   */
  private generateKey(method: string, params: Record<string, unknown>): string {
    const paramString = JSON.stringify(params, Object.keys(params).sort());
    return `ai:${method}:${Buffer.from(paramString).toString('base64')}`;
  }

  /**
   * Get cached value
   */
  async get<T>(method: string, params: Record<string, unknown>): Promise<T | null> {
    const key = this.generateKey(method, params);

    try {
      if (this.redis) {
        const cached = await this.redis.get(key);
        if (cached) {
          const entry: CacheEntry<T> = JSON.parse(cached);
          entry.hitCount++;
          await this.redis.set(key, JSON.stringify(entry), 'EX', entry.ttl);
          this.logger.debug(`Cache hit for ${method}`);
          return entry.data;
        }
      } else if (this.useLocalCache) {
        const entry = this.localCache.get(key) as CacheEntry<T> | undefined;
        if (entry && Date.now() - entry.timestamp < entry.ttl * 1000) {
          entry.hitCount++;
          this.logger.debug(`Local cache hit for ${method}`);
          return entry.data;
        }
      }
    } catch (error) {
      this.logger.error(`Cache get error for ${method}: ${error}`);
    }

    return null;
  }

  /**
   * Set cached value
   */
  async set<T>(
    method: string,
    params: Record<string, unknown>,
    data: T,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    const key = this.generateKey(method, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hitCount: 0,
    };

    try {
      if (this.redis) {
        await this.redis.set(key, JSON.stringify(entry), 'EX', ttl);
        this.logger.debug(`Cached ${method} for ${ttl}s`);
      } else if (this.useLocalCache) {
        this.localCache.set(key, entry);
        this.logger.debug(`Locally cached ${method} for ${ttl}s`);
      }
    } catch (error) {
      this.logger.error(`Cache set error for ${method}: ${error}`);
    }
  }

  /**
   * Invalidate cache for specific method
   */
  async invalidate(method: string): Promise<void> {
    try {
      if (this.redis) {
        const pattern = `ai:${method}:*`;
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          this.logger.log(`Invalidated ${keys.length} cache entries for ${method}`);
        }
      } else if (this.useLocalCache) {
        const pattern = `ai:${method}:`;
        let invalidated = 0;
        for (const key of this.localCache.keys()) {
          if (key.startsWith(pattern)) {
            this.localCache.delete(key);
            invalidated++;
          }
        }
        this.logger.log(`Invalidated ${invalidated} local cache entries for ${method}`);
      }
    } catch (error) {
      this.logger.error(`Cache invalidation error for ${method}: ${error}`);
    }
  }

  /**
   * Clear all AI cache
   */
  async clear(): Promise<void> {
    try {
      if (this.redis) {
        const pattern = 'ai:*';
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          this.logger.log(`Cleared ${keys.length} AI cache entries`);
        }
      } else if (this.useLocalCache) {
        const count = this.localCache.size;
        this.localCache.clear();
        this.logger.log(`Cleared ${count} local AI cache entries`);
      }
    } catch (error) {
      this.logger.error(`Cache clear error: ${error}`);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    hitRate: number;
    memoryUsage: number;
    topMethods: Array<{ method: string; hits: number }>;
  }> {
    try {
      const redis = this.redis;
      if (redis) {
        const pattern = 'ai:*';
        const keys = await redis.keys(pattern);
        const entries = await Promise.all(
          keys.map(async (key) => {
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) as CacheEntry<unknown> : null;
          })
        );

        const validEntries = entries.filter((e): e is CacheEntry<unknown> => e !== null);
        const totalHits = validEntries.reduce((sum, e) => sum + e.hitCount, 0);
        const totalRequests = totalHits + validEntries.length; // Approximate

        // Extract method names
        const methodHits = new Map<string, number>();
        validEntries.forEach((entry) => {
          const key = keys[validEntries.indexOf(entry)];
          const method = key.split(':')[1];
          methodHits.set(method, (methodHits.get(method) || 0) + entry.hitCount);
        });

        const topMethods = Array.from(methodHits.entries())
          .map(([method, hits]) => ({ method, hits }))
          .sort((a, b) => b.hits - a.hits)
          .slice(0, 5);

        return {
          totalEntries: validEntries.length,
          hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
          memoryUsage: JSON.stringify(validEntries).length,
          topMethods,
        };
      } else if (this.useLocalCache) {
        const entries = Array.from(this.localCache.values());
        const totalHits = entries.reduce((sum, e) => sum + e.hitCount, 0);
        const totalRequests = totalHits + entries.length;

        const methodHits = new Map<string, number>();
        this.localCache.forEach((entry, key) => {
          const method = key.split(':')[1];
          methodHits.set(method, (methodHits.get(method) || 0) + entry.hitCount);
        });

        const topMethods = Array.from(methodHits.entries())
          .map(([method, hits]) => ({ method, hits }))
          .sort((a, b) => b.hits - a.hits)
          .slice(0, 5);

        return {
          totalEntries: entries.length,
          hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
          memoryUsage: JSON.stringify(entries).length,
          topMethods,
        };
      }
    } catch (error) {
      this.logger.error(`Cache stats error: ${error}`);
    }

    return {
      totalEntries: 0,
      hitRate: 0,
      memoryUsage: 0,
      topMethods: [],
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
   * Wrapper method for cached AI calls
   */
  async withCache<T>(
    method: string,
    params: Record<string, unknown>,
    factory: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(method, params);
    if (cached !== null) {
      return cached;
    }

    // Execute factory function
    const result = await factory();

    // Cache the result
    await this.set(method, params, result, ttl);

    return result;
  }

  /**
   * Pre-warm cache with common queries
   */
  async warmup(
    entries: Array<{
      method: string;
      params: Record<string, unknown>;
      factory: () => Promise<unknown>;
      ttl?: number;
    }>
  ): Promise<void> {
    this.logger.log(`Warming up cache with ${entries.length} entries`);

    await Promise.all(
      entries.map(async ({ method, params, factory, ttl }) => {
        try {
          await this.withCache(method, params, factory, ttl);
        } catch (error) {
          this.logger.error(`Cache warmup failed for ${method}: ${error}`);
        }
      })
    );

    this.logger.log('Cache warmup completed');
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
