// Types
export type { Page, PageResponse, StrapiBlock, MediaAsset } from './types';

// Server-side fetch functions
export { fetchPages, fetchPage } from './lib/fetchPages';

// Client-side hooks
export { usePages, usePage } from './hooks/usePages';
