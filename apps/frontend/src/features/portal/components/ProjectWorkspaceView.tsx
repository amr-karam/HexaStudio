'use client';

/**
 * HEXA Portal v3.0 — Project Workspace View
 *
 * Premium enterprise workspace with cinematic motion, SVG circular progress,
 * animated tab bar (Linear-style), milestone timeline, stats grid, activity
 * feed, budget summary, and rich right sidebar.
 *
 * Architecture: Atomic layout — Hero → Tab Bar → TabContent → [Overview|SubView]
 * All animations respect `prefers-reduced-motion` via useReducedMotion().
 */

import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  EASE,
  STAGGER,
  fadeLift,
  makeTransition,
  staggerContainer,
  REDUCED_TRANSITION,
} from '@/lib/motion';
import { Icon, type IconName } from './PortalIcons';
import { TimelineView } from '../TimelineView';
import { ApprovalCenterView } from './ApprovalCenterView';
import { DocumentCenterView } from './DocumentCenterView';
import { KanbanBoard } from './KanbanBoard';
import { TeamRoster } from './TeamRoster';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type TabId = 'overview' | 'timeline' | 'kanban' | 'deliverables' | 'approvals' | 'team';

interface TabDef {
  id: TabId;
  label: string;
  icon: IconName;
}

interface ProjectWorkspaceViewProps {
  projectId?: number;
}

interface Milestone {
  id: string;
  name: string;
  dateRange: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

interface StatItem {
  label: string;
  value: string;
  icon: IconName;
  accent: string;
}

interface ActivityEntry {
  id: string;
  icon: IconName;
  title: string;
  timestamp: string;
  accent: string;
}

interface BudgetLine {
  label: string;
  amount: string;
  percentage: number;
  color: string;
}

interface TeamMember {
  initials: string;
  name: string;
  role: string;
  avatarBg: string;
  avatarText: string;
}

interface QuickLink {
  label: string;
  icon: IconName;
  href: string;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const TABS: TabDef[] = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'timeline', label: 'Timeline', icon: 'clock' },
  { id: 'kanban', label: 'Kanban Tasks', icon: 'kanban' },
  { id: 'deliverables', label: 'Deliverables', icon: 'file-text' },
  { id: 'approvals', label: 'Approvals', icon: 'check-circle' },
  { id: 'team', label: 'Project Team', icon: 'users' },
];

const MOCK_TIMELINE_MILESTONES = [
  { id: 'm1', name: 'Phase 1: Research & Discovery', startDate: '2026-06-01', endDate: '2026-06-30', status: 'completed' as const },
  { id: 'm2', name: 'Phase 2: 3D Renderings & Lighting', startDate: '2026-07-01', endDate: '2026-08-15', status: 'in-progress' as const },
  { id: 'm3', name: 'Phase 3: VR Tour & Handover', startDate: '2026-08-16', endDate: '2026-10-15', status: 'pending' as const },
];

const MILESTONES: Milestone[] = [
  { id: 'm1', name: 'Research & Discovery', dateRange: 'Jun 1 – Jun 30', status: 'completed' },
  { id: 'm2', name: '3D Renderings & Lighting', dateRange: 'Jul 1 – Aug 15', status: 'in-progress' },
  { id: 'm3', name: 'VR Tour & Handover', dateRange: 'Aug 16 – Oct 15', status: 'upcoming' },
];

