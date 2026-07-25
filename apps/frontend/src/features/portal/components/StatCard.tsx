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
        'relative p-5 rounded-xl',
        'bg-surface border border-border/30',
        'hover:border-border-light/50 transition-colors duration-300',
        'group cursor-default',
      )}
    >
      {/* Icon + Trend */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-border/20 flex items-center justify-center group-hover:border-accent/20 transition-colors duration-300">
          <Icon
            name={stat.icon as IconName}
            size={18}
            className="text-neutral-500 group-hover:text-accent transition-colors duration-300"
          />
        </div>

        <div className={cn('flex items-center gap-1 text-xs font-mono', trend.color)}>
          <Icon name={trend.icon} size={12} />
          <span>{stat.trend.value}%</span>
        </div>
      </div>

      {/* Value */}
      <p className="text-3xl font-serif font-light text-foreground tracking-tight mb-1">
        {formatValue(stat.value, stat.format)}
      </p>

      {/* Label */}
      <p className="text-xs text-neutral-500 uppercase tracking-wider font-mono">
        {stat.label}
      </p>

      {/* Subtle gold accent line on hover */}
      <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-accent/0 group-hover:bg-accent/20 transition-colors duration-500" />
    </motion.div>
  );
}
