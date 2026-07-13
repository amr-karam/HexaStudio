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

export async function fetchProjects(): Promise<ProjectResponse> {
  try {
    // Use internal Docker DNS for server-side calls to avoid loopback issues
    const baseUrl = typeof window === 'undefined' 
      ? 'http://backend:4000' 
      : API_BASE_URL;

    const response = await fetchWithTimeout(`${baseUrl}/api/projects`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return { projects: [], total: 0 };
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch Projects Error:', error);
    return { projects: [], total: 0 };
  }
}

export async function fetchProject(slug: string): Promise<Project | null> {
  try {
    const baseUrl = typeof window === 'undefined' 
      ? 'http://backend:4000' 
      : API_BASE_URL;

    const response = await fetchWithTimeout(`${baseUrl}/api/projects/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Fetch Project (${slug}) Error:`, error);
    return null;
  }
}
