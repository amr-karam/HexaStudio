'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from 'framer-motion';
import { EASE, DURATION } from '@/lib/motion';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

export interface StatItem {
  label: string;
  value: number | string;
  icon: IconName;
  trend: { value: number; direction: 'up' | 'down' | 'neutral' };
  format?: 'number' | 'currency' | 'percentage';
}

export interface DashboardStatsGridProps {
  stats: StatItem[];
  className?: string;
}

function StatCard({ stat, index, prefersReduced }: { stat: StatItem; index: number; prefersReduced: boolean }) {
  const { staticMode } = useMotionPolicy();
  const animate = !(staticMode || prefersReduced);

  const formatValue = (value: number | string, format?: StatItem['format']) => {
    if (typeof value === 'string') return value;
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
      case 'percentage':
        return `${value}%`;
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-red-500',
    neutral: 'text-sl-mist/60',
  };

  const trendIcons = {
    up: 'arrow-up-right' as IconName,
    down: 'arrow-down-right' as IconName,
    neutral: 'minus' as IconName,
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: DURATION.component,
        delay: prefersReduced ? 0 : 0.1 + index * 0.08,
        ease: EASE.entrance,
      }}
      className="artisan-glass relative overflow-hidden rounded-xl p-6 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-sl-silver/20 rounded-lg">
          <Icon name={stat.icon} className="w-5 h-5 text-amber-500" />
        </div>
        <span
          className={`text-[10px] font-mono uppercase tracking-[0.2em] ${trendColors[stat.trend.direction]}`}
        >
          <Icon name={trendIcons[stat.trend.direction]} className="w-3 h-3 inline mr-1" />
          {stat.trend.value >= 0 ? '+' : ''}{stat.trend.value}%
        </span>
      </div>

      <div className="space-y-1">
        <motion.div
          initial={false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'power2.out' }}
        >
          <p className="text-3xl sm:text-4xl font-mono font-bold text-foreground tabular-nums">
            {formatValue(stat.value, stat.format)}
          </p>
        </motion.div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-sl-mist/60">
          {stat.label}
        </p>
      </div>

      <motion.div
        initial={false}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: EASE.entrance }}
        className="mt-4 h-1.5 bg-gradient-to-r from-amber-500/20 to-amber-500/80 rounded-full overflow-hidden"
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'power2.out' }}
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
        />
      </motion.div>
    </motion.div>
  );
}

export interface DashboardStatsGridProps {
  stats: StatItem[];
  className?: string;
}

export function DashboardStatsGrid({ stats, className }: DashboardStatsGridProps) {
  const prefersReduced = useReducedMotion();
  const { staticMode } = useMotionPolicy();
  const animate = !(staticMode || prefersReduced);

  return (
    <section aria-label="Key performance indicators" className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-sl-mist/60">Key Metrics</h2>
        <span className="text-[10px] font-mono text-sl-mist/60">{stats.length} metrics</span>
      </div>

      <motion.div
        initial={animate ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        role="list"
        aria-label="Key performance indicators"
      >
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} prefersReduced={prefersReduced} />
        ))}
      </motion.div>
    </section>
  );
}

export default DashboardStatsGrid;