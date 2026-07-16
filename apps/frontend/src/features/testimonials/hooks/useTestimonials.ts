'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTestimonials, fetchFeaturedTestimonials } from '../lib/fetchTestimonials';

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: fetchTestimonials,
    staleTime: 60 * 60 * 1000,
  });
}

export function useFeaturedTestimonials() {
  return useQuery({
    queryKey: ['testimonials', 'featured'],
    queryFn: fetchFeaturedTestimonials,
    staleTime: 60 * 60 * 1000,
  });
}
