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
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/projects`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { projects: [], total: 0 };
    }

    return response.json();
  } catch {
    return { projects: [], total: 0 };
  }
}

export async function fetchProject(slug: string): Promise<Project | null> {
  try {
    const response = await fetchWithTimeout(`${API_URL}/api/projects/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}
