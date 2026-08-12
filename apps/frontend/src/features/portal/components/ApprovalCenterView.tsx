'use client';

/**
 * HEXA Portal v3.0 — Approval Center View ("The Signing Chamber")
 *
 * Audit-trailed approval workflows for wireframes, 3D renderings, contracts,
 * invoices, and scope change requests — rendered as a formal signing chamber:
 * obsidian artisan-glass panels, gold specular edges, editorial serif + mono
 * typography, and an audit ledger threaded with gold diamond markers.
 *
 * Cinematic framer-motion choreography:
 *  - Staggered entrance for the approval list cards
 *  - Crossfade + lift transitions when switching the selected approval
 *  - Pulsing gold "awaiting signature" beacon for pending items
 *  - Hover-lift micro-interaction on list cards
 *  - Crafted serif empty state with diamond ornament
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Icon, type IconName } from './PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeLift, staggerContainer, makeTransition, STAGGER, REDUCED_TRANSITION } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { portalApi } from '@/features/portal/api';
import type { PendingApproval } from '../types';

const INITIAL_APPROVALS: PendingApproval[] = [
  {
    id: 'app-1',
    title: '3D Exterior Renderings — Vantage Point A & B',
    type: 'design',
    phaseName: 'Phase 2: Architectural Visualization',
    projectName: 'Horizon Villa',
    submittedAt: '2026-07-22T10:00:00Z',
    submittedBy: 'Elena Rostova (Lead Architectural Artist)',
    status: 'pending',
    fileUrl: '/portal/documents/exterior-render-v1.pdf',
    auditTrail: [
      { timestamp: '2026-07-22T10:00:00Z', action: 'Submitted for Client Review', actor: 'Elena Rostova' },
    ],
  },
  {
    id: 'app-2',
    title: 'Milestone 2 Invoicing Estimate — $12,500 USD',
    type: 'invoice',
    phaseName: 'Phase 2 Payment Milestone',
    projectName: 'Horizon Villa',
    submittedAt: '2026-07-20T14:30:00Z',
    submittedBy: 'Finance Dept',
    status: 'pending',
    amount: 12500,
    currency: 'USD',
    auditTrail: [
      { timestamp: '2026-07-20T14:30:00Z', action: 'Invoice Issued', actor: 'Finance Dept' },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Editorial markers & status registry                                       */
/* -------------------------------------------------------------------------- */

const TYPE_LABELS: Record<PendingApproval['type'], string> = {
  design: 'Design',
  wireframe: 'Wireframe',
  contract: 'Contract',
  quotation: 'Quotation',
  invoice: 'Invoice',
  deliverable: 'Deliverable',
  scope_change: 'Scope Change',
};

const TYPE_ICONS: Record<PendingApproval['type'], IconName> = {
  design: 'camera',
  wireframe: 'grid',
  contract: 'file-text',
  quotation: 'dollar-sign',
  invoice: 'receipt',
  deliverable: 'box',
  scope_change: 'milestone',
};

const STATUS_LABELS: Record<PendingApproval['status'], string> = {
  pending: 'Awaiting Signature',
  approved: 'Approved',
  rejected: 'Denied',
  revision_requested: 'Revision Requested',
};

const STATUS_ICONS: Record<PendingApproval['status'], IconName> = {
  pending: 'clock',
  approved: 'check-circle',
  rejected: 'x',
  revision_requested: 'alert-circle',
};

const STATUS_PILLS: Record<PendingApproval['status'], string> = {
  pending: 'border-accent/30 bg-accent/10 text-accent',
  approved: 'border-accent/30 bg-accent/10 text-accent-light',
  rejected: 'border-red-500/20 bg-red-500/10 text-red-400',
  revision_requested: 'border-red-500/20 bg-red-500/10 text-red-400',
};

/* -------------------------------------------------------------------------- */
/*  Formatting helpers                                                       */
/* -------------------------------------------------------------------------- */

const formatShortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatLedgerDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatCurrency = (amount: number, currency: string): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

/* -------------------------------------------------------------------------- */
/*  Gold pulsing beacon — "awaiting signature"                               */
/* -------------------------------------------------------------------------- */

interface PendingDotProps {
  reduced: boolean;
}

