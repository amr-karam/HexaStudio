import { useQuery } from '@tanstack/react-query';
import { Service, ServiceResponse } from '@/types';
import { API_BASE_URL } from '@/config/constants';

export function useServices() {
  return useQuery<ServiceResponse>({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/services`);
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
  });
}

export function useService(slug: string) {
  return useQuery<Service>({
    queryKey: ['service', slug],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/services/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch service');
      return response.json();
    },
    enabled: !!slug,
  });
}
