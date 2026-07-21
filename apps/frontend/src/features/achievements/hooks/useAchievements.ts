'use client';

import { useQuery } from '@tanstack/react-query';
import { AchievementResponse } from '../types';
import { fetchAchievements } from '../lib/fetchAchievements';

/** Fetch all achievements (sorted by order server-side). */
export function useAchievements() {
  return useQuery<AchievementResponse>({
    queryKey: ['achievements'],
    queryFn: fetchAchievements,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
