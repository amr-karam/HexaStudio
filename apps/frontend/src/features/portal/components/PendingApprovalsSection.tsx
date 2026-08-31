'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './PortalIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '@/lib/motion';
import type { PendingApproval } from '../types';

interface PendingApprovalsSectionProps {
  approvals: PendingApproval[];
  className?: string;
  onViewAll?: () => void;
}

function ApprovalCard({ approval }: { approval: PendingApproval }) {
  const typeColors = {
    design: 'text-blue-500',
    wireframe: 'text-purple-500',
    contract: 'text-emerald-500',
    quotation: 'text-amber-500',
    invoice: 'text-orange-500',
    deliverable: 'text-cyan-500',
    scope_change: 'text-pink-500',
  };

  const typeIcons = {
    design: 'pen-tool' as IconName,
    wireframe: 'layout-grid' as IconName,
    contract: 'file-text' as IconName,
    quotation: 'dollar-sign' as IconName,
    invoice: 'receipt' as IconName,
    deliverable: 'package' as IconName,
    scope_change: 'git-branch' as IconName,
  };

  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-500 border-red-500/30',
    revision_requested: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  };

  const sentimentIcons = {
    positive: 'smile' as IconName,
    neutral: 'meh' as IconName,
    frustrated: 'frown' as IconName,
    urgent: 'alert-circle' as IconName,
  };

  const sentimentColors = {
    positive: 'text-emerald-500',
    neutral: 'text-sl-mist/60',
    frustrated: 'text-orange-500',
    urgent: 'text-red-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.98 }}
      transition={{ duration: 0.2, ease: EASE.entrance }}
      className="artisan-glass relative overflow-hidden rounded-xl p-5 space-y-4 border border-sl-silver/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.15em] rounded-full border ${typeColors[approval.type]} bg-[currentColor]/10 border-[currentColor]/20`}
            >
              <Icon name={typeIcons[approval.type]} className="w-3 h-3" />
              {approval.type.replace('_', ' ')}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.15em] rounded-full ${statusColors[approval.status]}`}
            >
              {approval.status.replace('_', ' ')}
            </span>
          </div>
          <h3 className="font-serif text-base font-light text-foreground truncate pr-4">
            {approval.title}
          </h3>
          <p className="text-sm text-sl-mist/60 mt-1 truncate">
            {approval.projectName} &middot; {approval.phaseName}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] font-mono text-sl-mist/60 whitespace-nowrap">
            {new Date(approval.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {approval.urgencyScore && approval.urgencyScore > 70 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.1em] rounded-full bg-red-500/20 text-red-500 border border-red-500/30">
              <Icon name="alert-triangle" className="w-2.5 h-2.5" />
              URGENT
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-sl-silver/20">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-sl-mist/60">By</span>
          <span className="font-medium text-foreground">{approval.submittedBy}</span>
          {approval.amount && (
            <>
              <span className="text-sl-mist/60">|</span>
              <span className="font-mono text-amber-500">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: approval.currency || 'USD', maximumFractionDigits: 0 }).format(approval.amount)}
              </span>
            </>
          )}
        </div>

        {approval.sentiment && (
          <div className="flex items-center gap-1.5">
            <Icon
              name={sentimentIcons[approval.sentiment]}
              className={`w-4 h-4 ${sentimentColors[approval.sentiment]}`}
            />
            <span className={`text-[10px] font-mono uppercase tracking-[0.1em] capitalize ${sentimentColors[approval.sentiment]}`}>
              {approval.sentiment}
            </span>
            {approval.urgencyScore && (
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-white/5 rounded text-sl-mist/60">
                {approval.urgencyScore}/100
              </span>
            )}
          </div>
        )}
      </div>

      {approval.auditTrail && approval.auditTrail.length > 0 && (
        <div className="mt-4 pt-4 border-t border-sl-silver/20/50">
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-sl-mist/60 mb-2">Audit Trail</p>
          <div className="space-y-1.5">
            {approval.auditTrail.slice(-3).map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.1 * i }}
                className="flex items-center gap-2 text-[10px] font-mono text-sl-mist/60"
              >
                <span className="font-mono text-amber-500">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                <span className="text-amber-500 capitalize">{entry.action}</span>
                <span className="text-sl-mist/40">by {entry.actor}</span>
                {entry.comment && <span className="text-sl-mist/50 italic">- {entry.comment}</span>}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface PendingApprovalsSectionProps {
  approvals: PendingApproval[];
  className?: string;
  onViewAll?: () => void;
}

export function PendingApprovalsSection({ approvals, className, onViewAll }: PendingApprovalsSectionProps) {
  if (approvals.length === 0) {
    return (
      <section className={cn('space-y-6', className)} aria-label="Pending approvals">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-sl-mist/60">Pending Approvals</h2>
          <span className="text-[10px] font-mono text-sl-mist/60">0 pending</span>
        </div>
        <div className="artisan-glass rounded-xl p-12 text-center border border-sl-silver/20">
          <Icon name="check-circle" className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
          <h3 className="font-serif text-lg font-light text-foreground mb-2">All Caught Up</h3>
          <p className="text-sl-mist/60">No pending approvals at this time.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6" aria-label="Pending approvals">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-sl-mist/60">Pending Approvals</h2>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-sl-mist/60">{approvals.length} pending</span>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] border border-sl-silver/30 text-sl-mist/60 hover:border-amber-500/50 hover:text-amber-500 transition-colors rounded"
            >
              View All
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          className="grid gap-4"
          role="list"
          aria-label="Pending approvals"
        >
          {approvals.map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

export default PendingApprovalsSection;