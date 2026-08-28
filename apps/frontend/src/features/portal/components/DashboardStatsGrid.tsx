'use client';

/**
 * HEXA Portal — Dashboard Stats Grid
 *
 * Staggered grid of KPI stat cards with fadeLift entrance choreography.
 */

import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/motion';
import { StatCard } from './StatCard';
import type { StatItem } from '../types';

interface DashboardStatsGridProps {
  stats: StatItem[];
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <motion.section
      aria-label="Key performance indicators"
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.1, 0.1)}
    >
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <StatCard key={stat.label} stat={stat} index={idx} />
          ))}
      </motion.div>
    </motion.section>
  );
}
