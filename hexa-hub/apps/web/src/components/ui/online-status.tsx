'use client';

import React from 'react';
import { cn } from './cn';
import { usePresence } from '@/lib/hooks/use-presence';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OnlineStatusProps {
  /** User ID to check presence for. */
  userId: string;
  /** Optional additional classes. */
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Displays a user's online status as text.
 *
 * - **Online**: green "Online" label.
 * - **Offline**: muted "Offline" label.
 *
 * ```tsx
 * <OnlineStatus userId="abc-123" />
 * ```
 */
export function OnlineStatus({ userId, className }: OnlineStatusProps) {
  const { isUserOnline } = usePresence();
  const isOnline = isUserOnline(userId);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium tracking-wide transition-colors duration-300',
        isOnline ? 'text-emerald-400' : 'text-neutral-500',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={isOnline ? 'Online' : 'Offline'}
    >
      {/* Inline dot */}
      <span
        className={cn(
          'inline-block h-1.5 w-1.5 rounded-full',
          isOnline ? 'bg-emerald-400' : 'bg-neutral-600',
        )}
        aria-hidden="true"
      />
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}