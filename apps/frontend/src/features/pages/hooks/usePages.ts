'use client';

import { useQuery } from '@tanstack/react-query';
import { Page, PageResponse } from '../types';
import { fetchPages, fetchPage } from '../lib/fetchPages';

/** Fetch all CMS pages. Optionally filter by locale. */
export function usePages(locale?: string) {
  return useQuery<PageResponse>({
    queryKey: ['pages', { locale }],
    queryFn: () => fetchPages(locale),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/** Fetch a single CMS page by slug. */
export function usePage(slug: string, locale?: string) {
  return useQuery<Page>({
    queryKey: ['page', slug, { locale }],
    queryFn: async () => {
      const page = await fetchPage(slug, locale);
      if (!page) throw new Error('Page not found');
      return page;
    },
    enabled: !!slug,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
