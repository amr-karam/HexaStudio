// ─── HEXA Hub — Global Search Hook ─────────────────────────────────────────
// React Query hook for the GlobalSearch command palette.
// Debounces input at 300ms and calls GET /search?q={query}.
// Returns results grouped by category for the UI.
// ───────────────────────────────────────────────────────────────────────────

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, type QueryKey } from '@tanstack/react-query';
import { get } from '@/lib/api';
import type { SearchResult as ApiSearchResult } from '@hexa-hub/types';

// ─── Types ─────────────────────────────────────────────────────────────────

export type SearchCategory = 'project' | 'task' | 'document' | 'contact' | 'message';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: SearchCategory;
  url: string;
}

export interface SearchGroup {
  category: SearchCategory;
  label: string;
  results: SearchResult[];
}

export interface GlobalSearchState {
  results: SearchResult[];
  groupedResults: SearchGroup[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: Error | null;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 300;
const SEARCH_KEY = 'global-search-palette';

/** Map Odoo model names to UI categories */
const MODEL_TO_CATEGORY: Record<string, SearchCategory> = {
  'crm.lead': 'contact',
  'res.partner': 'contact',
  'project.project': 'project',
  'project.task': 'task',
  'sale.order': 'document',
  'account.move': 'document',
  'mail.activity': 'task',
  'documents.document': 'document',
};

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  project: 'Projects',
  task: 'Tasks',
  document: 'Documents',
  contact: 'Contacts',
  message: 'Messages',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function mapApiResultToSearchResult(item: ApiSearchResult): SearchResult {
  const category: SearchCategory = MODEL_TO_CATEGORY[item.model] ?? 'document';

  return {
    id: `${item.model}-${item.id}`,
    title: item.title,
    subtitle: item.subtitle ?? '',
    category,
    url: item.url ?? `/${category}s/${item.id}`,
  };
}

function groupByCategory(results: SearchResult[]): SearchGroup[] {
  const groups = new Map<SearchCategory, SearchResult[]>();

  for (const r of results) {
    const existing = groups.get(r.category);
    if (existing) {
      existing.push(r);
    } else {
      groups.set(r.category, [r]);
    }
  }

  return Array.from(groups.entries()).map(([category, items]) => ({
    category,
    label: CATEGORY_LABELS[category],
    results: items,
  }));
}

// ─── useGlobalSearch ────────────────────────────────────────────────────────

/**
 * Perform a global search with client-side debouncing.
 *
 * @param query — The raw search input string (debounced internally).
 * @param limit — Maximum number of results (default: 20).
 */
export function useGlobalSearch(
  query: string,
  limit: number = 20,
): GlobalSearchState {
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounce ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // ── React Query ──────────────────────────────────────────────────────────
  const queryKey: QueryKey = [SEARCH_KEY, debouncedQuery, limit];

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<{ data: ApiSearchResult[]; meta: { total: number; query: string } }, Error>({
    queryKey,
    queryFn: () =>
      get<{ data: ApiSearchResult[]; meta: { total: number; query: string } }>('/search', {
        params: { q: debouncedQuery, limit },
      }),
    staleTime: 30_000,
    retry: 1,
    enabled: debouncedQuery.length >= 2,
  });

  // ── Map & Group ──────────────────────────────────────────────────────────
  const results: SearchResult[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map(mapApiResultToSearchResult);
  }, [data]);

  const groupedResults: SearchGroup[] = useMemo(
    () => groupByCategory(results),
    [results],
  );

  const isEmpty = !isLoading && !isError && results.length === 0;

  return {
    results,
    groupedResults,
    isLoading,
    isError,
    isEmpty,
    error: error ?? null,
  };
}

export { CATEGORY_LABELS };
