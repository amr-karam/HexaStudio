'use client';

import React from 'react';
import { cn } from './cn';
import { usePresence } from '@/lib/hooks/use-presence';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PresenceDotProps {
  /** User ID to check presence for. */
  userId: string;
  /** Dot size. */
  size?: 'sm' | 'md';
  /** Optional additional classes. */
  className?: string;
}

// ─── Style Maps ─────────────────────────────────────────────────────────────

const dotSize: Record<NonNullable<PresenceDotProps['size']>, string> = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
};

const pulseSize: Record<NonNullable<PresenceDotProps['size']>, string> = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
};

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Small colored dot that indicates a user's online/offline status.
 *
 * - **Online**: green dot with a subtle ping animation.
 * - **Offline**: gray dot, static.
 *
 * ```tsx
 * <PresenceDot userId="abc-123" size="md" />
 * ```
 */
export function PresenceDot({
  userId,
  size = 'sm',
  className,
}: PresenceDotProps) {
  const { isUserOnline } = usePresence();
  const isOnline = isUserOnline(userId);

  return (
    <span
      className={cn('relative inline-flex shrink-0', className)}
      role="status"
      aria-label={isOnline ? 'Online' : 'Offline'}
      aria-live="polite"
    >
      {/* Base dot */}
      <span
        className={cn(
          'rounded-full transition-colors duration-300',
          dotSize[size],
          isOnline ? 'bg-emerald-400' : 'bg-neutral-600',
        )}
      />

      {/* Pulse ring — only visible when online */}
      {isOnline && (
        <span
          className={cn(
            'absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60',
            pulseSize[size],
          )}
          aria-hidden="true"
        />
      )}
    </span>
  );
}