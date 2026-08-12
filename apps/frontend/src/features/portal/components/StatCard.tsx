'use client';

/**
 * HEXA Portal — Stat Card (KPI)
 *
 * Displays a key metric with icon, value, label, and trend indicator.
 * Crafted as an obsidian instrument panel: artisan glass surface with a gold
 * specular top hairline, radial gold aura on hover, gradient-edged icon plate,
 * glass trend pill, and (for positive trends) a gold-gradient serif value.
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
  const isPositiveTrend = stat.trend.direction === 'up';

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
        'artisan-glass artisan-specular-top',
        'relative overflow-hidden rounded-xl p-6',
        'hover:border-accent/30 transition-colors duration-700 ease-[var(--hexa-ease-interaction)]',
        'group cursor-default',
      )}
    >
      {/* Gold radial aura — revealed on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-accent/5 opacity-0 blur-2xl transition-opacity duration-700 ease-[var(--hexa-ease-interaction)] group-hover:opacity-100"
      />

      {/* Icon + Trend */}
      <div className="flex items-center justify-between mb-6">
        {/* Icon plate — gold gradient border-on-hover, faint gold tint */}
        <div className="relative w-10 h-10 rounded-lg p-px bg-gradient-to-br from-accent/25 via-accent/[0.07] to-transparent opacity-40 transition-opacity duration-700 ease-[var(--hexa-ease-interaction)] group-hover:opacity-100">
          <div className="relative flex h-full w-full items-center justify-center rounded-[7px] border border-border/20 bg-surface-light/50 transition-colors duration-700 group-hover:border-accent/40">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[7px] bg-accent/[0.04]"
            />
            <Icon
              name={stat.icon as IconName}
              size={16}
              className="relative text-neutral-500 group-hover:text-accent transition-colors duration-500"
            />
          </div>
        </div>

        {/* Trend — glass pill */}
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5',
            'bg-white/[0.03] border border-white/5',
            'text-[10px] font-mono tracking-[0.2em] uppercase',
            trend.color,
          )}
        >
          <Icon name={trend.icon} size={10} />
          <span>{stat.trend.value}%</span>
        </div>
      </div>

      {/* Value — gold gradient for positive trends */}
      <p
        className={cn(
          'text-4xl font-serif font-light tracking-tight mb-2',
          isPositiveTrend ? 'text-gradient-gold' : 'text-foreground/90',
        )}
      >
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