'use client';

/**
 * HEXA Portal — Dashboard Hero
 *
 * Premium welcome hero with animated gold gradient glow and personalized
 * greeting. Includes a quick-glance KPI strip with overall progress bar,
 * next milestone, pending approvals count, and project health score.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from './PortalIcons';
import { fadeLift, makeTransition, staggerContainer, STAGGER } from '@/lib/motion';
import type { DashboardData } from '../types';

interface DashboardHeroProps {
  data: DashboardData;
  displayName: string;
  copilotOpen: boolean;
  setCopilotOpen: (open: boolean) => void;
  prefersReduced: boolean;
}

export function DashboardHero({
  data,
  displayName,
  copilotOpen,
  setCopilotOpen,
  prefersReduced,
}: DashboardHeroProps) {
  return (
    <motion.section
      variants={staggerContainer(STAGGER.page, 0)}
      initial="hidden"
      animate="visible"
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'border border-sl-silver/20 bg-sl-obsidian/70',
      )}
      aria-label="Project overview"
    >
      {/* Animated gold gradient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          initial={prefersReduced ? { opacity: 0.12 } : { opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ duration: 1.5, ease: 'ease-in-out' }}
          className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(196,176,145,0.35) 0%, rgba(196,176,145,0.08) 40%, transparent 70%)',
          }}
        />
        <motion.div
          initial={prefersReduced ? { opacity: 0.08 } : { opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 1.5, delay: 0.2, ease: 'ease-in-out' }}
          className="absolute -bottom-16 -left-16 w-[350px] h-[350px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(229,199,107,0.25) 0%, transparent 65%)',
          }}
        />
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        {/* Top row — live badge + copilot button */}
        <motion.div
          variants={fadeLift}
          custom={prefersReduced}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-2.5">
            <span
              className="relative flex h-2.5 w-2.5"
              role="status"
              aria-label="Project is live"
            >
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] uppercase tracking-widest font-mono text-sl-silver">
              Live Status
            </span>
            <span className="text-sl-warm-neutral">·</span>
            <span className="text-[11px] font-mono text-sl-silver">
              {data.companyName}
            </span>
          </div>

          <button
            onClick={() => setCopilotOpen(!copilotOpen)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold',
              'bg-gradient-to-r from-sl-gold-hover via-sl-gold-rgb to-sl-gold-hover text-sl-obsidian',
              'shadow-lg shadow-sl-gold-subtle/15 hover:shadow-sl-gold-subtle/25',
              'hover:brightness-110 transition-all duration-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-hover',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-sl-obsidian',
            )}
            aria-label="Open HEXA Copilot assistant"
          >
            <Icon name="sparkles" size={16} />
            <span>Ask HEXA Copilot</span>
          </button>
        </motion.div>

        {/* Hero text */}
        <motion.div variants={fadeLift} custom={prefersReduced}>
          <p className="text-sm font-mono text-sl-silver uppercase tracking-wider mb-2">
            Welcome back, {displayName}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-sl-alabaster tracking-tight leading-tight">
            {data.activeProjectName}
          </h1>
          <p className="text-sm text-sl-silver mt-2">
            Current Stage:{' '}
            <span className="text-sl-gold-hover font-semibold">
              {data.activeProjectStage}
            </span>
          </p>
        </motion.div>

        {/* Quick-glance KPI strip inside hero */}
        <motion.div
          variants={fadeLift}
          custom={prefersReduced}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8 pt-6 border-t border-sl-silver/10"
        >
          {/* Progress */}
          <motion.div
            variants={fadeLift}
            custom={prefersReduced}
            transition={makeTransition('entrance', 'component', 0)}
            className="p-4 rounded-xl bg-white/[0.02] border border-sl-silver/10"
          >
            <p className="text-[10px] uppercase tracking-widest font-mono text-sl-silver">
              Overall Progress
            </p>
            <div className="flex items-baseline justify-between mt-1.5">
              <p className="text-2xl font-serif font-light text-sl-alabaster">
                {data.overallProgressPercentage}%
              </p>
              <span className="text-[10px] font-mono text-emerald-400">
                On Schedule
              </span>
            </div>
            <div
              className="w-full bg-white/[0.04] h-1 rounded-full mt-2.5 overflow-hidden"
              role="progressbar"
              aria-valuenow={data.overallProgressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Overall progress: ${data.overallProgressPercentage}%`}
            >
              <motion.div
                className="bg-sl-gold-hover h-full rounded-full"
                initial={prefersReduced ? { width: `${data.overallProgressPercentage}%` } : { width: '0%' }}
                animate={{ width: `${data.overallProgressPercentage}%` }}
                transition={
                  prefersReduced
                    ? { duration: 0.01 }
                    : { duration: 1, ease: 'ease-in-out', delay: 0.8 }
                }
              />
            </div>
          </motion.div>

          {/* Next Milestone */}
          <motion.div
            variants={fadeLift}
            custom={prefersReduced}
            transition={makeTransition('entrance', 'component', 0.1)}
            className="p-4 rounded-xl bg-white/[0.02] border border-sl-silver/10"
          >
            <p className="text-[10px] uppercase tracking-widest font-mono text-sl-silver">
              Next Milestone
            </p>
            <p className="text-sm font-semibold text-sl-alabaster mt-1.5 line-clamp-1">
              {data.nextMilestoneName}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <Icon name="milestone" size={11} className="text-sl-gold-hover" />
              <p className="text-[11px] font-mono text-sl-gold-hover">
                Due {data.nextMilestoneDueDate}
              </p>
            </div>
          </motion.div>

          {/* Pending */}
          <motion.div
            variants={fadeLift}
            custom={prefersReduced}
            transition={makeTransition('entrance', 'component', 0.2)}
            className="p-4 rounded-xl bg-white/[0.02] border border-sl-silver/10"
          >
            <p className="text-[10px] uppercase tracking-widest font-mono text-sl-silver">
              Pending Approvals
            </p>
            <p className="text-2xl font-serif font-light text-sl-gold-hover mt-1.5">
              {data.pendingApprovals.length}
            </p>
            <p className="text-[11px] text-sl-silver mt-1">
              Requires Sign-off
            </p>
          </motion.div>

          {/* Health */}
          <motion.div
            variants={fadeLift}
            custom={prefersReduced}
            transition={makeTransition('entrance', 'component', 0.3)}
            className="p-4 rounded-xl bg-white/[0.02] border border-sl-silver/10"
          >
            <p className="text-[10px] uppercase tracking-widest font-mono text-sl-silver">
              Project Health
            </p>
            <p className="text-2xl font-serif font-light text-emerald-400 mt-1.5">
              {data.healthScore.score} <span className="text-sm text-sl-silver">/ 100</span>
            </p>
            <p className="text-[11px] text-emerald-400/80 mt-1">
              {data.healthScore.status}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
