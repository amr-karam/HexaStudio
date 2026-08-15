import { Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

@Injectable()
export class ResourceLoaderService {
  private readonly logger = new Logger(ResourceLoaderService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async loadResource<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.cacheManager.get<T>(key);
    if (cached) {
      this.logger.debug(`Cache hit for resource: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache miss for resource: ${key}. Fetching...`);
    const resource = await fetcher();
    
    // Cache the resource
    await this.cacheManager.set(key, resource, 3600000); // 1 hour
    return resource;
  }

  async loadResourcesParallel<T>(resources: { key: string, fetcher: () => Promise<T> }[]): Promise<T[]> {
    return Promise.all(resources.map(r => this.loadResource(r.key, r.fetcher)));
  }

  async getCompressedResource(data: string): Promise<Buffer> {
    return gzip(data);
  }
}
