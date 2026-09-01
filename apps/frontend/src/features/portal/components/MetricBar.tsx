'use client';

/**
 * HEXA Portal — MetricBar
 *
 * Animated progress bar for health metric breakdowns.
 * Artisan glass track with token-aligned status indicators.
 * Respects prefers-reduced-motion for accessibility.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DURATION, EASE, REDUCED_TRANSITION } from '@/lib/motion';

interface MetricBarProps {
  /** Label displayed above the bar (e.g., "Timeline") */
  label: string;
  /** Percentage value (0-100) */
  value: number;
  /** Stagger delay in seconds for entrance animation */
  delay: number;
  /** Whether user prefers reduced motion (passed from parent) */
  prefersReduced: boolean;
}

function getStatusConfig(value: number): { label: string; badge: string; bar: string } {
  if (value >= 90) return { label: 'Excellent', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', bar: 'bg-emerald-500' };
  if (value >= 70) return { label: 'Good', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', bar: 'bg-amber-500' };
  if (value >= 50) return { label: 'Fair', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30', bar: 'bg-amber-400' };
  return { label: 'Needs Attention', badge: 'bg-red-500/10 text-red-400 border-red-500/30', bar: 'bg-red-400' };
}

export function MetricBar({
  label,
  value,
  delay,
  prefersReduced,
}: MetricBarProps) {
  const { label: statusLabel, badge, bar } = getStatusConfig(value);

  const transition = prefersReduced
    ? REDUCED_TRANSITION
    : { duration: DURATION.page, delay, ease: EASE.entrance };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-mono text-sl-mist/60">
          {label}
        </span>
        <span className={cn('inline-flex h-5 min-w-[2.25rem] items-center justify-center rounded-full border px-2 font-mono text-[10px] uppercase tracking-wider', badge)}>
          {value}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${value}%, ${statusLabel}`}
      >
        <motion.div
          className={cn('h-full rounded-full', bar)}
          initial={prefersReduced ? { width: `${value}%` } : { width: '0%' }}
          animate={{ width: `${value}%` }}
          transition={transition}
        />
      </div>
    </div>
  );
}
