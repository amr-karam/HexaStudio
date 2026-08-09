'use client';

/**
 * HEXA Portal v3.0 — Analytics Dashboard
 *
 * World-class executive analytics with animated SVG charts,
 * activity heatmap, milestone timeline, and budget donut.
 * All visualizations built with pure SVG + framer-motion — zero chart libraries.
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Icon, type IconName } from './PortalIcons';
import {
  fadeLift,
  staggerContainer,
  makeTransition,
  REDUCED_TRANSITION,
  EASE,
} from '@/lib/motion';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type DateRange = '7d' | '30d' | '90d' | 'all';

interface KpiData {
  label: string;
  value: string;
  subtext: string;
  icon: IconName;
  trend: { value: string; direction: 'up' | 'down' | 'neutral' };
  accentClass?: string;
}

interface PhaseData {
  name: string;
  label: string;
  percentage: number;
  status: 'completed' | 'in_progress' | 'pending';
}

interface MilestoneData {
  label: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface HeatmapCell {
  day: number;
  week: number;
  intensity: number;
}

interface LinePoint {
  day: string;
  value: number;
}

interface BudgetSegment {
  label: string;
  percentage: number;
  color: string;
}

/* -------------------------------------------------------------------------- */
/*  Static Data                                                               */
/* -------------------------------------------------------------------------- */

const DATE_RANGE_OPTIONS: { key: DateRange; label: string }[] = [
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
  { key: 'all', label: 'All' },
];

const KPI_DATA: KpiData[] = [
  {
    label: 'Milestone Accuracy',
    value: '98.4%',
    subtext: '+2.1% vs baseline target',
    icon: 'check-circle',
    trend: { value: '2.1', direction: 'up' },
  },
  {
    label: 'Avg Response Time',
    value: '2.3hrs',
    subtext: 'Fastest this quarter',
    icon: 'clock',
    trend: { value: '14', direction: 'up' },
  },
  {
    label: 'Deliverables Approved',
    value: '24/28',
    subtext: '4 pending final review',
    icon: 'file-check',
    trend: { value: '85', direction: 'neutral' },
  },
  {
    label: 'Overall Health Score',
    value: '94',
    subtext: 'Tier 1 Premier Status',
    icon: 'sparkles',
    trend: { value: '6', direction: 'up' },
    accentClass: 'text-accent',
  },
];

const PHASE_DATA: PhaseData[] = [
  { name: 'phase-1', label: 'Phase 1: Discovery & Conceptual Research', percentage: 100, status: 'completed' },
  { name: 'phase-2', label: 'Phase 2: 3D Exterior & Interior Renderings', percentage: 68, status: 'in_progress' },
  { name: 'phase-3', label: 'Phase 3: VR Interactive Tour & Handover', percentage: 0, status: 'pending' },
];

const MILESTONE_DATA: MilestoneData[] = [
  { label: 'Kickoff', date: 'Jan 15', status: 'completed' },
  { label: 'Concept Approved', date: 'Feb 08', status: 'completed' },
  { label: '3D Drafts', date: 'Mar 12', status: 'completed' },
  { label: 'Final Renders', date: 'Apr 20', status: 'current' },
  { label: 'VR Tour', date: 'May 30', status: 'upcoming' },
  { label: 'Handover', date: 'Jun 15', status: 'upcoming' },
];

const RESPONSE_TIME_DATA: LinePoint[] = [
  { day: 'Mon', value: 3.1 },
  { day: 'Tue', value: 2.8 },
  { day: 'Wed', value: 1.9 },
  { day: 'Thu', value: 2.4 },
  { day: 'Fri', value: 2.1 },
  { day: 'Sat', value: 3.0 },
  { day: 'Sun', value: 2.3 },
];

const FILE_UPLOADS_DAILY = [2, 1, 3, 0, 2, 1, 4, 1, 2, 0, 3, 2, 1, 0, 2, 3, 1, 2, 0, 1, 2, 1, 3, 0, 2, 1, 4, 2, 1, 3];

const BUDGET_SEGMENTS: BudgetSegment[] = [
  { label: 'Paid', percentage: 50, color: 'url(#goldGradient)' },
  { label: 'Outstanding', percentage: 25, color: '#D4AF37' },
  { label: 'Remaining', percentage: 25, color: '#2A2A2E' },
];