const PULSE_TRANSITION = { ...makeTransition('sharp'), duration: 1.8, repeat: Infinity };

function PendingDot({ reduced }: PendingDotProps) {
  return (
    <span className="relative inline-flex h-2 w-2" aria-hidden="true">
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: 'var(--color-accent)', boxShadow: '0 0 12px var(--color-accent)' }}
        animate={reduced ? undefined : { scale: [1, 2.6], opacity: [0.8, 0] }}
        transition={reduced ? REDUCED_TRANSITION : PULSE_TRANSITION}
      />
      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Audit trail — gold-threaded ledger timeline                              */
/* -------------------------------------------------------------------------- */

interface AuditTrailTimelineProps {
  trail: NonNullable<PendingApproval['auditTrail']>;
}

function AuditTrailTimeline({ trail }: AuditTrailTimelineProps) {
  return (
    <div>
      <h4 className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.35em] text-neutral-500">
        <span aria-hidden="true" className="h-px w-6 bg-accent/40" />
        Audit Trail
      </h4>
      <ol className="relative mt-4 space-y-4 border-l border-accent/30 pl-5">
        {trail.map((log, idx) => {
          const isLatest = idx === trail.length - 1;
          return (
            <li key={idx} className="relative">
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -left-[25px] top-1 h-2 w-2 rotate-45 border',
                  isLatest
                    ? 'border-accent bg-accent shadow-[0_0_8px_var(--color-accent)]'
                    : 'border-accent/40 bg-background'
                )}
              />
              <p className="font-sans text-sm text-foreground/90">{log.action}</p>
              <p className="mt-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-neutral-500">
                {formatLedgerDate(log.timestamp)} · {log.actor}
              </p>
              {log.notes && (
                <p className="mt-1 font-mono text-[0.5625rem] italic text-accent/80">"{log.notes}"</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ApprovalCenterView() {
  const reduced = useReducedMotion();
  const [dataSource, setDataSource] = useState<'live' | 'demo'>('demo');
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: dashboardData } = useQuery({
    queryKey: ['portal-dashboard'],
    queryFn: () => portalApi.getDashboard(),
    staleTime: 60000,
    retry: false,
  });

  // Hydrate from dashboard API when available; fall back to mock data on first load
  useEffect(() => {
    if (dashboardData?.pendingApprovals && dashboardData.pendingApprovals.length > 0) {
      setApprovals(dashboardData.pendingApprovals as PendingApproval[]);
      setDataSource('live');
    } else if (approvals.length === 0) {
      setApprovals(INITIAL_APPROVALS);
      setDataSource('demo');
    }
  }, [dashboardData]);

  // Auto-select the first approval once data is populated
  useEffect(() => {
    if (approvals.length > 0 && !selectedId) {
      setSelectedId(approvals[0].id);
    }
  }, [approvals]);

  const activeApproval = approvals.find((a) => a.id === selectedId);

  const handleAction = (id: string, newStatus: 'approved' | 'revision_requested', notes?: string) => {
    setApprovals((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const now = new Date().toISOString();
        const actionLabel = newStatus === 'approved' ? 'Approved by Client' : 'Revision Requested by Client';
        return {
          ...item,
          status: newStatus,
          auditTrail: [
            ...(item.auditTrail || []),
            { timestamp: now, action: actionLabel, actor: 'Client User', notes },
          ],
        };
      })
    );
  };

  return (
    <div className="space-y-8">
      {/* Section Header — mono eyebrow + serif heading with gold italic accent */}
      <motion.div variants={fadeLift} custom={reduced} initial="hidden" animate="visible" className="space-y-4">
        <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.4em] text-accent/70">
          <span aria-hidden="true" className="h-px w-8 bg-accent/50" />
          § 01 — Approvals
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-3xl font-light leading-tight tracking-tight text-foreground md:text-4xl">
            The Signing <em className="text-gradient-gold font-normal italic">Chamber</em>
          </h1>
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.3em] backdrop-blur-md',
              dataSource === 'live'
                ? 'border-accent/30 bg-accent/10 text-accent'
                : 'border-white/10 bg-white/5 text-neutral-400'
            )}
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-accent" />
            {dataSource === 'live' ? 'Live Registry' : 'Demo Registry'}
          </span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-400">
          Review, sign, and authorize deliverables, scope changes, and milestone invoices with full audit logging.
        </p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Approvals List */}
        <motion.div
          variants={staggerContainer(STAGGER.component)}
          custom={reduced}
          initial="hidden"
          animate="visible"
          className="lg:col-span-5 space-y-4"
          role="list"
          aria-label="Pending approvals list"
        >
          {approvals.map((item, idx) => {
            const isActive = selectedId === item.id;
            const isPending = item.status === 'pending';
            const amountLabel =
              item.amount != null && item.currency ? formatCurrency(item.amount, item.currency) : '';
            return (
              <motion.button
                key={item.id}
                variants={fadeLift}
                whileHover={reduced ? undefined : { y: -4, transition: makeTransition('interaction', 'micro') }}
                whileTap={reduced ? undefined : { scale: 0.985 }}
                onClick={() => setSelectedId(item.id)}
                aria-pressed={isActive}
                aria-label={`Open approval ${item.title}, status ${item.status.replace('_', ' ')}`}
                role="listitem"
                className={cn(
                  'group relative w-full overflow-hidden rounded-2xl p-5 text-left artisan-glass artisan-specular-top',
                  isActive && 'artisan-glass-gold'
                )}
              >
                {/* Type badge + status pill */}
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/5 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-accent">
                    <Icon name={TYPE_ICONS[item.type]} className="h-3 w-3" />
                    {TYPE_LABELS[item.type]}
                  </span>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.25em]',
                      STATUS_PILLS[item.status]
                    )}
                  >
                    {isPending ? (
                      <PendingDot reduced={reduced} />
                    ) : (
                      <Icon name={STATUS_ICONS[item.status]} className="h-3 w-3" />
                    )}
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>

                {/* Serif title + mono metadata */}
                <h3 className="mt-4 line-clamp-1 font-serif text-lg font-light tracking-tight text-foreground/95">
                  {item.title}
                </h3>
                <p className="mt-1 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-neutral-500">
                  {item.phaseName}
                  {amountLabel && <span className="ml-2 text-accent-light">· {amountLabel}</span>}
                </p>

                {/* Submitter + date */}
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/5 pt-3">
                  <span className="truncate font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-neutral-500">
                    by {item.submittedBy}
                  </span>
                  <span className="shrink-0 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-neutral-600">
                    № {String(idx + 1).padStart(2, '0')} — {formatShortDate(item.submittedAt)}
                  </span>
                </div>

                {/* Review affordance */}
                <span className="mt-4 inline-flex items-center gap-1.5 self-start font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-neutral-400 transition-colors duration-300 ease-[var(--hexa-ease-interaction)] group-hover:text-accent">
                  Review
                  <Icon
                    name="arrow-up-right"
                    className="h-3 w-3 transition-transform duration-300 ease-[var(--hexa-ease-interaction)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Selected Document — the signing desk */}
        <div className="lg:col-span-7 artisan-glass artisan-glass-gold artisan-specular-top relative min-h-[24rem] flex flex-col justify-between overflow-hidden rounded-2xl p-6 md:p-8">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-px -top-px h-8 w-8 border-l-2 border-t-2 border-accent/40"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -right-px h-8 w-8 border-b-2 border-r-2 border-accent/40"
          />
          <AnimatePresence mode="wait">
            {activeApproval ? (
              <motion.div
                key={activeApproval.id}
                variants={fadeLift}
                custom={reduced}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="relative flex h-full flex-col justify-between gap-8"
              >
                <div className="space-y-5">
                  {/* Document eyebrow + status seal */}
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.35em] text-accent/80">
                      § {String(approvals.findIndex((a) => a.id === activeApproval.id) + 1).padStart(2, '0')} —{' '}
                      {TYPE_LABELS[activeApproval.type]}
                    </span>
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.25em]',
                        STATUS_PILLS[activeApproval.status]
                      )}
                    >
                      {activeApproval.status === 'pending' ? (
                        <PendingDot reduced={reduced} />
                      ) : (
                        <Icon name={STATUS_ICONS[activeApproval.status]} className="h-3.5 w-3.5" />
                      )}
                      {STATUS_LABELS[activeApproval.status]}
                    </span>
                  </div>

                  {/* Serif title + mono metadata */}
                  <div>
                    <h2 className="font-serif text-2xl font-light leading-snug tracking-tight text-foreground">
                      {activeApproval.title}
                    </h2>
                    <div className="mt-3 space-y-1 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-neutral-500">
                      <p>
                        {activeApproval.projectName} · {activeApproval.phaseName}
                      </p>
                      <p>
                        Submitted by {activeApproval.submittedBy} · {formatShortDate(activeApproval.submittedAt)}
                        {activeApproval.amount != null && activeApproval.currency && (
                          <span className="text-accent-light">
                            {' '}
                            · {formatCurrency(activeApproval.amount, activeApproval.currency)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Deliverable preview card */}
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                        <Icon name={TYPE_ICONS[activeApproval.type]} className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-serif text-sm font-light text-foreground/90">Deliverable Package</p>
                        <p className="mt-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-neutral-500">
                          PDF · Signed Presigned URL ready
                        </p>
                      </div>
                    </div>
                    <button
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-foreground/80 transition-colors duration-300 ease-[var(--hexa-ease-interaction)] hover:border-accent/40 hover:text-accent focus-luxury"
                      aria-label="Preview deliverable package file"
                    >
                      <Icon name="eye" className="h-3.5 w-3.5" />
                      Preview
                    </button>
                  </div>
                </div>

                {/* Action buttons or ledger seal */}
                {activeApproval.status === 'pending' ? (
                  <motion.div
                    variants={fadeLift}
                    custom={reduced}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <button
                      onClick={() => handleAction(activeApproval.id, 'approved')}
                      className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-background shadow-lg shadow-accent/20 transition-colors duration-300 ease-[var(--hexa-ease-interaction)] hover:bg-accent-light hover:shadow-accent/30 focus-luxury"
                      aria-label="Approve this deliverable"
                    >
                      Approve Deliverable
                      <Icon
                        name="arrow-up-right"
                        className="h-3.5 w-3.5 transition-transform duration-300 ease-[var(--hexa-ease-interaction)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </button>
                    <button
                      onClick={() => handleAction(activeApproval.id, 'revision_requested', 'Please adjust lighting angle')}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-neutral-300 transition-colors duration-300 ease-[var(--hexa-ease-interaction)] hover:border-accent/40 hover:text-accent focus-luxury"
                      aria-label="Request a revision"
                    >
                      Request Revision
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-3 pt-1">
                    <span
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.25em]',
                        STATUS_PILLS[activeApproval.status]
                      )}
                    >
                      <Icon name={STATUS_ICONS[activeApproval.status]} className="h-3.5 w-3.5" />
                      {STATUS_LABELS[activeApproval.status]}
                    </span>
                    <span className="hidden font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-neutral-500 sm:inline">
                      Record sealed in the ledger
                    </span>
                  </div>
                )}

                {/* Audit trail */}
                <AuditTrailTimeline trail={activeApproval.auditTrail ?? []} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                variants={fadeLift}
                custom={reduced}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-1 flex-col items-center justify-center text-center"
                role="status"
              >
                <span aria-hidden="true" className="relative flex h-16 w-16 items-center justify-center">
                  <span className="absolute inset-0 rotate-45 border border-accent/30" />
                  <span className="absolute inset-2 rotate-45 border border-accent/20 bg-accent/5" />
                  <Icon name="file-check" className="relative h-7 w-7 text-accent/70" />
                </span>
                <p className="mt-6 font-serif text-2xl font-light tracking-tight text-foreground/90">
                  The signing desk <em className="text-gradient-gold font-normal italic">rests</em>.
                </p>
                <p className="mt-2 max-w-xs font-mono text-[0.625rem] uppercase tracking-[0.25em] leading-relaxed text-neutral-500">
                  Select a document from the queue to review its detail and audit trail.
                </p>
                <span aria-hidden="true" className="mt-5 flex items-center gap-2">
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-accent/40" />
                  <span className="h-1.5 w-1.5 rotate-45 bg-accent/50" />
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-accent/40" />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}