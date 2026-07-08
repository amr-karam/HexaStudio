import { useQuery } from '@tanstack/react-query';
import { ProjectResponse, Project } from '@hexastudio/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://api.localhost';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<ProjectResponse> => {
      const response = await fetch(`${API_URL}/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: async (): Promise<Project> => {
      const response = await fetch(`${API_URL}/api/projects/${slug}`);
      if (!response.ok) throw new Error('Project not found');
      return response.json();
    },
    enabled: !!slug,
  });
}