const ACTIVITY_HEATMAP_DATA: HeatmapCell[] = (() => {
  const intensities = [
    [0.8, 0.4, 0.6, 1.0, 0.2, 0.0, 0.3],
    [0.5, 0.9, 0.3, 0.7, 0.8, 0.1, 0.0],
    [0.2, 0.6, 1.0, 0.4, 0.5, 0.3, 0.7],
    [0.9, 0.3, 0.7, 0.6, 0.1, 0.8, 0.4],
  ];
  const cells: HeatmapCell[] = [];
  for (let week = 0; week < 4; week++) {
    for (let day = 0; day < 7; day++) {
      cells.push({ day, week, intensity: intensities[week][day] });
    }
  }
  return cells;
})();

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/* -------------------------------------------------------------------------- */
/*  Animation Variants                                                        */
/* -------------------------------------------------------------------------- */

const sectionVariant = (reduced: boolean) => ({
  hidden: { opacity: 0, y: 20 },
  visible: reduced
    ? { opacity: 1, y: 0, transition: REDUCED_TRANSITION }
    : { opacity: 1, y: 0, transition: makeTransition('entrance', 'component') },
});

const staggerParent = (reduced: boolean) =>
  staggerContainer(reduced ? 0 : 0.06);

const barFillVariant = (percentage: number, reduced: boolean) => ({
  hidden: { width: '0%' },
  visible: reduced
    ? { width: `${percentage}%`, transition: REDUCED_TRANSITION }
    : {
        width: `${percentage}%`,
        transition: { duration: 1.2, ease: EASE.entrance, delay: 0.3 },
      },
});

const lineDrawVariant = (reduced: boolean) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: reduced
    ? { pathLength: 1, opacity: 1, transition: REDUCED_TRANSITION }
    : {
        pathLength: 1,
        opacity: 1,
        transition: { duration: 2, ease: EASE.entrance, delay: 0.4 },
      },
});

/* -------------------------------------------------------------------------- */
/*  Sub-Components                                                            */
/* -------------------------------------------------------------------------- */

function GoldDot() {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full bg-accent flex-shrink-0"
      aria-hidden="true"
    />
  );
}

function SectionCard({
  children,
  className,
  ariaLabel,
  reduced,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  ariaLabel: string;
  reduced: boolean;
  delay?: number;
}) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      custom={reduced}
      variants={sectionVariant(reduced)}
      transition={makeTransition('entrance', 'component', delay)}
      aria-label={ariaLabel}
      className={cn(
        'rounded-xl bg-surface border border-border/30 p-6',
        'hover:border-border-light/40 transition-colors duration-500',
        className,
      )}
    >
      {children}
    </motion.section>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <GoldDot />
      <div>
        <h3 className="text-sm font-semibold text-foreground tracking-wide">{title}</h3>
        {subtitle && (
          <p className="text-xs text-textMuted mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  KPI Cards                                                                 */
/* -------------------------------------------------------------------------- */

function KpiCard({ kpi, index, reduced }: { kpi: KpiData; index: number; reduced: boolean }) {
  const trendColor = kpi.trend.direction === 'up'
    ? 'text-emerald-400'
    : kpi.trend.direction === 'down'
      ? 'text-red-400'
      : 'text-textMuted';

  const trendIcon: IconName = kpi.trend.direction === 'up'
    ? 'arrow-up-right'
    : kpi.trend.direction === 'down'
      ? 'arrow-down-right'
      : 'minus';

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.97 },
        visible: reduced
          ? { opacity: 1, y: 0, scale: 1, transition: REDUCED_TRANSITION }
          : {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: makeTransition('entrance', 'component', index * 0.08),
            },
      }}
      initial="hidden"
      animate="visible"
      whileHover={reduced ? undefined : { y: -3, transition: { duration: 0.25, ease: EASE.interaction } }}
      className={cn(
        'relative p-5 rounded-xl group cursor-default',
        'bg-surface border border-border/30',
        'hover:border-accent/20 transition-colors duration-400',
      )}
    >
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            'bg-white/[0.03] border border-border/20',
            'group-hover:border-accent/25 transition-colors duration-300',
          )}
        >
          <Icon
            name={kpi.icon}
            size={18}
            className="text-textMuted group-hover:text-accent transition-colors duration-300"
          />
        </div>
        <div className={cn('flex items-center gap-1 text-xs font-mono', trendColor)}>
          <Icon name={trendIcon} size={11} />
          <span>{kpi.trend.value}%</span>
        </div>
      </div>

      {/* Value */}
      <p
        className={cn(
          'text-3xl font-serif font-light tracking-tight mb-1',
          kpi.accentClass ?? 'text-foreground',
        )}
      >
        {kpi.value}
      </p>

      {/* Label */}
      <p className="text-[11px] text-textMuted uppercase tracking-wider font-mono mb-1.5">
        {kpi.label}
      </p>

      {/* Subtext */}
      <p className="text-xs text-textSecondary">{kpi.subtext}</p>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-accent/0 group-hover:bg-accent/15 transition-colors duration-500" />
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Project Progress Chart                                                    */
/* -------------------------------------------------------------------------- */

