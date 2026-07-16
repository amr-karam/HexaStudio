import { useQuery } from '@tanstack/react-query';
import { Project } from '@hexastudio/types';
import { fetchProjects, fetchProject } from '../lib/fetchProjects';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(),
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: async (): Promise<Project> => {
      const project = await fetchProject(slug);
      if (!project) throw new Error('Project not found');
      return project;
    },
    enabled: !!slug,
  });
}
