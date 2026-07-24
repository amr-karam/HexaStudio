import { captureException } from '@sentry/nextjs';
import type { Article, ArticleResponse } from '@hexastudio/types';
import { API_BASE_URL } from '@/config/constants';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchArticles(locale?: string): Promise<ArticleResponse> {
  try {
    const baseUrl = typeof window === 'undefined'
      ? (process.env.API_URL || 'http://backend:4000')
      : API_BASE_URL;

    const params = new URLSearchParams();
    if (locale) params.set('locale', locale);
    const query = params.toString();

    const response = await fetchWithTimeout(`${baseUrl}/api/articles${query ? `?${query}` : ''}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      captureException(new Error(`Articles API Error: ${response.status} ${response.statusText}`));
      return { articles: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }

    return await response.json();
  } catch (error) {
    captureException(error);
    return { articles: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
}

export async function fetchArticle(slug: string, locale?: string): Promise<Article | null> {
  try {
    const baseUrl = typeof window === 'undefined'
      ? (process.env.API_URL || 'http://backend:4000')
      : API_BASE_URL;

    const params = new URLSearchParams();
    if (locale) params.set('locale', locale);
    const query = params.toString();

    const response = await fetchWithTimeout(`${baseUrl}/api/articles/${slug}${query ? `?${query}` : ''}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      captureException(new Error(`Article API Error: ${slug} ${response.status} ${response.statusText}`));
      return null;
    }

    return await response.json();
  } catch (error) {
    captureException(error);
    return null;
  }
}
