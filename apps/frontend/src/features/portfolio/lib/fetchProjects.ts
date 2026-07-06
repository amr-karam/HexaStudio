import { ProjectResponse } from '@hexastudio/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://api.localhost';

export async function fetchProjects(): Promise<ProjectResponse> {
  const response = await fetch(`${API_URL}/api/projects`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  });

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  return response.json();
}

export async function fetchProject(slug: string) {
  const response = await fetch(`${API_URL}/api/projects/${slug}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error('Project not found');
  }

  return response.json();
}
