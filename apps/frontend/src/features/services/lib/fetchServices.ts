import { captureException } from '@sentry/nextjs';
import type { Service, ServiceResponse } from '@hexastudio/types';
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

export async function fetchServices(locale?: string): Promise<ServiceResponse> {
  try {
    const baseUrl = typeof window === 'undefined'
      ? (process.env.API_URL || 'http://backend:4000')
      : API_BASE_URL;

    const params = new URLSearchParams();
    if (locale) params.set('locale', locale);
    const query = params.toString();

    const response = await fetchWithTimeout(`${baseUrl}/api/services${query ? `?${query}` : ''}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      captureException(new Error(`Services API Error: ${response.status} ${response.statusText}`));
      return { services: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }

    return await response.json();
  } catch (error) {
    captureException(error);
    return { services: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
}
