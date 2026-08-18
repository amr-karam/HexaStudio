'use client';

import React from 'react';
import { cn } from '@/components/ui/cn';
import { usePresence } from '@/lib/hooks/use-presence';

export interface OnlineStatusProps {
  userId: string;
  className?: string;
}

export function OnlineStatus({ userId, className }: OnlineStatusProps) {
  const { isUserOnline } = usePresence();
  const isOnline = isUserOnline(userId);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium tracking-wide transition-colors duration-300',
        isOnline ? 'text-success' : 'text-tertiary',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={isOnline ? 'Online' : 'Offline'}
    >
      <span
        className={cn(
          'inline-block h-1.5 w-1.5 rounded-full',
          isOnline ? 'bg-success' : 'bg-text-tertiary',
        )}
        aria-hidden="true"
      />
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}
