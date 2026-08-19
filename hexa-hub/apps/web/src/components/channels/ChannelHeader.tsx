'use client';

import React from 'react';
import { Hash, Lock } from 'lucide-react';
import type { Channel } from '@/lib/hooks/use-channels';

interface Props {
  channel?: Channel | null;
  isLoading?: boolean;
}

export function ChannelHeader({ channel, isLoading }: Props) {
  if (isLoading) return <div className="p-5 border-b border-border animate-pulse"><div className="h-5 bg-surface rounded w-40" /></div>;
  if (!channel) return null;

  const Icon = channel.type === 'private' ? Lock : Hash;

  return (
    <div className="p-5 border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Icon size={18} className="text-tertiary" />
        <h2 className="text-lg font-serif font-light text-foreground">{channel.name}</h2>
      </div>
      {channel.description && (
        <span className="text-[11px] text-tertiary truncate max-w-xs">{channel.description}</span>
      )}
    </div>
  );
}