function PhaseProgressBar({ phase, reduced }: { phase: PhaseData; reduced: boolean }) {
  const barColor =
    phase.status === 'completed'
      ? 'bg-emerald-500'
      : phase.status === 'in_progress'
        ? 'bg-accent'
        : 'bg-neutral-700';

  const textColor =
    phase.status === 'completed'
      ? 'text-emerald-400'
      : phase.status === 'in_progress'
        ? 'text-accent'
        : 'text-textMuted';

  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-2">
        <span className="text-textSecondary font-medium">{phase.label}</span>
        <span className={cn('font-bold font-mono', textColor)}>
          {phase.percentage}%
        </span>
      </div>
      <div
        className="w-full bg-neutral-800/60 h-2.5 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={phase.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${phase.label} completion`}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          custom={reduced}
          variants={barFillVariant(phase.percentage, reduced)}
          className={cn('h-full rounded-full', barColor)}
        />
      </div>
    </div>
  );
}

function ProjectProgressChart({ reduced }: { reduced: boolean }) {
  return (
    <SectionCard ariaLabel="Project phase progress" reduced={reduced}>
      <SectionHeader title="Project Progress" subtitle="Phase completion breakdown" />
      <div className="space-y-5">
        {PHASE_DATA.map((phase) => (
          <PhaseProgressBar key={phase.name} phase={phase} reduced={reduced} />
        ))}
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Activity Heatmap                                                          */
/* -------------------------------------------------------------------------- */

function ActivityHeatmap({ reduced }: { reduced: boolean }) {
  return (
    <SectionCard ariaLabel="Weekly activity heatmap" reduced={reduced}>
      <SectionHeader title="Activity Heatmap" subtitle="Weekly engagement intensity" />
      <div className="space-y-2">
        {/* Day labels */}
        <div className="grid grid-cols-[repeat(7,1fr)] gap-1.5 mb-1">
          {DAY_LABELS.map((d, i) => (
            <span
              key={`day-label-${d}-${i}`}
              className="text-[10px] text-textMuted text-center font-mono"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Heatmap grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerParent(reduced)}
          className="grid grid-cols-[repeat(7,1fr)] gap-1.5"
        >
          {ACTIVITY_HEATMAP_DATA.map((cell) => {
            const opacity = cell.intensity === 0 ? 0.05 : 0.2 + cell.intensity * 0.8;
            return (
              <motion.div
                key={`cell-${cell.week}-${cell.day}`}
                variants={{
                  hidden: { opacity: 0, scale: 0.6 },
                  visible: reduced
                    ? { opacity, scale: 1, transition: REDUCED_TRANSITION }
                    : {
                        opacity,
                        scale: 1,
                        transition: makeTransition('interaction', 'micro', (cell.week * 7 + cell.day) * 0.015),
                      },
                }}
                className={cn(
                  'aspect-square rounded-[3px]',
                  cell.intensity === 0 ? 'bg-neutral-800' : 'bg-accent',
                )}
                style={{ opacity }}
                role="gridcell"
                aria-label={`Activity intensity: ${Math.round(cell.intensity * 100)}%`}
              />
            );
          })}
        </motion.div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] text-textMuted">Less</span>
          {[0.1, 0.3, 0.6, 1.0].map((level) => (
            <div
              key={`legend-${level}`}
              className="w-3 h-3 rounded-[2px] bg-accent"
              style={{ opacity: level }}
              aria-hidden="true"
            />
          ))}
          <span className="text-[10px] text-textMuted">More</span>
        </div>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Milestone Timeline                                                        */
/* -------------------------------------------------------------------------- */

function MilestoneTimeline({ reduced }: { reduced: boolean }) {
  return (
    <SectionCard ariaLabel="Milestone timeline" reduced={reduced}>
      <SectionHeader title="Milestone Timeline" subtitle="Project milestones & delivery dates" />
      <div className="relative pt-4 pb-2">
        {/* Connecting line */}
        <div className="absolute top-[28px] left-0 right-0 h-[2px] bg-neutral-800" aria-hidden="true" />

        <div className="flex justify-between relative">
          {MILESTONE_DATA.map((ms, i) => {
            const isCompleted = ms.status === 'completed';
            const isCurrent = ms.status === 'current';
            const isUpcoming = ms.status === 'upcoming';

            return (
              <motion.div
                key={ms.label}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: reduced
                    ? { opacity: 1, y: 0, transition: REDUCED_TRANSITION }
                    : {
                        opacity: 1,
                        y: 0,
                        transition: makeTransition('entrance', 'component', i * 0.1 + 0.2),
                      },
                }}
                className="flex flex-col items-center z-10"
                style={{ flex: 1 }}
              >
                {/* Dot */}
                <div className="relative mb-3">
                  <div
                    className={cn(
                      'w-3.5 h-3.5 rounded-full border-2',
                      isCompleted && 'bg-accent border-accent',
                      isCurrent && 'bg-accent border-accent',
                      isUpcoming && 'bg-neutral-800 border-neutral-700',
                    )}
                  />
                  {isCurrent && !reduced && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-accent/30"
                      animate={{
                        scale: [1, 2.2, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Label */}
                <p
                  className={cn(
                    'text-[10px] font-medium text-center leading-tight max-w-[64px]',
                    isCompleted && 'text-textSecondary',
                    isCurrent && 'text-accent font-semibold',
                    isUpcoming && 'text-textMuted',
                  )}
                >
                  {ms.label}
                </p>
                <p
                  className={cn(
                    'text-[9px] font-mono mt-0.5',
                    isCurrent ? 'text-accent/70' : 'text-textMuted/60',
                  )}
                >
                  {ms.date}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Response Time SVG Line Chart                                              */
/* -------------------------------------------------------------------------- */

function ResponseTimeChart({ reduced }: { reduced: boolean }) {
  const chartWidth = 320;
  const chartHeight = 100;
  const paddingX = 8;
  const paddingY = 12;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  const maxValue = 4;
  const minValue = 0;

  const points = RESPONSE_TIME_DATA.map((p, i) => ({
    x: paddingX + (i / (RESPONSE_TIME_DATA.length - 1)) * plotWidth,
    y: paddingY + plotHeight - ((p.value - minValue) / (maxValue - minValue)) * plotHeight,
    label: p.day,
    value: p.value,
  }));

  const pathD = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + plotHeight} L ${points[0].x} ${paddingY + plotHeight} Z`;

  return (
    <SectionCard ariaLabel="Response time trend" reduced={reduced}>
      <SectionHeader title="Response Time" subtitle="Average hours to first response (last 7 days)" />
      <div className="mt-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
          role="img"
          aria-label="Line chart showing response times over the past week"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A8862E" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#E5C76B" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((tick) => {
            const y = paddingY + plotHeight - ((tick - minValue) / (maxValue - minValue)) * plotHeight;
            return (
              <line
                key={`grid-${tick}`}
                x1={paddingX}
                x2={chartWidth - paddingX}
                y1={y}
                y2={y}
                stroke="#2A2A2E"
                strokeWidth="0.5"
                strokeDasharray="3,3"
              />
            );
          })}

          {/* Area fill */}
          <motion.path
            d={areaD}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.6 }}
          />

          {/* Line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial="hidden"
            animate="visible"
            variants={lineDrawVariant(reduced)}
          />

          {/* Data points */}
          {points.map((pt, i) => (
            <motion.circle
              key={`point-${pt.label}`}
              cx={pt.x}
              cy={pt.y}
              r="3"
              fill="#0F0F10"
              stroke="#D4AF37"
              strokeWidth="1.5"
              initial={{ opacity: 0, scale: 0 }}
              animate={reduced
                ? { opacity: 1, scale: 1, transition: REDUCED_TRANSITION }
                : {
                    opacity: 1,
                    scale: 1,
                    transition: { delay: 0.8 + i * 0.1, duration: 0.3, ease: EASE.entrance },
                  }}
            />
          ))}

          {/* Day labels */}
          {points.map((pt) => (
            <text
              key={`label-${pt.label}`}
              x={pt.x}
              y={chartHeight - 1}
              textAnchor="middle"
              className="fill-textMuted text-[8px]"
              style={{ fontFamily: 'monospace' }}
            >
              {pt.label}
            </text>
          ))}
        </svg>

        {/* Value summary */}
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] text-textMuted font-mono">Slowest: 3.1h</span>
          <span className="text-[10px] text-accent font-mono font-medium">Avg: 2.3h</span>
          <span className="text-[10px] text-emerald-400 font-mono">Fastest: 1.9h</span>
        </div>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Files & Meetings Stats                                                    */
/* -------------------------------------------------------------------------- */

function FilesCard({ reduced }: { reduced: boolean }) {
  const maxUpload = Math.max(...FILE_UPLOADS_DAILY);

  return (
    <SectionCard ariaLabel="File upload statistics" reduced={reduced} className="flex-1">
      <SectionHeader title="Files Uploaded" subtitle="This month" />
      <p className="text-4xl font-serif font-light text-foreground tracking-tight mb-4">
        12
      </p>

      {/* Mini bar chart */}
      <div className="flex items-end gap-[2px] h-12">
        {FILE_UPLOADS_DAILY.slice(-14).map((count, i) => (
          <motion.div
            key={`file-bar-${i}`}
            initial={{ height: 0 }}
            animate={reduced
              ? { height: maxUpload > 0 ? (count / maxUpload) * 100 : 0 }
              : {
                  height: maxUpload > 0 ? (count / maxUpload) * 100 : 0,
                  transition: {
                    duration: 0.6,
                    ease: EASE.entrance,
                    delay: 0.4 + i * 0.03,
                  },
                }}
            className={cn(
              'flex-1 rounded-t-sm min-w-[2px]',
              count > 0 ? 'bg-accent/60' : 'bg-neutral-800/40',
            )}
            aria-label={`${count} files uploaded on day ${i + 1}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-textMuted font-mono">14 days ago</span>
        <span className="text-[10px] text-textMuted font-mono">Today</span>
      </div>
    </SectionCard>
  );
}

function MeetingsCard({ reduced }: { reduced: boolean }) {
  return (
    <SectionCard ariaLabel="Meeting statistics" reduced={reduced} className="flex-1">
      <SectionHeader title="Meetings" subtitle="This month" />
      <p className="text-4xl font-serif font-light text-foreground tracking-tight mb-4">
        8
      </p>

      {/* Upcoming meeting highlight */}
      <div
        className={cn(
          'rounded-lg p-3 border',
          'bg-white/[0.02] border-accent/15',
        )}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
          <span className="text-xs font-medium text-textSecondary">Next Meeting</span>
        </div>
        <p className="text-sm font-semibold text-foreground">Design Review: VR Tour</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] text-textMuted font-mono flex items-center gap-1">
            <Icon name="calendar" size={10} className="text-textMuted" />
            Apr 22, 2026
          </span>
          <span className="text-[10px] text-textMuted font-mono flex items-center gap-1">
            <Icon name="clock" size={10} className="text-textMuted" />
            2:00 PM
          </span>
          <span className="text-[10px] text-textMuted font-mono flex items-center gap-1">
            <Icon name="users" size={10} className="text-textMuted" />
            5
          </span>
        </div>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Budget Utilization Donut Chart                                            */
/* -------------------------------------------------------------------------- */

function BudgetDonut({ reduced }: { reduced: boolean }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  // Calculate segment offsets
  const paidArc = (BUDGET_SEGMENTS[0].percentage / 100) * circumference;
  const outstandingArc = (BUDGET_SEGMENTS[1].percentage / 100) * circumference;

  return (
    <SectionCard ariaLabel="Budget utilization" reduced={reduced}>
      <SectionHeader title="Budget Utilization" subtitle="Financial overview" />
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#E5C76B" />
              </linearGradient>
            </defs>

            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#1A1A1E"
              strokeWidth="8"
            />

            {/* Paid segment */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${paidArc} ${circumference - paidArc}`}
              initial={{ strokeDashoffset: circumference }}
              animate={reduced
                ? { strokeDashoffset: circumference - paidArc }
                : {
                    strokeDashoffset: circumference - paidArc,
                    transition: { duration: 1.4, ease: EASE.entrance, delay: 0.3 },
                  }}
            />

            {/* Outstanding segment */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#D4AF37"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${outstandingArc} ${circumference - outstandingArc}`}
              strokeDashoffset={-paidArc}
              initial={{ strokeDashoffset: circumference - paidArc }}
              animate={reduced
                ? { strokeDashoffset: -paidArc }
                : {
                    strokeDashoffset: -paidArc,
                    transition: { duration: 1.4, ease: EASE.entrance, delay: 0.6 },
                  }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-serif font-light text-foreground">50%</span>
            <span className="text-[9px] text-textMuted uppercase tracking-wider font-mono">Paid</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3 flex-1">
          {BUDGET_SEGMENTS.map((seg) => (
            <div key={seg.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    background: seg.label === 'Paid'
                      ? 'linear-gradient(135deg, #D4AF37, #E5C76B)'
                      : seg.label === 'Outstanding'
                        ? '#D4AF37'
                        : '#2A2A2E',
                  }}
                />
                <span className="text-xs text-textSecondary">{seg.label}</span>
              </div>
              <span className="text-xs font-mono font-medium text-foreground">
                {seg.percentage}%
              </span>
            </div>
          ))}

          {/* Divider */}
          <div className="h-px bg-border/30 my-2" />

          <div className="flex justify-between items-center">
            <span className="text-xs text-textMuted">Total Budget</span>
            <span className="text-sm font-serif font-light text-foreground">$125,000</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main AnalyticsView                                                       */
/* -------------------------------------------------------------------------- */

export function AnalyticsView() {
  const reduced = useReducedMotion();
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Executive Summary Header ─────────────────────────────────────── */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeLift}
        custom={reduced}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <GoldDot />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-sm text-textSecondary ml-[18px]">
            Executive KPIs measuring project velocity, milestone accuracy, and team collaboration.
          </p>
        </div>

        {/* Date range filter pills */}
        <div
          className="flex items-center gap-1.5 p-1 rounded-lg bg-white/[0.03] border border-border/20 self-start sm:self-auto"
          role="radiogroup"
          aria-label="Select date range"
        >
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleDateRangeChange(opt.key)}
              role="radio"
              aria-checked={dateRange === opt.key}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all duration-200',
                dateRange === opt.key
                  ? 'bg-accent/15 text-accent border border-accent/25'
                  : 'text-textMuted hover:text-textSecondary hover:bg-white/[0.03] border border-transparent',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.header>

      {/* ── KPI Cards Row ────────────────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerParent(reduced)}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {KPI_DATA.map((kpi, i) => (
          <KpiCard key={kpi.label} kpi={kpi} index={i} reduced={reduced} />
        ))}
      </motion.div>

      {/* ── Row 2: Project Progress + Activity Heatmap ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ProjectProgressChart reduced={reduced} />
        </div>
        <div className="lg:col-span-2">
          <ActivityHeatmap reduced={reduced} />
        </div>
      </div>

      {/* ── Row 3: Milestone Timeline ─────────────────────────────────────── */}
      <MilestoneTimeline reduced={reduced} />

      {/* ── Row 4: Response Time + Budget Utilization ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ResponseTimeChart reduced={reduced} />
        <BudgetDonut reduced={reduced} />
      </div>

      {/* ── Row 5: Files & Meetings ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <FilesCard reduced={reduced} />
        <MeetingsCard reduced={reduced} />
      </div>
    </div>
  );
}
