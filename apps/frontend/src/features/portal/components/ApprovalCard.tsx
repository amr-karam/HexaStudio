'use client';

/**
 * HEXA Portal — ApprovalCard
 *
 * Cinematic approval card for the dashboard pending approvals section.
 * Features artisan-glass surface, type-specific accent colors, gold specular highlights,
 * sentiment-aware urgency beacon, currency display, and a gold-threaded audit trail.
 * AnimatePresence-ready for staggered list transitions.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './PortalIcons';
import { fadeLift, makeTransition, EASE } from '@/lib/motion';
import type { PendingApproval, ApprovalSentiment } from '../types';

interface ApprovalCardProps {
  approval: PendingApproval;
  index: number;
  prefersReduced: boolean;
  onReview: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Type-specific configuration                                               */
/* -------------------------------------------------------------------------- */

const TYPE_CONFIG: Record<
  PendingApproval['type'],
  { label: string; icon: IconName; color: string; bg: string; border: string }
> = {
  design: {
    label: 'Design',
    icon: 'pen-tool',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  wireframe: {
    label: 'Wireframe',
    icon: 'layout-grid',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
  },
  contract: {
    label: 'Contract',
    icon: 'file-text',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  quotation: {
    label: 'Quotation',
    icon: 'dollar-sign',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
  },
  invoice: {
    label: 'Invoice',
    icon: 'receipt',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
  },
  deliverable: {
    label: 'Deliverable',
    icon: 'package',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
  },
  scope_change: {
    label: 'Scope Change',
    icon: 'git-branch',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
  },
};

const STATUS_CONFIG: Record<
  PendingApproval['status'],
  { label: string; icon: IconName; pill: string; glow: string }
> = {
  pending: {
    label: 'Awaiting Review',
    icon: 'clock',
    pill: 'border-sl-gold-subtle/30 bg-sl-gold-subtle/10 text-sl-gold-hover',
    glow: 'shadow-[0_0_8px_var(--color-accent)]',
  },
  approved: {
    label: 'Approved',
    icon: 'check-circle',
    pill: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    glow: '',
  },
  rejected: {
    label: 'Rejected',
    icon: 'x',
    pill: 'border-red-500/20 bg-red-500/10 text-red-400',
    glow: '',
  },
  revision_requested: {
    label: 'Revision Requested',
    icon: 'alert-circle',
    pill: 'border-red-500/20 bg-red-500/10 text-red-400',
    glow: '',
  },
};

const SENTIMENT_CONFIG: Record<NonNullable<ApprovalSentiment>, { icon: IconName; color: string; label: string }> = {
  positive: { icon: 'smile', color: 'text-emerald-400', label: 'Client Receptive' },
  neutral: { icon: 'meh', color: 'text-sl-mist/60', label: 'Neutral Tone' },
  frustrated: { icon: 'frown', color: 'text-orange-400', label: 'Elevated Tension' },
  urgent: { icon: 'alert-triangle', color: 'text-red-400', label: 'Urgent Attention' },
};

/* -------------------------------------------------------------------------- */
/*  Formatting helpers                                                        */
/* -------------------------------------------------------------------------- */

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/* -------------------------------------------------------------------------- */
/*  Pulsing urgency beacon for pending items                                  */
/* -------------------------------------------------------------------------- */

interface UrgencyBeaconProps {
  reduced: boolean;
}

const PULSE_TRANSITION = { duration: 1.8, repeat: Infinity, ease: 'easeInOut' };

function UrgencyBeacon({ reduced }: UrgencyBeaconProps) {
  return (
    <span className="relative inline-flex h-2 w-2" aria-hidden="true">
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: 'var(--color-accent)', boxShadow: '0 0 12px var(--color-accent)' }}
        animate={reduced ? undefined : { scale: [1, 2.6], opacity: [0.8, 0] }}
        transition={reduced ? { duration: 0.01 } : PULSE_TRANSITION}
      />
      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sentiment + Urgency badge                                                 */
/* -------------------------------------------------------------------------- */

interface SentimentUrgencyProps {
  sentiment?: ApprovalSentiment;
  urgencyScore?: number;
  reduced: boolean;
}

function SentimentUrgencyBadge({ sentiment, urgencyScore, reduced }: SentimentUrgencyProps) {
  if (!sentiment) {
    return (
      <span
        aria-label="No sentiment data"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-neutral-600/40 bg-neutral-700/30"
      />
    );
  }

  const cfg = SENTIMENT_CONFIG[sentiment];
  const pulseSpeed = sentiment === 'urgent' ? 0.9 : sentiment === 'frustrated' ? 1.4 : 2.2;
  const glowIntensity = sentiment === 'urgent' ? 'shadow-[0_0_16px_theme(colors.red.300)]' : 'shadow-[0_0_12px_theme(colors.amber.300)]';
  const urgencyLabel = urgencyScore != null ? `${urgencyScore}% urgency` : cfg.label;

  return (
    <motion.div
      className={cn(
        'relative inline-flex h-6 w-6 items-center justify-center rounded-full border',
        cfg.color,
        'border-white/30',
        glowIntensity,
      )}
      animate={reduced ? undefined : { opacity: [0.7, 1, 0.7] }}
      transition={{ duration: pulseSpeed, repeat: Infinity, ease: 'easeInOut' }}
      role="img"
      aria-label={urgencyLabel}
      title={urgencyLabel}
    >
      <Icon name={cfg.icon as never} className="h-3 w-3 text-white" />
      <span className="sr-only">{urgencyLabel}</span>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Audit Trail Timeline                                                      */
/* -------------------------------------------------------------------------- */

interface AuditTrailProps {
  trail: NonNullable<PendingApproval['auditTrail']>;
  reduced: boolean;
}

function AuditTrailProps({ trail, reduced }: AuditTrailProps) {
  const lastThree = trail.slice(-3).reverse();

  return (
    <motion.div
      initial={reduced ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
      animate={reduced ? { opacity: 1, height: 'auto' } : { opacity: 1, height: 'auto' }}
      exit={reduced ? { opacity: 0, height: 0 } : { opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: EASE.entrance }}
      className="overflow-hidden"
    >
      <div className="mt-4 pt-4 border-t border-sl-silver/20/50">
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-sl-mist/60 mb-3 flex items-center gap-2">
          <span aria-hidden="true" className="h-px w-6 bg-sl-gold-subtle/40" />
          Audit Trail
        </p>
        <AnimatePresence mode="popLayout">
          <motion.ol
            key={trail.length}
            className="relative space-y-2 border-l border-sl-gold-subtle/30 pl-4"
            role="list"
            aria-label="Audit trail entries"
          >
            {lastThree.map((entry, idx) => (
              <motion.li
                key={`${entry.timestamp}-${entry.action}`}
                variants={fadeLift}
                custom={reduced}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -10, transition: { duration: 0.15 } }}
                transition={makeTransition('entrance', 'micro', idx * 0.06)}
                className="relative"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -left-[10px] top-0.5 h-2 w-2 rotate-45 border',
                    idx === 0
                      ? 'border-sl-gold-subtle bg-sl-gold-subtle shadow-[0_0_8px_var(--color-accent)]'
                      : 'border-sl-gold-subtle/40 bg-sl-void',
                  )}
                />
                <div className="space-y-0.5">
                  <p className="font-sans text-sm text-sl-alabaster/90">{entry.action}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-sl-mist/60">
                    {formatTime(entry.timestamp)} · {entry.actor}
                  </p>
                  {entry.comment && (
                    <p className="font-mono text-[9px] italic text-sl-gold-hover/80">"{entry.comment}"</p>
                  )}
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ApprovalCard — Main Component                                             */
/* -------------------------------------------------------------------------- */

export function ApprovalCard({ approval, index, prefersReduced, onReview }: ApprovalCardProps) {
  const typeCfg = TYPE_CONFIG[approval.type];
  const statusCfg = STATUS_CONFIG[approval.status];
  const isPending = approval.status === 'pending';

  return (
    <motion.div
      variants={fadeLift}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -12, scale: 0.98, transition: { duration: 0.2, ease: EASE.sharp } }}
      custom={prefersReduced}
      transition={makeTransition('entrance', 'component', index * 0.06)}
      className={cn(
        'artisan-glass artisan-specular-top relative overflow-hidden rounded-xl',
        'border border-sl-silver/20/15 p-5',
        'hover:border-sl-gold-subtle/20 transition-colors duration-500 ease-[var(--hexa-ease-interaction)]',
        'flex flex-col gap-4',
      )}
      role="listitem"
    >
      {/* Top row: Type badge + Status badge */}
      <div className="flex items-start justify-between gap-3">
        {/* Type badge with icon */}
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1',
            'rounded-full border font-mono text-[9px] uppercase tracking-[0.2em]',
            typeCfg.color,
            typeCfg.bg,
            typeCfg.border,
          )}
        >
          <Icon name={typeCfg.icon} className="h-3 w-3" />
          {typeCfg.label}
        </span>

        {/* Status badge with pulsing beacon for pending */}
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1',
            'font-mono text-[9px] uppercase tracking-[0.2em]',
            statusCfg.pill,
            statusCfg.glow,
          )}
        >
          {isPending ? (
            <UrgencyBeacon reduced={prefersReduced} />
          ) : (
            <Icon name={statusCfg.icon} className="h-3 w-3" />
          )}
          {statusCfg.label}
        </span>
      </div>

      {/* Title + Project/Phase metadata */}
      <div className="min-w-0">
        <h3 className="font-serif text-base font-light leading-snug text-sl-alabaster/95 line-clamp-1">
          {approval.title}
        </h3>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-sl-mist/60 truncate">
          {approval.projectName} · {approval.phaseName}
        </p>
      </div>

      {/* Bottom row: Submitter info, amount, sentiment/urgency */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-sl-silver/20/50">
        <div className="flex items-center gap-3 text-sm">
          {/* Submitted by */}
          <span className="flex items-center gap-1.5">
            <span className="text-sl-mist/60">by</span>
            <span className="font-medium text-sl-alabaster/90">{approval.submittedBy}</span>
          </span>

          {/* Date */}
          <span className="text-sl-mist/60">|</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-sl-mist/60">
            {formatShortDate(approval.submittedAt)}
          </span>

          {/* Amount */}
          {approval.amount != null && approval.currency && (
            <>
              <span className="text-sl-mist/60">|</span>
              <span className="font-mono text-sl-gold-hover">
                {formatCurrency(approval.amount, approval.currency)}
              </span>
            </>
          )}
        </div>

        {/* Sentiment + Urgency */}
        {approval.sentiment && (
          <div className="flex items-center gap-2">
            <SentimentUrgencyBadge
              sentiment={approval.sentiment}
              urgencyScore={approval.urgencyScore}
              reduced={prefersReduced}
            />
            {approval.urgencyScore != null && approval.urgencyScore > 70 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.1em] rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                <Icon name="alert-triangle" className="w-2.5 h-2.5" />
                URGENT
              </span>
            )}
          </div>
        )}
      </div>

      {/* Audit Trail — only show if there's an audit trail */}
      {approval.auditTrail && approval.auditTrail.length > 0 && (
        <AuditTrailProps trail={approval.auditTrail} reduced={prefersReduced} />
      )}

      {/* Review button — gold primary style */}
      <button
        onClick={onReview}
        className={cn(
          'mt-2 self-start w-full sm:w-auto',
          'inline-flex items-center justify-center gap-2',
          'rounded-xl px-4 py-2.5',
          'bg-sl-gold-subtle text-void font-mono text-[10px] uppercase tracking-[0.3em] font-bold',
          'shadow-lg shadow-sl-gold-subtle/20',
          'hover:bg-sl-gold-subtle-bright hover:shadow-sl-gold-subtle/30',
          'active:scale-[0.98]',
          'transition-all duration-200 ease-[var(--hexa-ease-interaction)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        )}
        aria-label={`Review ${approval.title}`}
      >
        Review
        <Icon name="arrow-up-right" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>
    </motion.div>
  );
}

export default ApprovalCard;