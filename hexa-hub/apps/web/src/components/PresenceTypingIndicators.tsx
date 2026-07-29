'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ─── PresenceIndicator ──────────────────────────────────────────────────────

interface PresenceIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

/**
 * Renders a pulsing green dot for online users, grey for offline.
 * Optionally shows "Online" / "Offline" label.
 */
export function PresenceIndicator({
  isOnline,
  size = 'sm',
  showLabel = false,
  className = '',
}: PresenceIndicatorProps) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative flex items-center justify-center">
        {/* Outer ring pulse */}
        {isOnline && (
          <motion.span
            className={`absolute ${dotSize} rounded-full bg-emerald-400/30`}
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        )}
        {/* Inner dot */}
        <span
          className={`relative ${dotSize} rounded-full ${
            isOnline
              ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]'
              : 'bg-neutral-600'
          }`}
        />
      </span>
      {showLabel && (
        <span
          className={`text-[11px] font-medium ${
            isOnline ? 'text-emerald-400' : 'text-neutral-500'
          }`}
        >
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </span>
  );
}

// ─── TypingIndicator ────────────────────────────────────────────────────────

interface TypingIndicatorProps {
  users: { userId: string; email: string }[];
  className?: string;
}

/**
 * Animated typing indicator with pulsing dots.
 * Shows "X is typing..." or "X and Y are typing..." for multiple users.
 */
export function TypingIndicator({ users, className = '' }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const label =
    users.length === 1
      ? users[0].email
      : users.length === 2
        ? `${users[0].email} and ${users[1].email}`
        : `${users.length} people`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className={`flex items-center gap-2 px-1 text-[12px] text-emerald-400/80 font-light ${className}`}
    >
      {/* Animated dots */}
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1 h-1 rounded-full bg-emerald-400"
            animate={{ y: [0, -3, 0] }}
            transition={{
              repeat: Infinity,
              duration: 0.6,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </span>
      <span>
        {label} {users.length === 1 ? 'is' : 'are'} typing...
      </span>
    </motion.div>
  );
}