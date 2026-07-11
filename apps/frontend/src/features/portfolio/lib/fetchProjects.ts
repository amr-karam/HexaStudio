import { Project, ProjectResponse } from '@hexastudio/types';
import { fetchJsonSafe } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://api.localhost';

export async function fetchProjects(): Promise<ProjectResponse> {
  return fetchJsonSafe<ProjectResponse>(
    `${API_URL}/api/projects`,
    { projects: [], total: 0 },
    { next: { revalidate: 3600 } },
    5000,
  );
}

export async function fetchProject(slug: string): Promise<Project | null> {
  return fetchJsonSafe<Project | null>(
    `${API_URL}/api/projects/${slug}`,
    null,
    { next: { revalidate: 3600 } },
    5000,
  );
}
