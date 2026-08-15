import { describe, it, expect, beforeEach } from 'vitest';
import { OptimizedResourceLoader } from '../../src/lib/resource-loader';

describe('OptimizedResourceLoader', () => {
  let loader: OptimizedResourceLoader;

  beforeEach(() => {
    loader = OptimizedResourceLoader.getInstance();
    loader.invalidateCache();
  });

  it('loads and caches resources efficiently', async () => {
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount++;
      return { data: 'test-resource' };
    };

    // First load (cache miss)
    const res1 = await loader.loadResource('skills', 'ts-react', fetcher);
    expect(res1.payload).toEqual({ data: 'test-resource' });
    expect(fetchCount).toBe(1);

    // Second load (cache hit)
    const res2 = await loader.loadResource('skills', 'ts-react', fetcher);
    expect(res2.payload).toEqual({ data: 'test-resource' });
    expect(fetchCount).toBe(1); // Should not increment fetchCount
  });

  it('handles parallel batch loading', async () => {
    const requests = [
      { category: 'tools' as const, id: 'vite', fetcher: async () => 'vite-tool' },
      { category: 'equipment' as const, id: 'macbook', fetcher: async () => 'macbook-pro' },
      { category: 'documentation' as const, id: 'adr-001', fetcher: async () => 'adr-content' },
    ];

    const results = await loader.loadBatch(requests);
    expect(results).toHaveLength(3);
    expect(results[0].payload).toBe('vite-tool');
    expect(results[1].payload).toBe('macbook-pro');
    expect(results[2].payload).toBe('adr-content');
  });

  it('supports lazy loading on demand', async () => {
    let fetched = false;
    const lazyFetcher = loader.lazyLoad('items', 'shield', async () => {
      fetched = true;
      return 'shield-item';
    });

    expect(fetched).toBe(false);
    const item = await lazyFetcher();
    expect(fetched).toBe(true);
    expect(item.payload).toBe('shield-item');
  });
});
