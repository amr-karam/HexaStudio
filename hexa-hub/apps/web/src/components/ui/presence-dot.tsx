'use client';

import React from 'react';
import { cn } from '@/components/ui/cn';
import { usePresence } from '@/lib/hooks/use-presence';

export interface PresenceDotProps {
  userId: string;
  size?: 'sm' | 'md';
  className?: string;
}

const dotSize: Record<NonNullable<PresenceDotProps['size']>, string> = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
};

const pulseSize: Record<NonNullable<PresenceDotProps['size']>, string> = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
};

export function PresenceDot({ userId, size = 'sm', className }: PresenceDotProps) {
  const { isUserOnline } = usePresence();
  const isOnline = isUserOnline(userId);

  return (
    <span
      className={cn('relative inline-flex shrink-0', className)}
      role="status"
      aria-label={isOnline ? 'Online' : 'Offline'}
      aria-live="polite"
    >
      <span
        className={cn(
          'rounded-full transition-colors duration-300',
          dotSize[size],
          isOnline ? 'bg-success' : 'bg-text-tertiary',
        )}
      />
      {isOnline && (
        <span
          className={cn(
            'absolute inset-0 rounded-full bg-success animate-ping opacity-60',
            pulseSize[size],
          )}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
