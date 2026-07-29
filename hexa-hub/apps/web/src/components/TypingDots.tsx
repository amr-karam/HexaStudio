'use client';

// ─── HEXA Hub — Typing Dots Animation ─────────────────────────────────────
// Three gold dots that bounce sequentially. Used as a loading/thinking
// indicator while waiting for the AI assistant response.
//
// Design: Minimal, cinematic, gold (#D4A843) accent on dark background.
// ───────────────────────────────────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/cn';

// ─── Props ─────────────────────────────────────────────────────────────────

export interface TypingDotsProps {
  /** Additional class names for the container */
  className?: string;
  /** Size variant — 'sm' for inline, 'md' for standalone */
  size?: 'sm' | 'md';
}

// ─── Dot Animation Variants ────────────────────────────────────────────────

const dotVariants = {
  initial: { y: 0 },
  animate: (i: number) => ({
    y: [0, -6, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 0.3,
      delay: i * 0.15,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// ─── Component ─────────────────────────────────────────────────────────────

export function TypingDots({ className, size = 'md' }: TypingDotsProps) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const gap = size === 'sm' ? 'gap-1' : 'gap-1.5';
  const padding = size === 'sm' ? 'px-2.5 py-2' : 'px-4 py-3';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-2xl rounded-tl-md',
        'bg-[#141414] border border-[#1F1F1F]',
        gap,
        padding,
        className,
      )}
      role="status"
      aria-label="AI is thinking"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          custom={i}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          className={cn(
            'rounded-full bg-[#D4A843]/70',
            dotSize,
          )}
        />
      ))}
    </div>
  );
}

export default TypingDots;
