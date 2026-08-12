'use client';

/**
 * HEXA Portal v3.0 — Approval Center View
 *
 * Audit-trailed approval workflows for wireframes, 3D renderings, contracts,
 * invoices, and scope change requests.
 *
 * Cinematic framer-motion choreography:
 *  - Staggered entrance for the approval list cards
 *  - Crossfade + lift transitions when switching the selected approval
 *  - Pulsing gold indicator dot for pending items
 *  - Hover-lift micro-interaction on list cards
 *  - Premium empty state with icon
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Icon } from './PortalIcons';
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

interface PendingDotProps {
  reduced: boolean;
}

function PendingDot({ reduced }: PendingDotProps) {
  return (
    <span className="relative inline-flex w-2 h-2" aria-hidden="true">
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: 'var(--color-accent)' }}
        animate={reduced ? undefined : { scale: [1, 2.4], opacity: [0.7, 0] }}
        transition={reduced ? REDUCED_TRANSITION : { duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
      />
      <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
    </span>
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        variants={fadeLift}
        custom={reduced}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-2xl font-bold text-foreground inline-flex items-center gap-2">
          Approval Center
          <span
            className={cn(
              'text-[10px] font-mono px-2 py-0.5 rounded-full border',
              dataSource === 'live'
                ? 'bg-accent/10 text-accent border-accent/20'
                : 'bg-accent/10 text-accent border-accent/20'
            )}
          >
            {dataSource === 'live' ? 'Live' : 'Demo'}
          </span>
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
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
          className="lg:col-span-5 space-y-3"
          role="list"
          aria-label="Pending approvals list"
        >
          {approvals.map((item) => {
            const isActive = selectedId === item.id;
            const isPending = item.status === 'pending';
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
                  'w-full text-left p-4 rounded-xl border transition-colors',
                  isActive
                    ? 'bg-accent/10 border-accent/50 shadow-lg shadow-accent/10'
                    : 'bg-surface border-border/50 hover:border-border hover:bg-surface-light'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-accent border border-accent/20 uppercase tracking-wider">
                    {isPending && <PendingDot reduced={reduced} />}
                    {item.type}
                  </span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full capitalize font-medium',
                      item.status === 'approved'
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : item.status === 'revision_requested'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-accent/10 text-accent border border-accent/20'
                    )}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-foreground/90 mt-2 line-clamp-1 font-serif font-light">{item.title}</h3>
                <p className="text-xs text-neutral-500 mt-1">{item.phaseName}</p>
                <div className="flex items-center justify-between mt-3 text-[11px] text-neutral-500">
                  <span>By: {item.submittedBy}</span>
                  <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Selected Detail & Audit Trail */}
        <div className="lg:col-span-7 bg-surface border border-border/50 rounded-xl p-6 flex flex-col justify-between min-h-[24rem]">
          <AnimatePresence mode="wait">
            {activeApproval ? (
              <motion.div
                key={activeApproval.id}
                variants={fadeLift}
                custom={reduced}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">{activeApproval.type}</span>
                  <h2 className="text-xl font-medium text-foreground mt-1 font-serif font-light">{activeApproval.title}</h2>
                  <p className="text-xs text-neutral-500 mt-1">{activeApproval.projectName} \u2022 {activeApproval.phaseName}</p>
                </div>

                {/* Preview Card */}
                <div className="p-4 rounded-xl bg-surface-light border border-border/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/5 rounded-lg text-accent">
                      <Icon name="file-text" className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/80">Deliverable Package File</p>
                      <p className="text-xs text-neutral-500">PDF \u2022 Signed Presigned URL ready</p>
                    </div>
                  </div>
                  <button
                    className="text-xs bg-white/5 hover:bg-white/10 text-foreground/80 font-medium px-3 py-1.5 rounded-lg border border-border/50 transition-colors flex items-center space-x-1.5"
                    aria-label="Preview deliverable package file"
                  >
                    <Icon name="eye" className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>

                {/* Action Buttons */}
                {activeApproval.status === 'pending' && (
                  <motion.div
                    variants={fadeLift}
                    custom={reduced}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center space-x-3 pt-2"
                  >
                    <button
                      onClick={() => handleAction(activeApproval.id, 'approved')}
                      className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-background font-medium text-sm transition-colors shadow-lg shadow-accent/20"
                      aria-label="Approve this deliverable"
                    >
                      Approve Deliverable
                    </button>
                    <button
                      onClick={() => handleAction(activeApproval.id, 'revision_requested', 'Please adjust lighting angle')}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground/80 border border-border/50 font-medium text-sm transition-colors"
                      aria-label="Request a revision"
                    >
                      Request Revision
                    </button>
                  </motion.div>
                )}

                {/* Audit Trail */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">Audit Trail Log</h4>
                  <div className="space-y-3 font-mono text-xs border-l-2 border-accent/30 pl-4">
                    {activeApproval.auditTrail?.map((log, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
                        <p className="text-foreground/80 font-medium">{log.action}</p>
                        <p className="text-neutral-500 text-[11px]">{new Date(log.timestamp).toLocaleDateString()} \u2022 {log.actor}</p>
                        {log.notes && <p className="text-accent/80 text-[11px] mt-0.5 font-sans">"{log.notes}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                variants={fadeLift}
                custom={reduced}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="h-64 flex flex-col items-center justify-center text-neutral-500 text-sm space-y-3"
                role="status"
              >
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-accent/50">
                  <Icon name="file-check" className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-foreground/70 font-medium">No approval selected</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Choose an item from the queue to review its full detail and audit trail.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
