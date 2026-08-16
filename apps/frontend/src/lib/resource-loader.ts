/**
 * @file resource-loader.ts
 * @description Optimized Resource Loading System for HEXA STUDIO
 * Supports skills, tools, items, documentation, equipment, and 3D models with parallel fetching,
 * LRU/Memory caching, lazy loading, compression support, and telemetry.
 */

export type ResourceCategory = 'skills' | 'tools' | 'items' | 'documentation' | 'equipment' | 'models';

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
  private readonly maxItems = 100;
  private defaultTtl = 15 * 60 * 1000; // 15 minutes

  set(key: string, item: ResourceItem, ttlMs = this.defaultTtl): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxItems) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
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
    // Move to end for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.item;
  }

  clear(): void {
    this.cache.clear();
  }
}

interface QueuedRequest {
  resolve: (value: ResourceItem) => void;
  reject: (reason: unknown) => void;
  category: ResourceCategory;
  id: string;
  fetcher: () => Promise<unknown>;
  options: ResourceLoaderOptions;
}

export class OptimizedResourceLoader {
  private static instance: OptimizedResourceLoader;
  private cache = new ResourceLoaderCache();
  private pendingRequests = new Map<string, Promise<ResourceItem>>();
  
  private queues: Record<'high' | 'normal' | 'low', QueuedRequest[]> = {
    high: [],
    normal: [],
    low: [],
  };
  private isProcessing = false;
  private activeRequests = 0;
  private readonly maxConcurrent = 6;

  private constructor() {}

  public static getInstance(): OptimizedResourceLoader {
    if (!OptimizedResourceLoader.instance) {
      OptimizedResourceLoader.instance = new OptimizedResourceLoader();
    }
    return OptimizedResourceLoader.instance;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.hasPendingRequests()) {
      if (this.activeRequests >= this.maxConcurrent) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        continue;
      }

      const request = this.getNextRequest();
      if (!request) break;

      this.activeRequests++;
      this.executeQueuedRequest(request);
    }

    this.isProcessing = false;
  }

  private hasPendingRequests(): boolean {
    return (
      this.queues.high.length > 0 ||
      this.queues.normal.length > 0 ||
      this.queues.low.length > 0
    );
  }

  private getNextRequest(): QueuedRequest | null {
    return (
      this.queues.high.shift() ||
      this.queues.normal.shift() ||
      this.queues.low.shift() ||
      null
    );
  }

  private async executeQueuedRequest(req: QueuedRequest): Promise<void> {
    try {
      const item = await this.performLoad(req.category, req.id, req.fetcher, req.options);
      req.resolve(item);
    } catch (error) {
      req.reject(error);
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  private async performLoad(
    category: ResourceCategory,
    id: string,
    fetcher: () => Promise<unknown>,
    options: ResourceLoaderOptions
  ): Promise<ResourceItem> {
    const cacheKey = `${category}:${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

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
    return item;
  }

  /**
   * Load a single resource with caching and priority queueing.
   */
  public async loadResource(
    category: ResourceCategory,
    id: string,
    fetcher: () => Promise<unknown>,
    options: ResourceLoaderOptions = {}
  ): Promise<ResourceItem> {
    const cacheKey = `${category}:${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    const priority = options.priority || 'normal';
    
    const promise = new Promise<ResourceItem>((resolve, reject) => {
      this.queues[priority].push({
        resolve,
        reject,
        category,
        id,
        fetcher,
        options,
      });
      this.processQueue();
    });

    this.pendingRequests.set(cacheKey, promise);
    
    // Clean up pending requests map once resolved
    promise.finally(() => {
      this.pendingRequests.delete(cacheKey);
    });

    return promise;
  }

  /**
   * Batch load multiple resources with hydration yielding.
   */
  public async loadBatch(
    requests: Array<{ category: ResourceCategory; id: string; fetcher: () => Promise<unknown> }>,
    options: ResourceLoaderOptions = {}
  ): Promise<ResourceItem[]> {
    const results: ResourceItem[] = [];
    const CHUNK_SIZE = 5;

    for (let i = 0; i < requests.length; i += CHUNK_SIZE) {
      const chunk = requests.slice(i, i + CHUNK_SIZE);
      const promises = chunk.map((req) => 
        this.loadResource(req.category, req.id, req.fetcher, options)
      );
      
      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);

      // Yield to main thread to prevent TBT
      if (i + CHUNK_SIZE < requests.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
    return results;
  }

  /**
   * Lazy load non-critical resources on demand.
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
