'use client';

/**
 * HEXA Portal — Metric Bar
 *
 * Animated progress bar with a colored health indicator (green → amber → orange → red)
 * and a mono label. Respects `prefers-reduced-motion`.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE, DURATION } from '@/lib/motion';

export interface MetricBarProps {
  label: string;
  value: number;
  delay: number;
  prefersReduced: boolean;
}

export function MetricBar({ label, value, delay, prefersReduced }: MetricBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-mono text-sl-silver">
          {label}
        </span>
        <span className="text-xs font-mono text-sl-alabaster">{value}%</span>
      </div>
      <div
        className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${value}%`}
      >
        <motion.div
          className={cn(
            'h-full rounded-full',
            value >= 90
              ? 'bg-emerald-400'
              : value >= 70
                ? 'bg-amber-400'
                : value >= 50
                  ? 'bg-orange-400'
                  : 'bg-red-400',
          )}
          initial={prefersReduced ? { width: `${value}%` } : { width: '0%' }}
          animate={{ width: `${value}%` }}
          transition={
            prefersReduced
              ? { duration: 0.01 }
              : { duration: DURATION.page, delay, ease: EASE.entrance }
          }
        />
      </div>
    </div>
  );
}
