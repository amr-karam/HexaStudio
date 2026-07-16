import { useQuery } from '@tanstack/react-query';
import { Service, ServiceResponse } from '@/types';
import { API_BASE_URL } from '@/config/constants';

export function useServices(locale?: string) {
  return useQuery<ServiceResponse>({
    queryKey: ['services', locale],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locale) params.set('locale', locale);
      const query = params.toString();
      const response = await fetch(`${API_BASE_URL}/api/services${query ? `?${query}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
  });
}

export function useService(slug: string, locale?: string) {
  return useQuery<Service>({
    queryKey: ['service', slug, locale],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locale) params.set('locale', locale);
      const query = params.toString();
      const response = await fetch(`${API_BASE_URL}/api/services/${slug}${query ? `?${query}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch service');
      return response.json();
    },
    enabled: !!slug,
  });
}
