import { Test, TestingModule } from '@nestjs/testing';
import { ResourceLoaderService } from './resource-loader.service';
import { CacheModule } from '@nestjs/cache-manager';
import { vi } from 'vitest';

describe('ResourceLoaderService', () => {
  let service: ResourceLoaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [ResourceLoaderService],
    }).compile();

    service = module.get<ResourceLoaderService>(ResourceLoaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load resource and cache it', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');
    const result1 = await service.loadResource('key', fetcher);
    const result2 = await service.loadResource('key', fetcher);

    expect(result1).toBe('data');
    expect(result2).toBe('data');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should load resources in parallel', async () => {
    const fetcher1 = vi.fn().mockResolvedValue('data1');
    const fetcher2 = vi.fn().mockResolvedValue('data2');
    
    const results = await service.loadResourcesParallel([
      { key: 'key1', fetcher: fetcher1 },
      { key: 'key2', fetcher: fetcher2 }
    ]);

    expect(results).toEqual(['data1', 'data2']);
    expect(fetcher1).toHaveBeenCalledTimes(1);
    expect(fetcher2).toHaveBeenCalledTimes(1);
  });
});
