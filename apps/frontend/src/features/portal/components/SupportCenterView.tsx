'use client';

/**
 * HEXA Portal v3.0 — Support & Assistance View
 *
 * Dedicated client support SLA, ticket tracking, and direct project manager escalation.
 *
 * SUPPORT TICKETS: Uses mock data.
 * Real API integration pending — the Odoo Helpdesk module is accessible
 * at GET /api/odoo/helpdesk/tickets (admin) but no portal-scoped endpoint
 * exists yet. When available, replace the local TICKETS array with a
 * useQuery calling portalApi.getSupportTickets().
 *
 * Cinematic framer-motion choreography:
 *  - Staggered entrance for SLA cards and ticket list
 *  - Modal entrance with overlay + panel choreography
 *  - Priority color coding (urgent=red, high=orange, medium=gold, low=muted)
 *  - Accessible dialog semantics with focus-safe dismissal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useQuery } from '@tanstack/react-query';
import { Icon } from './PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeLift, staggerContainer, modalPanel, overlay, makeTransition, STAGGER } from '@/lib/motion';
import { cn } from '@/lib/utils';
// import { portalApi } from '@/features/portal/api'; // Uncomment when GET /api/portal/support-tickets is ready

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  messages: Array<{ id: string; sender: string; role: 'client' | 'support'; message: string; timestamp: string }>;
}

const TICKETS: Ticket[] = [
  {
    id: 'TCK-2026-089',
    subject: 'Request for 8K resolution render export',
    category: 'Asset Request',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-07-23T11:00:00Z',
    messages: [
      { id: 'm1', sender: 'Client User', role: 'client', message: 'Can we get an 8K resolution export of Vantage Point A?', timestamp: '2026-07-23T11:00:00Z' },
      { id: 'm2', sender: 'Elena Rostova', role: 'support', message: 'Rendering pipeline queued for 8K output. Estimated delivery in 4 hours.', timestamp: '2026-07-23T14:30:00Z' },
    ],
  },
];

const PRIORITY_STYLES: Record<Ticket['priority'], { bg: string; text: string; border: string; dot: string }> = {
  urgent: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', dot: 'bg-red-400' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40', dot: 'bg-orange-400' },
  medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', dot: 'bg-amber-400' },
  low: { bg: 'bg-neutral-700/40', text: 'text-neutral-400', border: 'border-neutral-700/50', dot: 'bg-neutral-400' },
};

const SLA_CARDS = [
  { icon: 'clock' as const, iconWrap: 'bg-emerald-500/10 text-emerald-400', label: 'Average Response Time', value: '< 15 Minutes' },
  { icon: 'shield-check' as const, iconWrap: 'bg-amber-500/10 text-amber-400', label: 'Dedicated Account SLA', value: 'Enterprise Tier 1' },
  { icon: 'user' as const, iconWrap: 'bg-blue-500/10 text-blue-400', label: 'Assigned Manager', value: 'Marcus Vance' },
];

export function SupportCenterView() {
  const reduced = useReducedMotion();
  const [dataSource] = useState<'live' | 'demo'>('demo');
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        variants={fadeLift}
        custom={reduced}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 inline-flex items-center gap-2">
            Support & Assistance
            <span
              className={cn(
                'text-[10px] font-mono px-2 py-0.5 rounded-full border',
                dataSource === 'live'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              )}
            >
              {dataSource === 'live' ? 'Live' : 'Demo Data'}
            </span>
          </h1>
          <p className="text-sm text-neutral-400">
            Dedicated client support SLA, ticket tracking, and direct project manager escalation.
          </p>
        </div>
        <motion.button
          whileHover={reduced ? undefined : { y: -2, transition: makeTransition('interaction', 'micro') }}
          whileTap={reduced ? undefined : { scale: 0.97 }}
          onClick={() => setShowCreate(true)}
          aria-haspopup="dialog"
          aria-expanded={showCreate}
          className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20"
        >
          <Icon name="plus" className="w-4 h-4" />
          <span>Submit Support Request</span>
        </motion.button>
      </motion.div>

      {/* SLA Status Card */}
      <motion.div
        variants={staggerContainer(STAGGER.component)}
        custom={reduced}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {SLA_CARDS.map((card) => (
          <motion.div
            key={card.label}
            variants={fadeLift}
            whileHover={reduced ? undefined : { y: -4, transition: makeTransition('interaction', 'micro') }}
            className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center space-x-3 hover:border-amber-500/30 transition-colors"
          >
            <div className={cn('p-3 rounded-lg', card.iconWrap)}>
              <Icon name={card.icon} className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-400">{card.label}</p>
              <p className="text-base font-bold text-neutral-100 mt-0.5">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Ticket List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-100">Active Tickets & Escalations</h3>
        <motion.div
          variants={staggerContainer(STAGGER.component)}
          custom={reduced}
          initial="hidden"
          animate="visible"
          className="space-y-3"
          role="list"
          aria-label="Support tickets"
        >
          {TICKETS.map((t) => {
            const priority = PRIORITY_STYLES[t.priority];
            return (
              <motion.div
                key={t.id}
                variants={fadeLift}
                whileHover={reduced ? undefined : { y: -3, transition: makeTransition('interaction', 'micro') }}
                className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500/30 transition-colors"
                role="listitem"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-amber-400 font-bold">{t.id}</span>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-semibold uppercase px-2 py-0.5 rounded border',
                      priority.bg, priority.text, priority.border
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', priority.dot)} aria-hidden="true" />
                      {t.priority}
                    </span>
                    <span className="text-xs capitalize px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-neutral-100 mt-1.5">{t.subject}</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    Created {new Date(t.createdAt).toLocaleString()} • {t.messages.length} message(s)
                  </p>
                </div>
                <button
                  className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-700 transition-colors self-start sm:self-center"
                  aria-label={`View discussion for ticket ${t.id}`}
                >
                  View Discussion
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Submit Ticket Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            variants={overlay}
            custom={reduced}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowCreate(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-modal-title"
          >
            <motion.div
              variants={modalPanel}
              custom={reduced}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 id="ticket-modal-title" className="text-lg font-bold text-neutral-100">Submit Support Request</h3>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-neutral-400 hover:text-neutral-200 transition-colors"
                  aria-label="Close support request dialog"
                >
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-neutral-400">Your dedicated Project Manager will respond within your 15-minute SLA window.</p>
              <div className="space-y-3">
                <div>
                  <label htmlFor="ticket-subject" className="text-xs font-medium text-neutral-300 block mb-1">Subject</label>
                  <input id="ticket-subject" type="text" placeholder="e.g. Export request, Material query..." className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div>
                  <label htmlFor="ticket-message" className="text-xs font-medium text-neutral-300 block mb-1">Message</label>
                  <textarea id="ticket-message" rows={3} placeholder="Provide details for your request..." className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors resize-none" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors">
                  Cancel
                </button>
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-colors">
                  Submit Ticket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}