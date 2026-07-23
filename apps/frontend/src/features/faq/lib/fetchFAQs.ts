import { captureException } from '@sentry/nextjs';
import { FAQ, FAQResponse } from '@hexastudio/types';
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

export async function fetchFAQs(locale?: string): Promise<FAQResponse> {
  try {
    const baseUrl = typeof window === 'undefined'
      ? (process.env.API_URL || 'http://backend:4000')
      : API_BASE_URL;

    const params = new URLSearchParams();
    if (locale) params.set('locale', locale);
    const query = params.toString();

    const response = await fetchWithTimeout(`${baseUrl}/api/faqs${query ? `?${query}` : ''}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      captureException(new Error(`API Error: ${response.status} ${response.statusText}`));
      return { faqs: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }

    return await response.json();
  } catch (error) {
    captureException(error);
    return { faqs: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }
}

export async function fetchFAQsByCategory(category: string, locale?: string): Promise<FAQ[]> {
  try {
    const baseUrl = typeof window === 'undefined'
      ? (process.env.API_URL || 'http://backend:4000')
      : API_BASE_URL;

    const params = new URLSearchParams();
    if (locale) params.set('locale', locale);
    const query = params.toString();

    const response = await fetchWithTimeout(`${baseUrl}/api/faqs/category/${category}${query ? `?${query}` : ''}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    captureException(error);
    return [];
  }
}
