import { useQuery } from '@tanstack/react-query';
import { Service, ServiceResponse } from '@/types';
import { fetchJson } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useServices() {
  return useQuery<ServiceResponse>({
    queryKey: ['services'],
    queryFn: () =>
      fetchJson<ServiceResponse>(`${API_URL}/api/services`, undefined, 'Failed to fetch services'),
  });
}

export function useService(slug: string) {
  return useQuery<Service>({
    queryKey: ['service', slug],
    queryFn: () =>
      fetchJson<Service>(`${API_URL}/api/services/${slug}`, undefined, 'Failed to fetch service'),
    enabled: !!slug,
  });
}
