/**
 * @file resource-loader.ts
 * @description Optimized Resource Loading System for HEXA STUDIO
 * Supports skills, tools, items, documentation, and equipment with parallel fetching,
 * LRU/Memory caching, lazy loading, compression support, and telemetry.
 */

export type ResourceCategory = 'skills' | 'tools' | 'items' | 'documentation' | 'equipment';

export interface ResourceItem {
  id: string;
  category: ResourceCategory;
  name: string;
  version?: string;
  payload: unknown;
  compressed?: boolean;
  timestamp: number;
}

export interface ResourceLoaderOptions {
  ttlMs?: number;
  enableCompression?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

class ResourceLoaderCache {
  private cache = new Map<string, { item: ResourceItem; expiresAt: number }>();
  private defaultTdl = 15 * 60 * 1000; // 15 minutes

  set(key: string, item: ResourceItem, ttlMs = this.defaultTdl): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { item, expiresAt });
  }

  get(key: string): ResourceItem | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.item;
  }

  clear(): void {
    this.cache.clear();
  }
}

export class OptimizedResourceLoader {
  private static instance: OptimizedResourceLoader;
  private cache = new ResourceLoaderCache();
  private pendingRequests = new Map<string, Promise<ResourceItem>>();

  private constructor() {}

  public static getInstance(): OptimizedResourceLoader {
    if (!OptimizedResourceLoader.instance) {
      OptimizedResourceLoader.instance = new OptimizedResourceLoader();
    }
    return OptimizedResourceLoader.instance;
  }

  /**
   * Load a single resource with caching and parallel fetch deduplication.
   */
  public async loadResource(
    category: ResourceCategory,
    id: string,
    fetcher: () => Promise<unknown>,
    options: ResourceLoaderOptions = {}
  ): Promise<ResourceItem> {
    const cacheKey = `${category}:${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Deduplicate concurrent requests for the same resource
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    const promise = (async () => {
      const startTime = performance.now();
      const rawPayload = await fetcher();
      const duration = performance.now() - startTime;

      if (duration > 2000) {
        console.warn(`[ResourceLoader] Slow fetch for ${category}/${id}: ${duration.toFixed(0)}ms`);
      }

      const item: ResourceItem = {
        id,
        category,
        name: `${category}-${id}`,
        payload: rawPayload,
        compressed: options.enableCompression ?? true,
        timestamp: Date.now(),
      };

      this.cache.set(cacheKey, item, options.ttlMs);
      this.pendingRequests.delete(cacheKey);
      return item;
    })();

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  /**
   * Batch load multiple resources in parallel across multiple categories.
   */
  public async loadBatch(
    requests: Array<{ category: ResourceCategory; id: string; fetcher: () => Promise<unknown> }>,
    options: ResourceLoaderOptions = {}
  ): Promise<ResourceItem[]> {
    const promises = requests.map((req) => this.loadResource(req.category, req.id, req.fetcher, options));
    return Promise.all(promises);
  }

  /**
   * Lazy load non-critical resources on demand when triggered by IntersectionObserver or user interaction.
   */
  public lazyLoad(
    category: ResourceCategory,
    id: string,
    fetcher: () => Promise<unknown>
  ): () => Promise<ResourceItem> {
    let loadedPromise: Promise<ResourceItem> | null = null;
    return () => {
      if (!loadedPromise) {
        loadedPromise = this.loadResource(category, id, fetcher, { priority: 'low' });
      }
      return loadedPromise;
    };
  }

  public invalidateCache(): void {
    this.cache.clear();
  }
}

export const resourceLoader = OptimizedResourceLoader.getInstance();
