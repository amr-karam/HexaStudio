'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchFAQs } from '../lib/fetchFAQs';

export function useFAQs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: () => fetchFAQs(),
    staleTime: 60 * 60 * 1000,
  });
}
