'use client';

/**
 * HEXA Portal — MetricBar
 *
 * Animated progress bar for health metric breakdowns.
 * Artisan glass track with color-coded gold/amber/emerald/red fill.
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

/**
 * Determine progress bar color based on value threshold.
 * >=90: emerald (excellent), >=70: amber (good), >=50: amber-400 (fair), <50: red (poor)
 */
function getBarColor(value: number): string {
  if (value >= 90) return 'bg-emerald-500';
  if (value >= 70) return 'bg-amber-500';
  if (value >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

/**
 * Get accessible color label for screen readers.
 */
function getColorLabel(value: number): string {
  if (value >= 90) return 'Excellent';
  if (value >= 70) return 'Good';
  if (value >= 50) return 'Fair';
  return 'Needs Attention';
}

export function MetricBar({
  label,
  value,
  delay,
  prefersReduced,
}: MetricBarProps) {
  const barColor = getBarColor(value);
  const colorLabel = getColorLabel(value);

  const transition = prefersReduced
    ? REDUCED_TRANSITION
    : { duration: DURATION.page, delay, ease: EASE.entrance };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-mono text-sl-mist/60">
          {label}
        </span>
        <span className="text-xs font-mono text-sl-mist/60">
          {value}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${value}%, ${colorLabel}`}
      >
        <motion.div
          className={cn('h-full rounded-full', barColor)}
          initial={prefersReduced ? { width: `${value}%` } : { width: '0%' }}
          animate={{ width: `${value}%` }}
          transition={transition}
        />
      </div>
    </div>
  );
}