'use client';

/**
 * HEXA Portal v4.0 — Digital Headquarters Dashboard
 *
 * World-class premium dashboard answering "What is happening with my project right now?" within 5 seconds.
 *
 * Features:
 * - Premium welcome hero with animated gold gradient glow & personalized greeting
 * - KPI stat cards with staggered fadeLift entrance choreography
 * - Project Health with glass card wrapper & metric breakdown bars
 * - Pending approvals with AnimatePresence & pulsing gold urgency indicator
 * - Activity feed with timeline connector dots & animated entrance
 * - Quick actions grid with hover lift & gold accent borders
 * - Upcoming meetings with calendar-style date highlighting
 * - Beautiful empty states for sparse data
 * - Fully responsive 2-column → single-column layout
 * - Full accessibility: ARIA labels, focus states, semantic HTML
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/features/portal/components/StatCard';
import { HealthScore } from '@/features/portal/components/HealthScore';
import { ActivityItem } from '@/features/portal/components/ActivityItem';
import { QuickAction } from '@/features/portal/components/QuickAction';
import { DashboardSkeleton } from '@/features/portal/components/DashboardSkeleton';
import { MeetingCard } from '@/features/portal/components/MeetingCard';
import { MetricBar } from '@/features/portal/components/MetricBar';
import { Icon } from '@/features/portal/components/PortalIcons';
import { ApprovalCard } from '@/features/portal/components/ApprovalCard';
import { createDynamicComponent } from '@/lib/dynamic-component';
import type { PortalAiCopilotProps } from '@/features/portal/components/PortalAiCopilot';
// Heavy AI copilot drawer (speech + image tooling) — lazy-loaded; only fetched
// when the user opens it, keeping the portal dashboard's initial bundle lean.
const PortalAiCopilot = createDynamicComponent<PortalAiCopilotProps>(
  () =>
    import('@/features/portal/components/PortalAiCopilot').then((m) => ({
      default: m.PortalAiCopilot,
    })),
  { ssr: false, loading: <span aria-hidden="true" /> },
);
import { portalApi } from '@/features/portal/api';
import { useAuth } from '@/features/auth';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  fadeLift,
  staggerContainer,
  makeTransition,
  EASE,
  DURATION,
  STAGGER,
} from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { DashboardData } from '@/features/portal/types';

/* -------------------------------------------------------------------------- */
/*  Mock Data — Fallback when API is unreachable                              */
/* -------------------------------------------------------------------------- */

