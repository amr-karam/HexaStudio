'use client';

/**
 * HEXA Portal — Approval Card
 *
 * Compact approval card with pulsing gold urgency indicator,
 * type badge, title, submitter info, and a "Review" action button.
 * Uses motion entrance choreography.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeLift, makeTransition } from '@/lib/motion';
import type { PendingApproval } from '../types';

interface ApprovalCardProps {
  approval: PendingApproval;
  index: number;
  prefersReduced: boolean;
  onReview: () => void;
}

export function ApprovalCard({ approval, index, prefersReduced, onReview }: ApprovalCardProps) {
  return (
    <motion.div
      variants={fadeLift}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -12, transition: { duration: 0.2 } }}
      custom={prefersReduced}
      transition={makeTransition('entrance', 'component', index * 0.06)}
      className={cn(
        'p-4 rounded-xl bg-white/[0.02] border border-sl-silver/15',
        'flex items-center justify-between gap-4',
        'hover:border-sl-gold-hover/20 transition-colors duration-300',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sl-gold-hover" />
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sl-gold-subtle/20 text-sl-gold-hover">
            {approval.type}
          </span>
          <span className="text-[10px] font-mono text-sl-silver uppercase">
            {approval.phaseName}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-sl-alabaster leading-snug line-clamp-1">
          {approval.title}
        </h4>
        <p className="text-[11px] text-sl-silver mt-1">
          Submitted by {approval.submittedBy}
        </p>
      </div>

      <button
        onClick={onReview}
        className={cn(
          'shrink-0 text-[11px] font-mono font-bold uppercase tracking-wider',
          'px-4 py-2 rounded-lg',
          'bg-sl-gold-hover text-sl-obsidian hover:bg-sl-gold-subtle',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-hover',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-sl-obsidian',
        )}
        aria-label={`Review ${approval.title}`}
      >
        Review
      </button>
    </motion.div>
  );
}
