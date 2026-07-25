'use client';

/**
 * HEXA Portal — Health Score (Circular Progress)
 *
 * SVG-based circular progress indicator with animated fill on mount.
 * Color-coded: green (>80), yellow (60-80), orange (40-60), red (<40).
 * Score number in center, status text below.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE, DURATION } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { HealthScoreData } from '../types';

interface HealthScoreProps {
  data: HealthScoreData;
  className?: string;
}

function getScoreColor(score: number): { stroke: string; text: string; glow: string } {
  if (score > 80) return { stroke: '#22c55e', text: 'text-emerald-400', glow: 'rgba(34, 197, 94, 0.15)' };
  if (score > 60) return { stroke: '#eab308', text: 'text-yellow-400', glow: 'rgba(234, 179, 8, 0.15)' };
  if (score > 40) return { stroke: '#f97316', text: 'text-orange-400', glow: 'rgba(249, 115, 22, 0.15)' };
  return { stroke: '#ef4444', text: 'text-red-400', glow: 'rgba(239, 68, 68, 0.15)' };
}

function getStatusLabel(score: number): string {
  if (score > 80) return 'Excellent';
  if (score > 60) return 'Good';
  if (score > 40) return 'Needs Attention';
  return 'Critical';
}

const CIRCLE_RADIUS = 54;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export function HealthScore({ data, className }: HealthScoreProps) {
  const prefersReduced = useReducedMotion();
  const { score } = data;
  const colors = getScoreColor(score);
  const statusLabel = getStatusLabel(score);

  // Animated offset
  const [animatedOffset, setAnimatedOffset] = useState(CIRCLE_CIRCUMFERENCE);

  useEffect(() => {
    if (prefersReduced) {
      setAnimatedOffset(CIRCLE_CIRCUMFERENCE - (score / 100) * CIRCLE_CIRCUMFERENCE);
      return;
    }

    const timeout = setTimeout(() => {
      setAnimatedOffset(CIRCLE_CIRCUMFERENCE - (score / 100) * CIRCLE_CIRCUMFERENCE);
    }, 100);

    return () => clearTimeout(timeout);
  }, [score, prefersReduced]);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative w-36 h-36">
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full opacity-40 blur-xl"
          style={{ background: colors.glow }}
        />

        {/* SVG Circle */}
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full -rotate-90"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-border/30"
          />

          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={animatedOffset}
            style={{
              transition: prefersReduced
                ? 'none'
                : `stroke-dashoffset ${DURATION.page}s ${EASE.entrance.join(', ')}`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: DURATION.component,
              ease: EASE.entrance,
              delay: prefersReduced ? 0 : 0.3,
            }}
            className="text-4xl font-serif font-light text-foreground"
          >
            {score}
          </motion.span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono -mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {/* Status label */}
      <motion.p
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: prefersReduced ? 0 : 0.5, duration: DURATION.component }}
        className={cn('text-sm font-mono uppercase tracking-wider mt-3', colors.text)}
      >
        {statusLabel}
      </motion.p>
      <p className="text-xs text-neutral-600 mt-1">Project Health</p>
    </div>
  );
}
