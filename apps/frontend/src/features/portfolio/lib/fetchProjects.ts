import { captureException } from '@sentry/nextjs';
import { Project, ProjectResponse } from '@hexastudio/types';
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

export async function fetchProjects(locale?: string): Promise<ProjectResponse> {
  try {
    // Use internal Docker DNS for server-side calls to avoid loopback issues
    const baseUrl = typeof window === 'undefined'
      ? (process.env.API_URL || 'http://backend:4000')
      : API_BASE_URL;

    const params = new URLSearchParams();
    if (locale) params.set('locale', locale);
    const query = params.toString();

    const response = await fetchWithTimeout(`${baseUrl}/api/projects${query ? `?${query}` : ''}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      captureException(new Error(`API Error: ${response.status} ${response.statusText}`));
      return { projects: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }

    return await response.json();
  } catch (error) {
    captureException(error);
    return { projects: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
}

export async function fetchProject(slug: string, locale?: string): Promise<Project | null> {
  try {
    const baseUrl = typeof window === 'undefined'
      ? (process.env.API_URL || 'http://backend:4000')
      : API_BASE_URL;

    const params = new URLSearchParams();
    if (locale) params.set('locale', locale);
    const query = params.toString();

    const response = await fetchWithTimeout(`${baseUrl}/api/projects/${slug}${query ? `?${query}` : ''}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    captureException(error);
    return null;
  }
}
