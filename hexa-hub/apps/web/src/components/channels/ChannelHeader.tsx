'use client';

import React from 'react';
import { Hash, Lock } from 'lucide-react';
import { PresenceIndicator } from '@/components/PresenceTypingIndicators';
import type { Channel } from '@/lib/hooks/use-channels';

interface Props {
  channel?: Channel | null;
  isLoading?: boolean;
}

export function ChannelHeader({ channel, isLoading }: Props) {
  if (isLoading) return <div className="p-5 border-b border-[#1F1F1F] animate-pulse"><div className="h-5 bg-neutral-800 rounded w-40" /></div>;
  if (!channel) return null;

  const Icon = channel.type === 'private' ? Lock : Hash;

  return (
    <div className="p-5 border-b border-[#1F1F1F] flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Icon size={18} className="text-[#555]" />
        <h2 className="text-lg font-serif font-light text-white">{channel.name}</h2>
      </div>
      {channel.description && (
        <span className="text-[11px] text-[#555] truncate max-w-xs">{channel.description}</span>
      )}
    </div>
  );
}