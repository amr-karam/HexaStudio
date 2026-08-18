import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

/**
 * Wraps the cache-manager Redis store with typed key generation
 * and a watch() helper that caches the result of async factory functions.
 */
@Injectable()
export class CacheManagerService {
  constructor(
    @Inject('CACHE_MANAGER')
    private readonly cache: Cache,
  ) {}

  /** Generates a colon-separated cache key from parts. */
  generateKey(...parts: (string | number)[]): string {
    return parts.map(String).join(':');
  }

  /** Returns cached value or calls factory, caches result, and returns it. */
  async watch<T>(key: string, factory: () => Promise<T> | T): Promise<T> {
    const cached = await this.cache.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await factory();
    await this.cache.set(key, value);
    return value;
  }

  /** Deletes a single cache key. */
  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  /** Deletes all keys matching a pattern (Redis KEYS scan). */
  async delByPattern(pattern: string): Promise<void> {
    const keys = await (this.cache as any).keys(pattern);
    if (keys.length > 0) {
      await this.cache.del(keys);
    }
  }
}
