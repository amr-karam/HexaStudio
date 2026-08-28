'use client';

/**
 * HEXA Portal — Pending Approvals Section
 *
 * Section with gold accent border, pulsing urgency indicator, and
 * AnimatePresence-managed empty state.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ApprovalCard } from './ApprovalCard';
import { EmptyState } from './EmptyState';
import { staggerContainer } from '@/lib/motion';
import type { PendingApproval } from '../types';

interface PendingApprovalsSectionProps {
  approvals: PendingApproval[];
  prefersReduced: boolean;
}

export function PendingApprovalsSection({ approvals, prefersReduced }: PendingApprovalsSectionProps) {
  const router = useRouter();

  return (
    <motion.section
      className={cn(
        'relative rounded-2xl',
        'border border-sl-gold-hover/20 bg-sl-obsidian/70',
        'overflow-hidden',
      )}
      aria-label="Pending approvals"
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0, 0)}
    >
      {/* Subtle top accent glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sl-gold-hover/40 to-transparent"
        aria-hidden="true"
      />

      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sl-gold-hover animate-pulse" />
            </span>
            <h2 className="text-base font-bold text-sl-alabaster">
              Pending Approvals
            </h2>
            {approvals.length > 0 && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sl-gold-subtle/20 text-sl-gold-hover">
                {approvals.length}
              </span>
            )}
          </div>
          <button
            onClick={() => router.push('/portal/approvals')}
            className={cn(
              'text-[11px] font-mono uppercase tracking-wider text-sl-gold-hover/80 hover:text-sl-gold-hover transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-hover',
              'rounded px-2 py-1',
            )}
            aria-label="View all pending approvals"
          >
            View All →
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {approvals.length > 0 ? (
            <motion.div
              key="approvals-list"
              className="space-y-3"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={staggerContainer(0, 0)}
            >
              {approvals.map((approval, idx) => (
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
    </motion.section>
  );
}
