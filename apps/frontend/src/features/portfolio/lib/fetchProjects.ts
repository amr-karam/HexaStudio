import { ProjectResponse } from '@hexastudio/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://api.localhost';

export async function fetchProjects(): Promise<ProjectResponse> {
  try {
    const response = await fetch(`${API_URL}/api/projects`, {
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

export async function fetchProject(slug: string) {
  try {
    const response = await fetch(`${API_URL}/api/projects/${slug}`, {
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
