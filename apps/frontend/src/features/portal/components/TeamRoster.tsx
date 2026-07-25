'use client';

/**
 * HEXA Portal v3.0 — Team Roster
 *
 * Displays assigned HEXA Studio team members for a project.
 * Fetches from GET /api/portal/projects/:projectId/team.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/constants';
import { Icon } from './PortalIcons';
import type { PortalTeamMember } from '../types';

interface TeamRosterProps {
  projectId: number;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  'bg-amber-500/20 text-amber-400',
  'bg-blue-500/20 text-blue-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-purple-500/20 text-purple-400',
  'bg-rose-500/20 text-rose-400',
  'bg-cyan-500/20 text-cyan-400',
];

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

async function fetchProjectTeam(projectId: number): Promise<PortalTeamMember[]> {
  const res = await fetch(`${API_BASE_URL}/api/portal/projects/${projectId}/team`, {
    credentials: 'include',
  });
  if (!res.ok) return [];
  return res.json();
}

export function TeamRoster({ projectId }: TeamRosterProps) {
  const { data: members = [], isLoading } = useQuery<PortalTeamMember[]>({
    queryKey: ['portal-team', projectId],
    queryFn: () => fetchProjectTeam(projectId),
  });

  if (isLoading) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="h-4 w-32 bg-neutral-800 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800 animate-pulse" />
              <div className="space-y-1">
                <div className="h-3 w-24 bg-neutral-800 rounded animate-pulse" />
                <div className="h-2 w-16 bg-neutral-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="users" className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-neutral-100">Project Team</h3>
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">
          {members.length} members
        </span>
      </div>

      <div className="space-y-3">
        {members.map((member, idx) => (
          <div
            key={member.id}
            className="flex items-center space-x-4 p-3 bg-neutral-950 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors group"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(idx)}`}
            >
              {getInitials(member.name)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-200 group-hover:text-amber-400 transition-colors truncate">
                {member.name}
              </p>
              <p className="text-[11px] text-neutral-500 truncate">{member.role}</p>
            </div>

            <a
              href={`mailto:${member.email}`}
              className="text-neutral-600 hover:text-amber-400 transition-colors shrink-0"
              title={`Email ${member.name}`}
            >
              <Icon name="send" className="w-4 h-4" />
            </a>
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-8">
            <Icon name="users" className="w-8 h-8 text-neutral-700 mx-auto" />
            <p className="text-xs text-neutral-500 mt-3">No team members assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
