'use client';

/**
 * HEXA Portal v3.0 — Support Center View · "The Concierge"
 *
 * Dedicated client support SLA, ticket tracking, and direct project manager
 * escalation. Crafted in the Silent Luxury language: obsidian artisan-glass
 * panels, gold specular hairlines, serif numerals, and mono editorial
 * markers framing every section — matching The Ledger, The Vault, and the
 * Client Command navigation.
 *
 * SUPPORT TICKETS: Uses mock data.
 * Real API integration pending — the Odoo Helpdesk module is accessible
 * at GET /api/odoo/helpdesk/tickets (admin) but no portal-scoped endpoint
 * exists yet. When available, replace the local TICKETS array with a
 * useQuery calling portalApi.getSupportTickets().
 *
 * Cinematic framer-motion choreography:
 *  - Staggered entrance for SLA cards and ticket rows
 *  - Modal entrance with overlay + panel choreography
 *  - Refined glass status pills (priority + lifecycle)
 *  - Hover-lift micro-interaction on rows and SLA cards
 *  - Accessible dialog semantics with focus-safe dismissal
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useQuery } from '@tanstack/react-query';
import { Icon } from './PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  fadeLift,
  staggerContainer,
  modalPanel,
  overlay,
  makeTransition,
  STAGGER,
  EASE,
  DURATION,
} from '@/lib/motion';
import { cn } from '@/lib/utils';
// import { portalApi } from '@/features/portal/api'; // Uncomment when GET /api/portal/support-tickets is ready

/* -------------------------------------------------------------------------- */
/*  Types & mock data                                                         */
/* -------------------------------------------------------------------------- */

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  messages: Array<{
    id: string;
    sender: string;
    role: 'client' | 'support';
    message: string;
    timestamp: string;
  }>;
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
      {
        id: 'm1',
        sender: 'Client User',
        role: 'client',
        message: 'Can we get an 8K resolution export of Vantage Point A?',
        timestamp: '2026-07-23T11:00:00Z',
      },
      {
        id: 'm2',
        sender: 'Elena Rostova',
        role: 'support',
        message: 'Rendering pipeline queued for 8K output. Estimated delivery in 4 hours.',
        timestamp: '2026-07-23T14:30:00Z',
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Status pill treatments — refined glass pills with dot indicators          */
/*  Mirrors the pattern established by FinanceCenterView STATUS_STYLES.        */
/* -------------------------------------------------------------------------- */

const PRIORITY_STYLES: Record<Ticket['priority'], { label: string; pill: string; dot: string }> = {
  urgent: {
    label: 'Urgent',
    pill: 'border-red-500/30 bg-red-500/10 text-red-300',
    dot: 'bg-red-400',
  },
  high: {
    label: 'High',
    pill: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    dot: 'bg-orange-400',
  },
  medium: {
    label: 'Medium',
    pill: 'border-accent/30 bg-accent/10 text-accent-light',
    dot: 'bg-accent',
  },
  low: {
    label: 'Low',
    pill: 'border-white/10 bg-white/5 text-neutral-400',
    dot: 'bg-neutral-500',
  },
};

const LIFECYCLE_STYLES: Record<Ticket['status'], { label: string; pill: string; dot: string }> = {
  open: {
    label: 'Open',
    pill: 'border-white/10 bg-white/5 text-neutral-300',
    dot: 'bg-neutral-400',
  },
  in_progress: {
    label: 'In Progress',
    pill: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    dot: 'bg-blue-400',
  },
  resolved: {
    label: 'Resolved',
    pill: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    dot: 'bg-emerald-400',
  },
};

/* -------------------------------------------------------------------------- */
/*  SLA cards — gold-accented by use case, never the legacy amber/blue solid   */
/* -------------------------------------------------------------------------- */

const SLA_CARDS = [
  {
    icon: 'clock' as const,
    iconWrap: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    label: 'Average Response Time',
    value: '< 15 Minutes',
    note: 'Enterprise Tier 1',
  },
  {
    icon: 'shield-check' as const,
    iconWrap: 'border-accent/30 bg-accent/10 text-accent-light',
    label: 'Dedicated Account SLA',
    value: 'Enterprise · Tier 1',
    note: 'Always-on coverage',
  },
  {
    icon: 'user' as const,
    iconWrap: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    label: 'Assigned Project Manager',
    value: 'Marcus Vance',
    note: 'Direct escalation channel',
  },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function SupportCenterView() {
  const reduced = useReducedMotion();
  const [dataSource] = useState<'live' | 'demo'>('demo');
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-8">
      {/* ================================================================ */}
      {/*  HEADER — editorial eyebrow + serif concierge title             */}
      {/* ================================================================ */}

      <motion.div
        variants={fadeLift}
        custom={reduced}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        {/* Ambient gold aura behind the header */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 left-0 h-40 w-72 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06),transparent_70%)] opacity-80 blur-2xl"
        />

        <div className="relative">
          <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.4em] text-accent/70">
            <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-accent/70" />
            § 01 — Support
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl">
            The Support <em className="text-gradient-gold font-normal italic">Concierge</em>
          </h1>
          <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-neutral-500">
            Dedicated client support SLA, ticket tracking, and direct project manager escalation —
            your hands are never far from the studio.
          </p>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0.01 } : { duration: DURATION.component, ease: EASE.entrance }}
          className="relative flex items-center gap-4 self-start lg:self-auto"
        >
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.25em]',
              dataSource === 'live'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-accent/30 bg-accent/10 text-accent-light',
            )}
          >
            <span
              className={cn('h-1.5 w-1.5 rounded-full', dataSource === 'live' ? 'bg-emerald-400' : 'bg-accent')}
              aria-hidden="true"
            />
            {dataSource === 'live' ? 'Live' : 'Demo Data'}
          </span>

          <motion.button
            whileHover={reduced ? undefined : { y: -2, transition: makeTransition('interaction', 'micro') }}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            aria-haspopup="dialog"
            aria-expanded={showCreate}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-neutral-950 shadow-[0_0_28px_rgba(212,175,55,0.28)] transition-colors duration-500 hover:bg-accent-light"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />
            <span>Submit Request</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* ================================================================ */}
      {/*  SLA STRIP — obsidian glass cards, mono label + serif numeral     */}
      {/* ================================================================ */}

      <motion.div
        variants={staggerContainer(STAGGER.component)}
        custom={reduced}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5"
      >
        {SLA_CARDS.map((card) => (
          <motion.div
            key={card.label}
            variants={fadeLift}
            whileHover={reduced ? undefined : { y: -4, transition: makeTransition('interaction', 'micro') }}
            className="artisan-glass artisan-specular-top group relative overflow-hidden rounded-2xl p-6"
          >
            {/* Gold radial aura — revealed on hover */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-accent/5 opacity-0 blur-2xl transition-opacity duration-700 ease-[var(--hexa-ease-interaction)] group-hover:opacity-100"
            />

            <div className="flex items-center gap-4">
              {/* Icon plate — refined glass pill, gold-tinted by use case */}
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border',
                  card.iconWrap,
                )}
              >
                <Icon name={card.icon} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-neutral-500">
                  {card.label}
                </p>
                <p className="mt-1.5 font-serif text-xl font-light tracking-tight text-foreground">
                  {card.value}
                </p>
              </div>
            </div>

            <p
              className={cn(
                'mt-4 flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-neutral-500',
              )}
            >
              <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-current opacity-70" />
              {card.note}
            </p>

            {/* Specular gold hairline at the bottom — appears on hover */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 right-0 h-px bg-accent/0 transition-colors duration-1000 group-hover:bg-accent/30"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* ================================================================ */}
      {/*  THE LEDGER OF REQUESTS — ticket index entries on artisan glass  */}
      {/* ================================================================ */}

      <div className="artisan-glass artisan-specular-top relative overflow-hidden rounded-2xl">
        {/* Panel header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 p-5">
          <h2 className="flex items-center gap-3 font-serif text-lg font-light tracking-tight text-foreground">
            <span aria-hidden="true" className="h-2 w-2 rotate-45 border border-accent/60" />
            Active Tickets & Escalations
          </h2>
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-neutral-500">
            {TICKETS.length} Open · 0 Resolved this week
          </span>
        </div>

        {TICKETS.length === 0 ? (
          <SupportEmptyState reduced={reduced} />
        ) : (
          <motion.div
            variants={staggerContainer(STAGGER.component)}
            custom={reduced}
            initial="hidden"
            animate="visible"
            className="space-y-3 p-4"
            role="list"
            aria-label="Support tickets"
          >
            {TICKETS.map((t) => {
              const priority = PRIORITY_STYLES[t.priority];
              const lifecycle = LIFECYCLE_STYLES[t.status];
              return (
                <motion.div
                  key={t.id}
                  variants={fadeLift}
                  whileHover={reduced ? undefined : { y: -3, transition: makeTransition('interaction', 'micro') }}
                  className="artisan-glass artisan-specular-top group relative flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between"
                  role="listitem"
                >
                  {/* Gold radial aura — revealed on hover */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-accent/5 opacity-0 blur-2xl transition-opacity duration-700 ease-[var(--hexa-ease-interaction)] group-hover:opacity-100"
                  />

                  <div className="relative min-w-0 flex-1">
                    {/* Pill row — mono ticket ID + priority + lifecycle */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold tracking-tight text-accent-light">
                        {t.id}
                      </span>
                      <StatusPill config={priority} />
                      <StatusPill config={lifecycle} />
                      <span className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-neutral-600">
                        {t.category}
                      </span>
                    </div>

                    {/* Subject — editorial serif, lighter weight */}
                    <h3 className="mt-2.5 font-serif text-base font-light tracking-tight text-foreground">
                      {t.subject}
                    </h3>

                    {/* Metadata — mono micro tracking */}
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-neutral-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="clock" className="h-3 w-3" aria-hidden="true" />
                        Created {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </span>
                      <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-current opacity-40" />
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="message-square" className="h-3 w-3" aria-hidden="true" />
                        {t.messages.length} message{t.messages.length === 1 ? '' : 's'}
                      </span>
                    </p>
                  </div>

                  {/* Action — ghost glass link, arrow translation on hover */}
                  <button
                    className="group/action inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-neutral-300 transition-colors duration-500 hover:border-accent/40 hover:text-accent sm:self-center"
                    aria-label={`View discussion for ticket ${t.id}`}
                  >
                    <span>View Discussion</span>
                    <Icon
                      name="arrow-up-right"
                      className="h-3.5 w-3.5 transition-transform duration-500 ease-[var(--hexa-ease-interaction)] group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ================================================================ */}
      {/*  SUBMIT REQUEST MODAL — artisan glass panel + Input components    */}
      {/* ================================================================ */}

      <AnimatePresence>
        {showCreate && (
          <motion.div
            variants={overlay}
            custom={reduced}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowCreate(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
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
              className="artisan-glass artisan-specular-top relative w-full max-w-md overflow-hidden rounded-2xl p-6 sm:p-8"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <p className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-accent/70">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-accent/70" />
                    § Support Request
                  </p>
                  <h3 id="ticket-modal-title" className="mt-2 font-serif text-xl font-light tracking-tight text-foreground">
                    Open a Concierge Channel
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-neutral-400 transition-colors duration-300 hover:text-accent"
                  aria-label="Close support request dialog"
                >
                  <Icon name="x" className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-4 text-xs font-light leading-relaxed text-neutral-400">
                Your dedicated Project Manager will respond within your 15-minute SLA window.
              </p>

              {/* Form body — token-elevated field treatments (not the Input component, to keep modal scope tight) */}
              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="ticket-subject"
                    className="mb-2 block font-mono text-[0.625rem] uppercase tracking-[0.25em] text-neutral-400"
                  >
                    Subject
                  </label>
                  <input
                    id="ticket-subject"
                    type="text"
                    placeholder="e.g. Export request, material query…"
                    className="h-11 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 text-sm font-light text-foreground placeholder-neutral-500 transition-colors duration-300 focus:border-accent focus:bg-white/[0.04] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ticket-message"
                    className="mb-2 block font-mono text-[0.625rem] uppercase tracking-[0.25em] text-neutral-400"
                  >
                    Message
                  </label>
                  <textarea
                    id="ticket-message"
                    rows={3}
                    placeholder="Provide details for your request…"
                    className="w-full resize-none rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm font-light text-foreground placeholder-neutral-500 transition-colors duration-300 focus:border-accent focus:bg-white/[0.04] focus:outline-none"
                  />
                </div>
              </div>

              {/* Footer actions — ghost + accent, mono micro labels */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/5 pt-5">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-neutral-400 transition-colors duration-300 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-neutral-950 shadow-[0_0_24px_rgba(212,175,55,0.25)] transition-colors duration-500 hover:bg-accent-light"
                >
                  <Icon name="send" className="h-3.5 w-3.5" aria-hidden="true" />
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

/* -------------------------------------------------------------------------- */
/*  Status pill — refined glass pill with dot indicator                       */
/*  Mirrors FinanceCenterView.StatusPill for visual consistency across portal. */
/* -------------------------------------------------------------------------- */

function StatusPill({ config }: { config: { label: string; pill: string; dot: string } }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.15em]',
        config.pill,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty state — diamond ornaments + serif message                           */
/* -------------------------------------------------------------------------- */

function SupportEmptyState({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      variants={fadeLift}
      custom={reduced}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center px-6 py-20 text-center"
      role="status"
    >
      <div className="mb-6 flex items-center justify-center gap-2" aria-hidden="true">
        <span className="h-2 w-2 rotate-45 border border-accent/40" />
        <span className="h-2 w-2 rotate-45 bg-accent/70" />
        <span className="h-2 w-2 rotate-45 border border-accent/40" />
      </div>
      <p className="font-serif text-xl font-light tracking-tight text-foreground sm:text-2xl">
        The concierge channel is quiet
      </p>
      <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-neutral-500">
        No active requests at the moment. When a question arises, your dedicated
        Project Manager is a single message away.
      </p>
    </motion.div>
  );
}