const STATS: StatItem[] = [
  { label: 'Tasks Completed', value: '34', icon: 'check-circle', accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { label: 'Files Uploaded', value: '128', icon: 'upload', accent: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { label: 'Days Active', value: '56', icon: 'calendar', accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { label: 'Team Members', value: '6', icon: 'users', accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
];

const ACTIVITIES: ActivityEntry[] = [
  { id: 'a1', icon: 'check', title: 'Facade glass spec approved by client', timestamp: '2h ago', accent: 'text-emerald-400' },
  { id: 'a2', icon: 'upload', title: 'New 3D renders uploaded (West Wing)', timestamp: '5h ago', accent: 'text-blue-400' },
  { id: 'a3', icon: 'message-square', title: 'Marcus commented on Landscape Draft', timestamp: '1d ago', accent: 'text-purple-400' },
  { id: 'a4', icon: 'zap', title: 'Phase 2 milestone marked in-progress', timestamp: '3d ago', accent: 'text-accent' },
  { id: 'a5', icon: 'receipt', title: 'Invoice #INV-044 paid — $8,200', timestamp: '5d ago', accent: 'text-amber-400' },
];

const BUDGET_LINES: BudgetLine[] = [
  { label: 'Total', amount: '$50,000', percentage: 100, color: 'bg-neutral-600' },
  { label: 'Paid', amount: '$25,000', percentage: 50, color: 'bg-emerald-500' },
  { label: 'Outstanding', amount: '$12,500', percentage: 25, color: 'bg-amber-500' },
  { label: 'Remaining', amount: '$12,500', percentage: 25, color: 'bg-neutral-700' },
];

const TEAM_MEMBERS: TeamMember[] = [
  { initials: 'MV', name: 'Marcus Vance', role: 'Senior Project Manager', avatarBg: 'bg-amber-500/20', avatarText: 'text-amber-400' },
  { initials: 'ER', name: 'Elena Rostova', role: 'Lead 3D Visualization', avatarBg: 'bg-blue-500/20', avatarText: 'text-blue-400' },
  { initials: 'JL', name: 'Julian Li', role: 'Architectural Designer', avatarBg: 'bg-emerald-500/20', avatarText: 'text-emerald-400' },
  { initials: 'AS', name: 'Amara Singh', role: 'VR Experience Lead', avatarBg: 'bg-purple-500/20', avatarText: 'text-purple-400' },
];

const QUICK_LINKS: QuickLink[] = [
  { label: 'Documents', icon: 'file-text', href: '#deliverables' },
  { label: 'Timeline', icon: 'clock', href: '#timeline' },
  { label: 'Support', icon: 'help-circle', href: '#support' },
];

/* -------------------------------------------------------------------------- */
/*  SVG Circular Progress                                                     */
/* -------------------------------------------------------------------------- */

const PROGRESS_PERCENTAGE = 68;
const CIRCLE_RADIUS = 54;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

function CircularProgressBar({ percentage, reducedMotion }: { percentage: number; reducedMotion: boolean }) {
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE - (percentage / 100) * CIRCLE_CIRCUMFERENCE;

  return (
    <div className="relative w-32 h-32 lg:w-36 lg:h-36 shrink-0" role="img" aria-label={`${percentage}% project completion`}>
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl" />

      <svg
        viewBox="0 0 120 120"
        className="w-full h-full -rotate-90 relative z-10"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx="60"
          cy="60"
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-white/[0.06]"
        />
        {/* Progress arc */}
        <motion.circle
          cx="60"
          cy="60"
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          initial={reducedMotion ? { strokeDashoffset } : { strokeDashoffset: CIRCLE_CIRCUMFERENCE }}
          animate={{ strokeDashoffset }}
          transition={reducedMotion ? REDUCED_TRANSITION : { duration: 1.6, ease: EASE.entrance, delay: 0.4 }}
        />
        {/* Gold gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#E5C76B" />
            <stop offset="100%" stopColor="#A8862E" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <motion.span
          className="text-3xl font-serif font-bold text-foreground tracking-tight"
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reducedMotion ? REDUCED_TRANSITION : { duration: 0.5, ease: EASE.entrance, delay: 0.8 }}
        >
          {percentage}%
        </motion.span>
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mt-0.5">
          Complete
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated Tab Underline                                                     */
/* -------------------------------------------------------------------------- */

function TabBarUnderline({ tabRefs, activeTab }: { tabRefs: React.RefObject<Map<TabId, HTMLButtonElement | null>>; activeTab: TabId }) {
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const map = tabRefs.current;
    if (!map) return;
    const node = map.get(activeTab);
    if (!node) return;
    const parent = node.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    setUnderline({
      left: nodeRect.left - parentRect.left,
      width: nodeRect.width,
    });
  }, [activeTab, tabRefs]);

  return (
    <motion.div
      className="absolute bottom-0 h-[2px] bg-accent rounded-full"
      animate={{ left: underline.left, width: underline.width }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      aria-hidden="true"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Overview Tab                                                               */
/* -------------------------------------------------------------------------- */

function OverviewTab({ prefersReduced }: { prefersReduced: boolean }) {
  const containerVariants = staggerContainer(STAGGER.page, 0.1);
  const itemVariants = fadeLift;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={prefersReduced}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      role="tabpanel"
      aria-label="Project overview"
    >
      {/* ─── Left Column (2/3) ─── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Milestone Timeline */}
        <motion.section
          variants={itemVariants}
          custom={prefersReduced}
          className="artisan-glass artisan-specular-top rounded-2xl p-6"
          aria-label="Milestone progress timeline"
        >
          <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
            <Icon name="milestone" size={16} className="text-accent" />
            Milestone Timeline
          </h3>

          <div className="relative">
            {/* Vertical connector line */}
            <div
              className="absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-accent/60 via-accent/30 to-white/[0.06]"
              aria-hidden="true"
            />

            <div className="space-y-6">
              {MILESTONES.map((ms, idx) => {
                const isCompleted = ms.status === 'completed';
                const isActive = ms.status === 'in-progress';

                return (
                  <motion.div
                    key={ms.id}
                    variants={itemVariants}
                    custom={prefersReduced}
                    className="relative flex items-start gap-4 pl-0"
                  >
                    {/* Status indicator */}
                    <div className="relative z-10 shrink-0 mt-0.5">
                      {isCompleted ? (
                        <div className="w-[30px] h-[30px] rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
                          <Icon name="check" size={14} className="text-accent" />
                        </div>
                      ) : isActive ? (
                        <div className="w-[30px] h-[30px] rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center">
                          <span className="relative flex h-2 w-2">
                            {prefersReduced ? (
                              <span className="absolute inset-0 rounded-full bg-accent" />
                            ) : (
                              <>
                                <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-60" />
                                <span className="relative rounded-full h-2 w-2 bg-accent" />
                              </>
                            )}
                          </span>
                        </div>
                      ) : (
                        <div className="w-[30px] h-[30px] rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-neutral-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn(
                          'text-sm font-semibold',
                          isCompleted ? 'text-foreground' : isActive ? 'text-accent' : 'text-neutral-500',
                        )}>
                          {ms.name}
                        </p>
                        {isActive && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                            In Progress
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 font-mono">{ms.dateRange}</p>
                    </div>

                    {/* Index marker */}
                    <span className="text-[10px] font-mono text-neutral-600 shrink-0 mt-1">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Project Stats Grid */}
        <motion.section
          variants={itemVariants}
          custom={prefersReduced}
          aria-label="Project statistics"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                custom={prefersReduced}
                transition={makeTransition('entrance', 'component', idx * STAGGER.component)}
                whileHover={prefersReduced ? undefined : { y: -2, transition: { duration: 0.2 } }}
                className="artisan-glass artisan-specular-top rounded-xl p-4 group hover:border-accent/20 transition-colors duration-300"
              >
                <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center mb-3', stat.accent)}>
                  <Icon name={stat.icon} size={14} />
                </div>
                <p className="text-2xl font-serif font-bold text-foreground tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Recent Activity */}
        <motion.section
          variants={itemVariants}
          custom={prefersReduced}
          className="artisan-glass artisan-specular-top rounded-2xl p-6"
          aria-label="Recent project activity"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon name="zap" size={16} className="text-accent" />
              Recent Activity
            </h3>
            <button
              className="text-[11px] text-accent font-semibold hover:underline underline-offset-2"
              aria-label="View all activity"
            >
              View All
            </button>
          </div>

          <div className="space-y-1">
            {ACTIVITIES.map((activity, idx) => (
              <motion.div
                key={activity.id}
                variants={itemVariants}
                custom={prefersReduced}
                transition={makeTransition('entrance', 'component', idx * STAGGER.component)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors duration-200"
              >
                <div className={cn('shrink-0 mt-0.5', activity.accent)}>
                  <Icon name={activity.icon} size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{activity.title}</p>
                </div>
                <span className="text-[10px] text-neutral-600 font-mono shrink-0 whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Budget Summary */}
        <motion.section
          variants={itemVariants}
          custom={prefersReduced}
          className="artisan-glass artisan-specular-top rounded-2xl p-6"
          aria-label="Budget summary"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon name="dollar-sign" size={16} className="text-accent" />
              Budget Summary
            </h3>
            <span className="text-[11px] text-neutral-500 font-mono">Updated Jul 24</span>
          </div>

          {/* Stacked budget bar */}
          <div className="w-full h-3 rounded-full bg-white/[0.04] overflow-hidden flex" aria-hidden="true">
            {BUDGET_LINES.slice(1).map((line) => (
              <motion.div
                key={line.label}
                className={cn('h-full first:rounded-l-full last:rounded-r-full', line.color)}
                initial={prefersReduced ? { width: `${line.percentage}%` } : { width: '0%' }}
                animate={{ width: `${line.percentage}%` }}
                transition={prefersReduced ? REDUCED_TRANSITION : { duration: 1, ease: EASE.entrance, delay: 0.5 }}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-5">
            {BUDGET_LINES.map((line) => (
              <div key={line.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('w-2.5 h-2.5 rounded-full', line.color)} aria-hidden="true" />
                  <span className="text-xs text-neutral-400">{line.label}</span>
                </div>
                <span className="text-xs font-semibold text-foreground font-mono">{line.amount}</span>
              </div>
            ))}
          </div>
        </motion.section>

{/* Change Requests */}
        <motion.section
          variants={itemVariants}
          custom={prefersReduced}
          className="artisan-glass artisan-specular-top rounded-2xl p-6"
          aria-label="Change requests and scope logs"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon name="alert-circle" size={16} className="text-accent" />
              Change Requests &amp; Scope Logs
            </h3>
            <button
              className="text-[11px] text-accent font-semibold hover:underline underline-offset-2"
              aria-label="Create new change request"
            >
              + New Change Request
            </button>
          </div>

          <div className="space-y-3">
            {[
              { title: 'CR-003: Interior Lighting CRI Upgrade', status: 'Under Review', statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20', date: 'Jul 22', impact: '+$1,800 USD' },
              { title: 'CR-002: West Facade Glass Specification Upgrade', status: 'Approved', statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', date: 'Jul 19', impact: '+$4,200 USD' },
              { title: 'CR-001: Structural Steel Grade Upgrade', status: 'Implemented', statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', date: 'Jul 15', impact: '+$12,500 USD' },
            ].map((cr, idx) => (
              <motion.div
                key={cr.title}
                variants={itemVariants}
                custom={prefersReduced}
                transition={makeTransition('entrance', 'component', idx * STAGGER.component)}
                className="p-4 bg-white/[0.02] rounded-xl border border-border/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{cr.title}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {cr.date} &middot; Impact: <span className="text-accent">{cr.impact}</span>
                  </p>
                </div>
                <span className={cn(
                  'shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border',
                  cr.statusColor,
                )}>
                  {cr.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* ─── Right Sidebar (1/3) ─── */}
      <motion.aside
        variants={itemVariants}
        custom={prefersReduced}
        className="space-y-6"
        aria-label="Project sidebar"
      >
        {/* Next Meeting */}
        <div className="artisan-glass artisan-specular-top rounded-2xl p-5 relative overflow-hidden">
          {/* Gold shimmer accent */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/8 blur-2xl rounded-full pointer-events-none" aria-hidden="true" />

          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2 relative z-10">
            <Icon name="calendar" size={16} className="text-accent" />
            Next Meeting
          </h3>

          <div className="relative z-10 p-4 bg-white/[0.02] rounded-xl border border-border/20">
            <p className="text-sm font-semibold text-foreground">Design Review — Phase 2</p>
            <p className="text-xs text-neutral-500 mt-1">Tuesday, Jul 29 &middot; 10:00 AM EST</p>
            <div className="flex items-center gap-2 mt-3">
              <Icon name="video" size={12} className="text-accent" />
              <span className="text-[11px] text-accent font-medium">Video Call</span>
            </div>
          </div>
        </div>

        {/* Team Roster */}
        <div className="artisan-glass artisan-specular-top rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="users" size={16} className="text-accent" />
            Studio Team
          </h3>

          <div className="space-y-3">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0',
                  member.avatarBg, member.avatarText,
                )}>
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{member.name}</p>
                  <p className="text-[10px] text-neutral-500 truncate">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="artisan-glass artisan-specular-top rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="external-link" size={16} className="text-accent" />
            Quick Links
          </h3>

          <div className="space-y-2">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-border/10 hover:border-border-light/40 hover:bg-white/[0.04] transition-all duration-200 group"
                aria-label={`Navigate to ${link.label}`}
              >
                <Icon
                  name={link.icon}
                  size={14}
                  className="text-neutral-500 group-hover:text-accent transition-colors duration-200"
                />
                <span className="text-xs font-medium text-foreground flex-1">{link.label}</span>
                <Icon
                  name="chevron-right"
                  size={12}
                  className="text-neutral-600 group-hover:text-neutral-400 transition-colors duration-200"
                />
              </a>
            ))}
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function ProjectWorkspaceView({ projectId = 1 }: ProjectWorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const prefersReduced = useReducedMotion();
  const tabRefs = useRef<Map<TabId, HTMLButtonElement | null>>(new Map());

  const setTabRef = useCallback(
    (id: TabId) => (node: HTMLButtonElement | null) => {
      tabRefs.current.set(id, node);
    },
    [],
  );

  /* ---------------------------------------------------------------------- */
  /*  Tab panel transition variants                                          */
  /* ---------------------------------------------------------------------- */

  const tabPanelVariants = {
    initial: { opacity: 0, y: 8 },
    animate: prefersReduced
      ? { opacity: 1, y: 0, transition: REDUCED_TRANSITION }
      : { opacity: 1, y: 0, transition: makeTransition('entrance', 'component') },
    exit: prefersReduced
      ? { opacity: 0, transition: REDUCED_TRANSITION }
      : { opacity: 0, y: -4, transition: { duration: 0.15, ease: EASE.sharp } },
  };

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-0">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  HERO                                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReduced ? REDUCED_TRANSITION : makeTransition('entrance', 'page')}
        className="relative artisan-glass artisan-specular-top glass-depth overflow-hidden rounded-t-2xl"
        aria-label="Project workspace hero"
      >
        {/* Gold gradient glow */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] opacity-[0.07] pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-full h-full bg-gradient-to-br from-accent via-accent-light to-accent-dark rounded-full blur-3xl" />
        </div>
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] opacity-[0.04] pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-full h-full bg-gradient-to-tr from-accent to-transparent rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6 p-6 lg:p-8">
          {/* Left: Project info */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={prefersReduced ? REDUCED_TRANSITION : makeTransition('entrance', 'component', 0.1)}
            >
              {/* Status + ID */}
              <div className="flex items-center gap-2 text-xs mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent font-semibold uppercase tracking-wider border border-accent/25 text-[11px]">
                  <span className="relative flex h-1.5 w-1.5">
                    {prefersReduced ? (
                      <span className="absolute inset-0 rounded-full bg-accent" />
                    ) : (
                      <>
                        <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-70" />
                        <span className="relative rounded-full h-1.5 w-1.5 bg-accent" />
                      </>
                    )}
                  </span>
                  In Progress
                </span>
                <span className="text-neutral-600">&bull;</span>
                <span className="text-neutral-500 font-mono text-[11px]">PROJ-2026-088</span>
              </div>

              {/* Project name */}
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground tracking-tight">
                Horizon Villa
              </h1>

              {/* Description */}
              <p className="text-sm text-neutral-400 mt-2 max-w-2xl leading-relaxed">
                Luxury oceanfront residential complex featuring high-end parametric facade design,
                custom landscape architecture, and interactive VR tours.
              </p>

              {/* Meta pills */}
              <div className="flex items-center gap-4 mt-5 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Icon name="calendar" size={13} className="text-neutral-500" />
                  <span>Handover: <strong className="text-foreground font-semibold">Oct 15, 2026</strong></span>
                </div>
                <div className="w-px h-3 bg-neutral-700" aria-hidden="true" />
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Icon name="user" size={13} className="text-neutral-500" />
                  <span>PM: <strong className="text-accent font-semibold">Marcus Vance</strong></span>
                </div>
                <div className="w-px h-3 bg-neutral-700" aria-hidden="true" />
                <button
                  onClick={() => {
                    const win = window.open('', '_blank');
                    if (win) {
                      win.document.write(
                        '<html><head><title>Executive Brief</title></head><body style="font-family:serif;padding:2rem;max-width:800px;margin:auto"><h1>Executive Brief</h1><p>This report is being generated. Please check back shortly or contact your project manager.</p></body></html>',
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer"
                >
                  <Icon name="file-text" size={12} className="text-amber-400" />
                  <span>Executive Brief PDF</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right: Circular progress */}
          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={prefersReduced ? REDUCED_TRANSITION : makeTransition('entrance', 'component', 0.25)}
            className="flex justify-center lg:justify-end"
          >
            <CircularProgressBar percentage={PROGRESS_PERCENTAGE} reducedMotion={prefersReduced} />
          </motion.div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/*  TAB BAR                                                         */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <nav
          className="relative border-t border-border/20 overflow-x-auto"
          role="tablist"
          aria-label="Project workspace tabs"
        >
          <LayoutGroup>
            <div className="relative flex items-center px-2 lg:px-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  ref={setTabRef(tab.id)}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 outline-none',
                    'focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-t-lg',
                    activeTab === tab.id
                      ? 'text-accent'
                      : 'text-neutral-500 hover:text-neutral-300',
                  )}
                >
                  <Icon name={tab.icon} size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}

              {/* Animated underline */}
              <TabBarUnderline tabRefs={tabRefs} activeTab={activeTab} />
            </div>
          </LayoutGroup>
        </nav>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  TAB CONTENT                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabPanelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="pt-6"
        >
          {activeTab === 'overview' && <OverviewTab prefersReduced={prefersReduced} />}
          {activeTab === 'timeline' && (
            <TimelineView milestones={MOCK_TIMELINE_MILESTONES} />
          )}
          {activeTab === 'deliverables' && <DocumentCenterView />}
          {activeTab === 'approvals' && <ApprovalCenterView />}
          {activeTab === 'kanban' && <KanbanBoard projectId={projectId} />}
          {activeTab === 'team' && <TeamRoster projectId={projectId} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