const MOCK_FALLBACK_DASHBOARD: DashboardData = {
  companyName: 'Horizon Real Estate Holdings',
  activeProjectName: 'Horizon Villa',
  activeProjectStage: 'Phase 2: 3D Renderings & Lighting',
  overallProgressPercentage: 68,
  nextMilestoneName: 'Phase 2 Deliverables Sign-off',
  nextMilestoneDueDate: 'August 15, 2026',
  stats: [
    { label: 'Overall Progress', value: 68, icon: 'bar-chart', trend: { value: 12, direction: 'up' }, format: 'percentage' },
    { label: 'Pending Approvals', value: 2, icon: 'check-circle', trend: { value: 1, direction: 'up' }, format: 'number' },
    { label: 'Open Deliverables', value: 8, icon: 'folder-kanban', trend: { value: 0, direction: 'neutral' }, format: 'number' },
    { label: 'Outstanding Invoices', value: 12500, icon: 'receipt', trend: { value: 0, direction: 'neutral' }, format: 'currency' },
  ],
  healthScore: {
    score: 94,
    status: 'Excellent',
    metricBreakdown: { timeline: 95, budget: 100, quality: 98, communication: 90 },
  },
  activity: [
    { id: 'act-1', type: 'upload', title: 'New 3D Exterior Renderings v2 Uploaded', description: 'Elena Rostova uploaded 2 new 8K renders for Vantage Point A & B.', timestamp: '2 hours ago', author: 'Elena Rostova' },
    { id: 'act-2', type: 'approval', title: 'Milestone 2 Invoicing Issued', description: 'Odoo ERP generated milestone billing statement #INV-2026-042.', timestamp: '1 day ago', author: 'Finance Dept' },
  ],
  notifications: [
    { id: 'not-1', type: 'approval', title: 'Action Required', message: '3D Renderings v2 package requires your sign-off in Approval Center.', timestamp: '2 hours ago', isRead: false, link: '/portal/approvals' },
  ],
  pendingApprovals: [
    { id: 'app-1', title: '3D Exterior Renderings — Vantage Point A & B', type: 'design', phaseName: 'Phase 2', projectName: 'Horizon Villa', submittedAt: '2026-07-22T10:00:00Z', submittedBy: 'Elena Rostova', status: 'pending' },
  ],
  upcomingMeetings: [
    { id: 'meet-1', title: 'Phase 2 Design & Lighting Review', date: 'July 28, 2026', time: '14:00 EST', participants: ['Marcus Vance', 'Elena Rostova', 'Client Team'] },
  ],
  outstandingInvoices: [
    { id: 'inv-1', reference: 'INV-2026-042', amount: 12500, currency: 'USD', dueDate: '2026-08-30', status: 'pending' },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Data Fetcher                                                              */
/* -------------------------------------------------------------------------- */

async function fetchDashboardData(): Promise<DashboardData> {
  try {
    return await portalApi.getDashboard();
  } catch {
    if (process.env.NODE_ENV === 'development') {
      return MOCK_FALLBACK_DASHBOARD;
    }
    throw new Error('Failed to load dashboard data');
  }
}

/* -------------------------------------------------------------------------- */
/*  Sub-components — Internal to keep the main render clean                   */
/* -------------------------------------------------------------------------- */



/** Empty state component for sparse dashboard sections. */
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: 'check-circle' | 'calendar';
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-sl-silver/20 flex items-center justify-center mb-4">
        <Icon name={icon} size={22} className="text-sl-mist/60" />
      </div>
      <p className="text-sm font-medium text-sl-mist/60">{title}</p>
      <p className="text-xs text-sl-mist/60 mt-1 max-w-[220px]">{description}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Metric breakdown keys                                                     */
/* -------------------------------------------------------------------------- */

const METRIC_KEYS = ['timeline', 'budget', 'quality', 'communication'] as const;
const METRIC_LABELS: Record<(typeof METRIC_KEYS)[number], string> = {
  timeline: 'Timeline',
  budget: 'Budget',
  quality: 'Quality',
  communication: 'Communication',
};

/* -------------------------------------------------------------------------- */
/*  Main Page Component                                                       */
/* -------------------------------------------------------------------------- */

export default function PortalDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const prefersReduced = useReducedMotion();
  const [copilotOpen, setCopilotOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/portal/login');
    }
  }, [user, router]);

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['portal-dashboard'],
    queryFn: fetchDashboardData,
  });

  const dashboardData = data ?? (isError ? MOCK_FALLBACK_DASHBOARD : undefined);

  /* Derived greeting — personalized by first name or username */
  const displayName = user?.username
    ? user.username.split(' ')[0]
    : 'there';

  if (isLoading || !dashboardData) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12" role="region" aria-label="Portal Dashboard">
      {/* ================================================================ */}
      {/*  SECTION 1 — PREMIUM WELCOME HERO                               */}
      {/* ================================================================ */}
      <section
        className="relative overflow-hidden rounded-2xl border border-sl-silver/20 glass-depth"
        aria-label="Project overview"
      >
        {/* Adaptive aura — shifts based on project health (Emerald for Excellent, Gold for On-Track) */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <motion.div
            initial={prefersReduced ? { opacity: 0.12 } : { opacity: 0 }}
            animate={{ opacity: 0.12 }}
            transition={{ duration: DURATION.page * 2, ease: EASE.entrance }}
            className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full"
            style={{
              background:
                `radial-gradient(circle, ${dashboardData.healthScore.score > 90 ? 'rgba(52, 211, 153, 0.25)' : 'rgba(212,175,55,0.25)'} 0%, rgba(212,175,55,0.08) 40%, transparent 70%)`,
            }}
          />
          <motion.div
            initial={prefersReduced ? { opacity: 0.08 } : { opacity: 0 }}
            animate={{ opacity: 0.08 }}
            transition={{ duration: DURATION.page * 2.5, delay: 0.2, ease: EASE.entrance }}
            className="absolute -bottom-16 -left-16 w-[350px] h-[350px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(229,199,107,0.25) 0%, transparent 65%)',
            }}
          />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <motion.div
            variants={staggerContainer(STAGGER.page, 0)}
            initial="hidden"
            animate="visible"
          >
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
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11px] uppercase tracking-widest font-mono text-sl-mist/60">
                  Live Status
                </span>
                <span className="text-sl-silver/50">·</span>
                <span className="text-[11px] font-mono text-sl-mist/60">
                  {dashboardData.companyName}
                </span>
              </div>

              <button
                onClick={() => setCopilotOpen(true)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold',
                  'bg-gradient-to-r from-sl-gold-subtle to-sl-gold-subtle-bright text-void',
                  'shadow-lg shadow-sl-gold-subtle/15 hover:shadow-sl-gold-subtle/25',
                  'hover:brightness-110 transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                )}
                aria-label="Open HEXA Copilot assistant"
              >
                <Icon name="sparkles" size={16} />
                <span>Ask HEXA Copilot</span>
              </button>
            </motion.div>

            {/* Hero text */}
            <motion.div variants={fadeLift} custom={prefersReduced}>
              <p className="text-sm font-mono text-sl-mist/60 uppercase tracking-wider mb-2">
                Welcome back, {displayName}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-sl-alabaster tracking-tight leading-tight">
                {dashboardData.activeProjectName}
              </h1>
              <p className="text-sm text-sl-mist/60 mt-2">
                Current Stage:{' '}
                <span className="text-sl-gold-hover font-semibold">
                  {dashboardData.activeProjectStage}
                </span>
              </p>
            </motion.div>

            {/* Quick-glance KPI strip inside hero */}
            <motion.div
              variants={fadeLift}
              custom={prefersReduced}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8 pt-6 border-t border-sl-silver/20/15"
            >
              {/* Progress */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-sl-silver/20/15">
                <p className="text-[10px] uppercase tracking-widest font-mono text-sl-mist/60">
                  Overall Progress
                </p>
                <div className="flex items-baseline justify-between mt-1.5">
                  <p className="text-2xl font-serif font-light text-sl-alabaster">
                    {dashboardData.overallProgressPercentage}%
                  </p>
                  <span className="text-[10px] font-mono text-emerald-500">
                    On Schedule
                  </span>
                </div>
                <div
                  className="w-full bg-white/[0.04] h-1 rounded-full mt-2.5 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={dashboardData.overallProgressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Overall progress: ${dashboardData.overallProgressPercentage}%`}
                >
                  <motion.div
                    className="bg-sl-gold-subtle h-full rounded-full"
                    initial={prefersReduced ? { width: `${dashboardData.overallProgressPercentage}%` } : { width: '0%' }}
                    animate={{ width: `${dashboardData.overallProgressPercentage}%` }}
                    transition={
                      prefersReduced
                        ? { duration: 0.01 }
                        : { duration: DURATION.page, ease: EASE.entrance, delay: 0.4 }
                    }
                  />
                </div>
              </div>

              {/* Next Milestone */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-sl-silver/20/15">
                <p className="text-[10px] uppercase tracking-widest font-mono text-sl-mist/60">
                  Next Milestone
                </p>
                <p className="text-sm font-semibold text-sl-alabaster mt-1.5 line-clamp-1">
                  {dashboardData.nextMilestoneName}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Icon name="milestone" size={11} className="text-sl-gold-hover" />
                  <p className="text-[11px] font-mono text-sl-gold-hover">
                    Due {dashboardData.nextMilestoneDueDate}
                  </p>
                </div>
              </div>

              {/* Pending */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-sl-silver/20/15">
                <p className="text-[10px] uppercase tracking-widest font-mono text-sl-mist/60">
                  Pending Approvals
                </p>
                <p className="text-2xl font-serif font-light text-sl-gold-hover mt-1.5">
                  {dashboardData.pendingApprovals.length}
                </p>
                <p className="text-[11px] text-sl-mist/60 mt-1">
                  Requires Sign-off
                </p>
              </div>

              {/* Health */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-sl-silver/20/15">
                <p className="text-[10px] uppercase tracking-widest font-mono text-sl-mist/60">
                  Project Health
                </p>
                <p className="text-2xl font-serif font-light text-emerald-500 mt-1.5">
                  {dashboardData.healthScore.score} <span className="text-sm text-sl-mist/60">/ 100</span>
                </p>
                <p className="text-[11px] text-emerald-500/80 mt-1">
                  {dashboardData.healthScore.status}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  SECTION 2 — KPI STAT CARDS (Staggered fadeLift)                 */}
      {/* ================================================================ */}
      <section aria-label="Key performance indicators">
        <motion.div
          variants={staggerContainer(STAGGER.component, 0.1)}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {dashboardData.stats.map((stat, idx) => (
            <StatCard key={stat.label} stat={stat} index={idx} />
          ))}
        </motion.div>
      </section>

      {/* ================================================================ */}
      {/*  SECTION 3 — MAIN TWO-COLUMN LAYOUT                              */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ---------------------------------------------------------------- */}
        {/*  LEFT COLUMN — Approvals + Activity + Quick Actions               */}
        {/* ---------------------------------------------------------------- */}
        <div className="lg:col-span-8 space-y-6">
          {/* ---- Pending Approvals ---- */}
          <section
            className="relative rounded-2xl border border-sl-gold-subtle/20 bg-sl-obsidian overflow-hidden"
            aria-label="Pending approvals"
          >
            {/* Subtle top accent glow */}
            <div
              className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/40 to-transparent"
              aria-hidden="true"
            />

            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sl-gold-subtle" />
                  </span>
                  <h2 className="text-base font-bold text-sl-alabaster">
                    Pending Approvals
                  </h2>
                  {dashboardData.pendingApprovals.length > 0 && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sl-gold-subtle/10 text-sl-gold-hover">
                      {dashboardData.pendingApprovals.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => router.push('/portal/approvals')}
                  className={cn(
                    'text-[11px] font-mono uppercase tracking-wider text-sl-gold-hover/80 hover:text-sl-gold-hover transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded px-2 py-1',
                  )}
                  aria-label="View all pending approvals"
                >
                  View All →
                </button>
              </div>

              <AnimatePresence mode="popLayout">
                {dashboardData.pendingApprovals.length > 0 ? (
                  <motion.div
                    key="approvals-list"
                    className="space-y-3"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={staggerContainer(STAGGER.component, 0)}
                  >
                    {dashboardData.pendingApprovals.map((approval, idx) => (
                      <ApprovalCard
                        key={approval.id}
                        approval={approval}
                        index={idx}
                        prefersReduced={prefersReduced}
                        onReview={() => router.push('/portal/approvals')}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="approvals-empty"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                  >
                    <EmptyState
                      icon="check-circle"
                      title="All caught up"
                      description="No approvals are awaiting your review right now."
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* ---- Activity Feed ---- */}
          <section
            className="rounded-2xl border border-sl-silver/20 bg-sl-obsidian p-6"
            aria-label="Recent project activity"
          >
            <h2 className="text-base font-bold text-sl-alabaster mb-5">
              Live Project Activity
            </h2>

            <motion.ol
              variants={staggerContainer(STAGGER.component, 0.05)}
              initial="hidden"
              animate="visible"
              className="relative"
              role="list"
              aria-label="Activity timeline"
            >
              {/* Vertical timeline connector line */}
              {dashboardData.activity.length > 1 && (
                <div
                  className="absolute left-[7px] top-3 bottom-3 w-px bg-sl-silver/30"
                  aria-hidden="true"
                />
              )}

              {dashboardData.activity.map((item, idx) => (
                <motion.li
                  key={item.id}
                  variants={fadeLift}
                  custom={prefersReduced}
                  transition={makeTransition('entrance', 'component', idx * 0.08)}
                  className="relative flex gap-3 py-3 first:pt-0 last:pb-0"
                  role="listitem"
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'relative z-10 mt-1.5 w-[15px] h-[15px] rounded-full border-2 shrink-0',
                      item.type === 'upload'
                        ? 'bg-sl-gold-subtle/20 border-sl-gold-subtle'
                        : item.type === 'approval'
                          ? 'bg-emerald-500/20 border-emerald-500'
                          : item.type === 'milestone'
                            ? 'bg-sl-gold-subtle/20 border-sl-gold-subtle'
                            : item.type === 'invoice'
                              ? 'bg-amber-500/20 border-amber-500'
                              : 'bg-white/5 border-sl-silver',
                    )}
                    aria-hidden="true"
                  />

                  {/* Activity item */}
                  <div className="flex-1 min-w-0 -mt-0.5">
                    <ActivityItem item={item} />
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </section>

          {/* ---- Quick Actions Grid ---- */}
          <section aria-label="Quick actions">
            <h2 className="text-base font-bold text-sl-alabaster mb-4">
              Quick Actions
            </h2>
            <motion.div
              variants={staggerContainer(STAGGER.component, 0.05)}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
            >
              <motion.div variants={fadeLift} custom={prefersReduced}>
                <QuickAction
                  icon="milestone"
                  label="View Timeline"
                  description="Track milestones and phase progress"
                  onClick={() => router.push('/portal/projects')}
                />
              </motion.div>
              <motion.div variants={fadeLift} custom={prefersReduced}>
                <QuickAction
                  icon="box"
                  label="3D Live Review"
                  description="WebRTC spatial collaboration & pins"
                  onClick={() => router.push('/portal/review')}
                />
              </motion.div>
              <motion.div variants={fadeLift} custom={prefersReduced}>
                <QuickAction
                  icon="check-circle"
                  label="Approvals & Contracts"
                  description="E-signatures and deliverable sign-offs"
                  onClick={() => router.push('/portal/approvals')}
                />
              </motion.div>
              <motion.div variants={fadeLift} custom={prefersReduced}>
                <QuickAction
                  icon="folder-kanban"
                  label="Documents Vault"
                  description="Browse 8K renders and CAD assets"
                  onClick={() => router.push('/portal/documents')}
                />
              </motion.div>
              <motion.div variants={fadeLift} custom={prefersReduced}>
                <QuickAction
                  icon="dollar-sign"
                  label="Finance & Invoices"
                  description="Invoices, payments, and billing history"
                  onClick={() => router.push('/portal/finance')}
                />
              </motion.div>
              <motion.div variants={fadeLift} custom={prefersReduced}>
                <QuickAction
                  icon="sparkles"
                  label="AI Spatial Studio"
                  description="Multimodal prompts and render analysis"
                  onClick={() => router.push('/portal/ai')}
                />
              </motion.div>
            </motion.div>
          </section>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  RIGHT COLUMN — Health Score + Meetings                          */}
        {/* ---------------------------------------------------------------- */}
        <div className="lg:col-span-4 space-y-6">
          {/* ---- Project Health ---- */}
          <section
            className="rounded-2xl border border-sl-silver/20 bg-sl-obsidian p-6"
            aria-label="Project health score"
          >
            <h2 className="text-base font-bold text-sl-alabaster mb-5">
              Project Health
            </h2>

            {/* Glass card wrapper for HealthScore ring */}
            <div className="flex justify-center">
              <div
                className={cn(
                  'relative p-6 rounded-xl',
                  'bg-white/[0.02] border border-sl-silver/20/15',
                  'backdrop-blur-sm',
                )}
              >
                <HealthScore data={dashboardData.healthScore} />
              </div>
            </div>

            {/* Metric Breakdown Bars */}
            {dashboardData.healthScore.metricBreakdown && (
              <div className="mt-6 space-y-3" aria-label="Health metric breakdown">
                {METRIC_KEYS.map((key, idx) => (
                  <MetricBar
                    key={key}
                    label={METRIC_LABELS[key]}
                    value={dashboardData.healthScore.metricBreakdown![key]}
                    delay={0.5 + idx * 0.1}
                    prefersReduced={prefersReduced}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ---- Upcoming Meetings ---- */}
          <section
            className="rounded-2xl border border-sl-silver/20 bg-sl-obsidian p-6"
            aria-label="Upcoming meetings"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-sl-alabaster">
                Upcoming Meetings
              </h2>
              {dashboardData.upcomingMeetings.length > 0 && (
                <span className="text-[10px] font-mono text-sl-mist/60">
                  {dashboardData.upcomingMeetings.length} scheduled
                </span>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {dashboardData.upcomingMeetings.length > 0 ? (
                <motion.div
                  key="meetings-list"
                  className="space-y-3"
                  variants={staggerContainer(STAGGER.component, 0)}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  role="list"
                  aria-label="Meeting list"
                >
                  {dashboardData.upcomingMeetings.map((meeting, idx) => (
                    <div key={meeting.id} role="listitem">
                      <MeetingCard
                        meeting={meeting}
                        index={idx}
                        prefersReduced={prefersReduced}
                      />
                    </div>
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
          </section>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  EMBEDDED COPILOT DRAWER                                         */}
      {/* ================================================================ */}
      <PortalAiCopilot
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        projectName={dashboardData.activeProjectName}
      />
    </div>
  );
}


