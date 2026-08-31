'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from 'framer-motion';
import { EASE, DURATION } from '@/lib/motion';

interface DashboardHeroProps {
  className?: string;
  companyName?: string;
  activeProjectName?: string;
  activeProjectStage?: string;
  overallProgressPercentage?: number;
  nextMilestoneName?: string;
  nextMilestoneDueDate?: string;
}

export function DashboardHero({
  className,
  companyName = 'HexaStudio',
  activeProjectName = 'Crystal Pavilion',
  activeProjectStage = 'Design Development',
  overallProgressPercentage = 65,
  nextMilestoneName = 'Design Development Complete',
  nextMilestoneDueDate = '2024-02-15',
}: DashboardHeroProps) {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-sl-silver/20 bg-sl-obsidian p-6 sm:p-8 lg:p-10',
        className
      )}
      aria-labelledby="dashboard-hero-title"
    >
      <motion.div
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: DURATION.component,
          ease: EASE.entrance,
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <motion.span
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: DURATION.component, delay: 0.1, ease: EASE.entrance }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-[0.2em]"
            >
              <span className="relative w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Live Project
            </motion.span>

            <motion.h1
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.component, delay: 0.2, ease: EASE.entrance }}
              id="dashboard-hero-title"
              className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-tight text-foreground leading-tight"
            >
              {companyName} Client Portal
            </motion.h1>

            <motion.p
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.component, delay: 0.3, ease: EASE.entrance }}
              className="text-sl-mist/60 text-base sm:text-lg max-w-xl"
            >
              Welcome back. Here's an overview of your active projects and key metrics.
            </motion.p>
          </div>

          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: DURATION.component, delay: 0.4, ease: EASE.entrance }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:ml-auto"
          >
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-sl-mist/60">
                  Active Project
                </p>
                <p className="font-serif text-xl font-light text-foreground">
                  {activeProjectName}
                </p>
              </div>
              <div className="h-10 w-px bg-sl-silver/20 hidden sm:block" />
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-sl-mist/60">
                  Stage
                </p>
                <p className="font-serif text-xl font-light text-foreground">
                  {activeProjectStage}
                </p>
              </div>
            </div>

            <div className="relative flex items-center gap-4 p-4 bg-white/[0.02] border border-sl-silver/20 rounded-xl">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 24 24" className="w-full h-full transform -rotate-90">
                  <circle
                    className="text-sl-silver/20"
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="3"
                    fill="none"
                    stroke="currentColor"
                  />
                  <motion.circle
                    className="text-amber-500"
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="3"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={2 * Math.PI * 10}
                    initial={prefersReduced ? { pathLength: 1 } : { pathLength: 0 }}
                    animate={{ pathLength: overallProgressPercentage / 100 }}
                    transition={{
                      duration: prefersReduced ? 0.01 : 1.2,
                      delay: 0.6,
                      ease: EASE.entrance,
                    }}
                    style={{
                      strokeDashoffset: 2 * Math.PI * 10 * (1 - overallProgressPercentage / 100),
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {overallProgressPercentage}%
                  </span>
                </div>
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-sl-mist/60">
                  Overall Progress
                </p>
                <p className="font-serif text-lg font-light text-foreground">
                  {overallProgressPercentage}% Complete
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-sl-silver/20 rounded-xl">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-sl-mist/60">
                Next Milestone
              </p>
              <p className="font-serif text-base font-light text-foreground mt-1">
                {nextMilestoneName}
              </p>
              <p className="text-[10px] font-mono text-sl-mist/60 mt-1 flex items-center gap-1">
                <Icon name="calendar" className="w-3 h-3" />
                Due: {nextMilestoneDueDate}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default DashboardHero;