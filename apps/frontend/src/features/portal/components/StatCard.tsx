'use client';

/**
 * HEXA Portal — Stat Card (KPI)
 *
 * Displays a key metric with icon, value, label, and trend indicator.
 * Subtle hover lift animation. Stagger-entrance ready.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './PortalIcons';
import { fadeLift, makeTransition } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { StatItem } from '../types';

interface StatCardProps {
  stat: StatItem;
  index?: number;
}

const TREND_CONFIG = {
  up: { icon: 'arrow-up-right' as IconName, color: 'text-emerald-400', label: 'Increased' },
  down: { icon: 'arrow-down-right' as IconName, color: 'text-red-400', label: 'Decreased' },
  neutral: { icon: 'minus' as IconName, color: 'text-neutral-500', label: 'No change' },
} as const;

function formatValue(value: number, format?: StatItem['format']): string {
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString()}`;
    case 'percentage':
      return `${value}%`;
    default:
      return value.toLocaleString();
  }
}

export function StatCard({ stat, index = 0 }: StatCardProps) {
  const prefersReduced = useReducedMotion();
  const trend = TREND_CONFIG[stat.trend.direction];

  return (
    <motion.div
      variants={fadeLift}
      initial="hidden"
      animate="visible"
      custom={prefersReduced}
      transition={makeTransition('entrance', 'component', index * 0.08)}
      whileHover={
        prefersReduced
          ? undefined
          : { y: -2, transition: { duration: 0.2 } }
      }
      className={cn(
        'relative p-6 rounded-sm',
        'bg-background/40 backdrop-blur-sm border border-white/5',
        'hover:border-accent/20 transition-all duration-700 ease-out-expo',
        'group cursor-default',
      )}
    >
      {/* Icon + Trend */}
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 rounded-none bg-surface-light/50 border border-border/20 flex items-center justify-center group-hover:border-accent/30 transition-colors duration-500">
          <Icon
            name={stat.icon as IconName}
            size={16}
            className="text-neutral-500 group-hover:text-accent transition-colors duration-500"
          />
        </div>

        <div className={cn('flex items-center gap-1 text-[10px] font-mono tracking-[0.2em] uppercase', trend.color)}>
          <Icon name={trend.icon} size={10} />
          <span>{stat.trend.value}%</span>
        </div>
      </div>

      {/* Value */}
      <p className="text-4xl font-serif font-light text-foreground/90 tracking-tight mb-2">
        {formatValue(stat.value, stat.format)}
      </p>

      {/* Label */}
      <p className="text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-mono">
        {stat.label}
      </p>

      {/* Subtle gold accent line on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-accent/0 group-hover:bg-accent/30 transition-colors duration-1000" />
    </motion.div>
  );
}
