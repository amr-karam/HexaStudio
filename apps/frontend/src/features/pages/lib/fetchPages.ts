import * as Sentry from '@sentry/nextjs';
import { Page, PageResponse } from '../types';
import { API_BASE_URL } from '@/config/constants';

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 5000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

const EMPTY_PAGE_RESPONSE: PageResponse = {
  data: [],
  meta: { pagination: { page: 1, pageSize: 20, pageCount: 0, total: 0 } },
};

/**
 * Fetch all CMS pages, optionally filtered by locale.
 *
 * Server-side callers get the internal Docker DNS address; client-side
 * callers use the public `API_BASE_URL`.
 */
export async function fetchPages(locale?: string): Promise<PageResponse> {
  try {
    const baseUrl =
      typeof window === 'undefined'
        ? process.env.API_URL || 'http://backend:4000'
        : API_BASE_URL;

    const params = new URLSearchParams();
    if (locale) params.set('locale', locale);
    const query = params.toString();

    const response = await fetchWithTimeout(
      `${baseUrl}/api/pages${query ? `?${query}` : ''}`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      Sentry.captureException(
        new Error(`Pages API Error: ${response.status} ${response.statusText}`),
      );
      return EMPTY_PAGE_RESPONSE;
    }

    return (await response.json()) as PageResponse;
  } catch (error) {
    Sentry.captureException(error);
    return EMPTY_PAGE_RESPONSE;
  }
}

/**
 * Fetch a single CMS page by its slug.
 *
 * Returns `null` when the page is not found or the request fails.
 */
export async function fetchPage(
  slug: string,
  locale?: string,
): Promise<Page | null> {
  try {
    const baseUrl =
      typeof window === 'undefined'
        ? process.env.API_URL || 'http://backend:4000'
        : API_BASE_URL;

    const params = new URLSearchParams();
    if (locale) params.set('locale', locale);
    const query = params.toString();

    const response = await fetchWithTimeout(
      `${baseUrl}/api/pages/${slug}${query ? `?${query}` : ''}`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Page;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
}
