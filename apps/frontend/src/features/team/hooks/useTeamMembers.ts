'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTeamMembers } from '../lib/fetchTeamMembers';

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: fetchTeamMembers,
    staleTime: 60 * 60 * 1000,
  });
}
