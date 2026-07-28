// ─── HEXA Hub — Search Hook ────────────────────────────────────────────────
// React Query hook for cross-module global search.
// ───────────────────────────────────────────────────────────────────────────

'use client';

import { useQuery, type QueryKey } from '@tanstack/react-query';
import { get } from '@/lib/api';
import type { SearchResult, GlobalSearchQuery } from '@hexa-hub/types';

// ─── Query Key Constants ───────────────────────────────────────────────────

const SEARCH_KEY = 'global-search';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

export interface SearchResultState {
  results: SearchResult[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isEmpty: boolean;
  refetch: () => void;
}

// ─── useSearch ──────────────────────────────────────────────────────────────

/**
 * Perform a cross-module global search.
 * GET /search?q=query
 *
 * The query is debounced by the consumer (typically via a search input).
 * The query is disabled when the search string is empty or too short.
 *
 * @param query — The search query string.
 * @param models — Optional array of models to restrict search to.
 * @param limit — Maximum number of results (default: 20).
 */
export function useSearch(
  query: string,
  models?: GlobalSearchQuery['models'],
  limit?: number,
): SearchResultState {
  const queryKey: QueryKey = [SEARCH_KEY, query, models, limit];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SearchResponse, Error>({
    queryKey,
    queryFn: () =>
      get<SearchResponse>('/search', {
        params: {
          q: query,
          models: models?.join(',') as string | undefined,
          limit: limit ?? 20,
        },
      }),
    staleTime: 30_000,
    retry: 1,
    enabled: query.length >= 2,
  });

  return {
    results: data?.results ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError,
    error: error ?? null,
    isEmpty: !isLoading && !isError && (data?.results?.length ?? 0) === 0,
    refetch,
  };
}
