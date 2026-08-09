'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon?: React.ReactNode;
}

export interface StatsBlockProps {
  stats: StatItem[];
  className?: string;
  layout?: 'grid' | 'row' | 'list';
  animationDelay?: number;
}

export function StatsBlock({ stats, className, layout = 'grid', animationDelay = 0 }: StatsBlockProps) {
  const reduceMotion = useReducedMotion();

  const formatValue = (value: number, suffix?: string, prefix?: string): string => {
    if (suffix) return `${prefix || ''}${value.toLocaleString()}${suffix}`;
    if (prefix) return `${prefix}${value.toLocaleString()}`;
    return value.toLocaleString();
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'grid',
          layout === 'grid' && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
          layout === 'row' && 'flex flex-wrap gap-8',
          layout === 'list' && 'flex flex-col gap-4'
        )}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: animationDelay + index * 0.1 }}
            className={cn(
              'relative',
              layout === 'list' && 'flex items-center gap-4 p-4',
              !layout || layout === 'grid' ? 'text-center' : ''
            )}
          >
            {/* Icon */}
            {stat.icon && (
              <div className="flex items-center justify-center mb-3 w-12 h-12 rounded-full bg-accent/10">
                {stat.icon}
              </div>
            )}

            {/* Value */}
            <div className="text-4xl md:text-5xl font-serif font-light text-accent tabular-nums">
              {formatValue(stat.value, stat.suffix, stat.prefix)}
            </div>

            {/* Label */}
            <div className="mt-2 text-sm text-neutral-400 font-light uppercase tracking-wider">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
