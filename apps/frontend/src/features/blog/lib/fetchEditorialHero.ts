import { captureException } from '@sentry/nextjs';
import type { EditorialHero } from '@hexastudio/types';
import { API_BASE_URL } from '@/config/constants';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches the CMS-configured editorial hero for a page (by slug).
 * Returns null when the page has no hero, so callers can fall back to defaults.
 */
export async function fetchEditorialHero(slug: string): Promise<EditorialHero | null> {
  try {
    const baseUrl = typeof window === 'undefined'
      ? (process.env.API_URL || 'http://backend:4000')
      : API_BASE_URL;

    const params = new URLSearchParams({ slug });
    const response = await fetchWithTimeout(
      `${baseUrl}/api/pages/editorial-hero?${params.toString()}`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      captureException(new Error(`EditorialHero API Error: ${response.status} ${response.statusText}`));
      return null;
    }

    return (await response.json()) as EditorialHero | null;
  } catch (error) {
    captureException(error);
    return null;
  }
}
