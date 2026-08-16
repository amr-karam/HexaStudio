import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/features/odoo/api', () => ({
  portalOdooApi: {
    getDocuments: vi.fn(),
  },
}));

import { portalOdooApi } from '@/features/odoo/api';
import { resourceLoader } from '@/lib/resource-loader';
import { loadProjectDocuments, lazyLoadDocumentPayload } from '@/features/portal/lib/documentation-loader';
import type { PortalDocumentRecord } from '@/features/odoo/api';

const mockGetDocuments = vi.mocked(portalOdooApi.getDocuments);

describe('documentation-loader', () => {
  const docs: PortalDocumentRecord[] = [
    {
      id: 'doc-1',
      name: 'Horizon_Villa_3D_Renderings.pdf',
      mimeType: 'application/pdf',
      fileSize: 24800000,
      filePath: '/docs/horizon-villa.pdf',
      projectId: 1,
      createdAt: '2026-07-22T09:15:00Z',
      downloadUrl: 'https://minio.test/presigned/horizon-villa.pdf',
    },
  ];

  beforeEach(() => {
    resourceLoader.invalidateCache();
    mockGetDocuments.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads project documents through the shared loader', async () => {
    mockGetDocuments.mockResolvedValue(docs);

    const result = await loadProjectDocuments(1);
    expect(result).toEqual(docs);
    expect(mockGetDocuments).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent loads of the same project documents', async () => {
    let resolveFetch: (value: PortalDocumentRecord[]) => void = () => {};
    mockGetDocuments.mockImplementation(
      () =>
        new Promise<PortalDocumentRecord[]>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const first = loadProjectDocuments(1);
    const second = loadProjectDocuments(1);

    resolveFetch(docs);
    const [r1, r2] = await Promise.all([first, second]);

    expect(r1).toEqual(docs);
    expect(r2).toEqual(docs);
    expect(mockGetDocuments).toHaveBeenCalledTimes(1); // single network request
  });

  it('lazy-loads document payload blobs on demand', async () => {
    const blob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, blob: async () => blob } as Response),
    );

    const trigger = lazyLoadDocumentPayload(1, 'doc-1', 'https://minio.test/presigned/horizon-villa.pdf');
    const payload = await trigger();

    expect(payload).toBe(blob);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('caches payload downloads so a repeat trigger does not refetch', async () => {
    const blob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, blob: async () => blob } as Response),
    );

    const trigger = lazyLoadDocumentPayload(1, 'doc-1', 'https://minio.test/presigned/horizon-villa.pdf');
    await trigger();
    await trigger();

    expect(fetch).toHaveBeenCalledTimes(1); // served from the loader cache
  });

  it('returns an empty list for a non-finite project id', async () => {
    const result = await loadProjectDocuments(Number.NaN);
    expect(result).toEqual([]);
    expect(mockGetDocuments).not.toHaveBeenCalled();
  });
});