'use client';

import React from 'react';
import { Users, Crown, Shield } from 'lucide-react';
import type { ChannelMember } from '@/lib/hooks/use-channels';

interface Props {
  members?: ChannelMember[] | null;
  isLoading?: boolean;
}

export function ChannelMembersPanel({ members, isLoading }: Props) {
  return (
    <div className="w-56 border-l border-[#1F1F1F] bg-black/20 flex flex-col shrink-0">
      <div className="p-4 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-[#555] font-medium">
          <Users size={13} />
          <span>Members — {members?.length ?? 0}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="p-3 text-center text-[11px] text-[#555]">Loading...</div>
        ) : !members?.length ? (
          <div className="p-3 text-center text-[11px] text-[#555]">No members</div>
        ) : (
          members.map((m) => {
            const isOwner = m.role === 'owner';
            const isAdmin = m.role === 'admin';
            const Icon = isOwner ? Crown : isAdmin ? Shield : Users;
            return (
              <div key={m.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.03]">
                <div className="w-7 h-7 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[10px] text-[#888] font-medium">
                  {m.user?.fullName?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white font-light truncate">{m.user?.fullName ?? 'Unknown'}</p>
                  {isOwner && <span className="text-[10px] text-[#D4A843]">Owner</span>}
                  {isAdmin && <span className="text-[10px] text-[#888]">Admin</span>}
                </div>
                {(isOwner || isAdmin) && <Icon size={12} className={isOwner ? 'text-[#D4A843]' : 'text-[#555]'} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}