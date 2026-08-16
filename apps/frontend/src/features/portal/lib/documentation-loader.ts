/**
 * @file documentation-loader.ts
 * @description Loader-backed document fetching for the HEXA Portal.
 *
 * Routes heavy documentation through the shared `resourceLoader` singleton so
 * metadata fetches and binary payload downloads are lazily initiated, cached,
 * and deduplicated across the portal (dashboard, document center, project pages).
 */

import { resourceLoader } from '@/lib/resource-loader';
import { portalOdooApi, type PortalDocumentRecord } from '@/features/odoo/api';

/** Documents are refreshed with the rest of the portal data (5 minutes). */
const DOCUMENTS_TTL_MS = 5 * 60 * 1000;

export function documentsCacheKey(projectId: number): string {
  return `documents:${projectId}`;
}

export function documentPayloadCacheKey(projectId: number, documentId: string): string {
  return `document-payload:${projectId}:${documentId}`;
}

/**
 * Loads (and TTL-caches) a project's document index through the shared loader.
 * Multiple consumers querying the same project share one network request.
 */
export async function loadProjectDocuments(projectId: number): Promise<PortalDocumentRecord[]> {
  if (!Number.isFinite(projectId)) return [];
  const item = await resourceLoader.loadResource(
    'documentation',
    documentsCacheKey(projectId),
    () => portalOdooApi.getDocuments(projectId),
    { ttlMs: DOCUMENTS_TTL_MS },
  );
  return item.payload as PortalDocumentRecord[];
}

/**
 * Returns a lazy trigger that downloads a document's binary payload
 * (presigned MinIO URL) on demand. Repeated downloads of the same document
 * resolve from the loader cache — no duplicate network transfer.
 */
export function lazyLoadDocumentPayload(
  projectId: number,
  documentId: string,
  downloadUrl: string,
): () => Promise<Blob> {
  const trigger = resourceLoader.lazyLoad(
    'documentation',
    documentPayloadCacheKey(projectId, documentId),
    async () => {
      const res = await fetch(downloadUrl, { credentials: 'include' });
      if (!res.ok) throw new Error(`Document download failed: HTTP ${res.status}`);
      return res.blob();
    },
  );
  return async () => {
    const item = await trigger();
    return item.payload as Blob;
  };
}