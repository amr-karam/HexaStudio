'use client';

/**
 * HEXA Portal — Project Health Section
 *
 * Health score ring with glass card wrapper and metric breakdown bars,
 * plus the upcoming meetings sub-section.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { HealthScore } from './HealthScore';
import { MetricBar } from './MetricBar';
import { MeetingCard } from './MeetingCard';
import { EmptyState } from './EmptyState';
import { staggerContainer, fadeLift } from '@/lib/motion';
import type { DashboardData } from '../types';

interface ProjectHealthSectionProps {
  data: DashboardData;
  prefersReduced: boolean;
}

const METRIC_KEYS = ['timeline', 'budget', 'quality', 'communication'] as const;
const METRIC_LABELS: Record<(typeof METRIC_KEYS)[number], string> = {
  timeline: 'Timeline',
  budget: 'Budget',
  quality: 'Quality',
  communication: 'Communication',
};

export function ProjectHealthSection({ data, prefersReduced }: ProjectHealthSectionProps) {
  return (
    <motion.section
      className={cn(
        'rounded-2xl border border-sl-silver/20 bg-sl-obsidian/70 p-6',
      )}
      aria-label="Project health score"
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0, 0)}
    >
      <h2 className="text-base font-bold text-sl-alabaster mb-5">
        Project Health
      </h2>

      {/* Glass card wrapper for HealthScore ring */}
      <div className="flex justify-center">
        <div
          className={cn(
            'relative p-6 rounded-xl',
            'bg-white/[0.02] border border-sl-silver/15',
            'backdrop-blur-sm',
          )}
        >
          <HealthScore data={data.healthScore} />
        </div>
      </div>

      {/* Metric Breakdown Bars */}
      {data.healthScore.metricBreakdown && (
        <div className="mt-6 space-y-3" aria-label="Health metric breakdown">
          {METRIC_KEYS.map((key, idx) => (
            <MetricBar
              key={key}
              label={METRIC_LABELS[key]}
              value={data.healthScore.metricBreakdown![key]}
              delay={0.5 + idx * 0.1}
              prefersReduced={prefersReduced}
            />
          ))}
        </div>
      )}

      {/* Upcoming Meetings */}
      <motion.div
        variants={fadeLift}
        custom={prefersReduced}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-sl-alabaster">
            Upcoming Meetings
          </h3>
          {data.upcomingMeetings.length > 0 && (
            <span className="text-[10px] font-mono text-sl-silver">
              {data.upcomingMeetings.length} scheduled
            </span>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {data.upcomingMeetings.length > 0 ? (
            <motion.div
              key="meetings-list"
              className="space-y-3"
              variants={staggerContainer(0, 0)}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="list"
              aria-label="Meeting list"
            >
              {data.upcomingMeetings.map((meeting, idx) => (
                <motion.div
                  key={meeting.id}
                  variants={fadeLift}
                  custom={prefersReduced}
                  role="listitem"
                >
                  <MeetingCard meeting={meeting} index={idx} prefersReduced={prefersReduced} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="meetings-empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <EmptyState
                icon="calendar"
                title="No upcoming meetings"
                description="Your calendar is clear. Schedule a check-in with your project team."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}
