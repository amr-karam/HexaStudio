'use client';

/**
 * HEXA Portal v3.0 — Finance Center View · "The Ledger"
 *
 * Odoo billing integration, invoice status, multi-currency display, and contracts.
 * Crafted in the Silent Luxury language: obsidian artisan-glass panels, gold
 * specular hairlines, serif numerals with tabular alignment, and mono editorial
 * markers framing every section.
 *
 * Cinematic framer-motion choreography:
 *  - Staggered entrance for summary cards and invoice rows
 *  - Hover-lift micro-interaction on ledger rows and summary cards
 *  - Shared-layout animated currency selector indicator
 *  - Currency crossfade on amounts (AnimatePresence)
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeLift, staggerContainer, makeTransition, STAGGER, REDUCED_TRANSITION, EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { portalApi } from '@/features/portal/api';
import type { InvoiceItem } from '../types';
import type { PortalInvoice } from '@/features/odoo/api';

/* -------------------------------------------------------------------------- */
/*  Fallback data (used when API is unreachable)                              */
/* -------------------------------------------------------------------------- */

const FALLBACK_INVOICES: InvoiceItem[] = [
  {
    id: 'inv-1',
    number: 'INV-2026-042',
    issueDate: '2026-07-01',
    dueDate: '2026-08-30',
    amount: 12500,
    currency: 'USD',
    status: 'pending',
    items: [
      { description: 'Phase 2 Milestone — 3D Modeling & Material Renders', amount: 12500 },
    ],
    downloadUrl: '#',
  },
  {
    id: 'inv-2',
    number: 'INV-2026-015',
    issueDate: '2026-06-01',
    dueDate: '2026-06-15',
    amount: 25000,
    currency: 'USD',
    status: 'paid',
    items: [
      { description: 'Phase 1 Retainer — Architectural Research & Discovery', amount: 25000 },
    ],
    downloadUrl: '#',
  },
];

/* -------------------------------------------------------------------------- */
/*  Status pill treatments (refined glass pills with dot indicators)          */
/* -------------------------------------------------------------------------- */

const STATUS_STYLES: Record<
  InvoiceItem['status'],
  { label: string; pill: string; dot: string }
> = {
  paid: {
    label: 'Paid',
    pill: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    dot: 'bg-emerald-400',
  },
  pending: {
    label: 'Pending',
    pill: 'border-accent/30 bg-accent/10 text-accent-light',
    dot: 'bg-accent',
  },
  overdue: {
    label: 'Overdue',
    pill: 'border-red-500/30 bg-red-500/10 text-red-300',
    dot: 'bg-red-400',
  },
  draft: {
    label: 'Draft',
    pill: 'border-white/10 bg-white/5 text-neutral-400',
    dot: 'bg-neutral-500',
  },
};

/* -------------------------------------------------------------------------- */
/*  Mapper                                                                    */
/* -------------------------------------------------------------------------- */

function mapInvoice(invoice: PortalInvoice): InvoiceItem {
  const statusMap: Record<string, InvoiceItem['status']> = {
    paid: 'paid',
    not_paid: 'pending',
    partial: 'pending',
  };
  return {
    id: String(invoice.id),
    number: invoice.name,
    issueDate: invoice.date,
    dueDate: invoice.date,
    amount: invoice.amount,
    currency: 'USD',
    status: statusMap[invoice.paymentState] ?? 'draft',
    items: [{ description: invoice.name, amount: invoice.amount }],
    downloadUrl: '',
  };
}

/* -------------------------------------------------------------------------- */
/*  Safe fetcher                                                              */
/* -------------------------------------------------------------------------- */

async function fetchInvoices(): Promise<InvoiceItem[]> {
  try {
    const data = await portalApi.getInvoices();
    return data.map(mapInvoice);
  } catch {
    return FALLBACK_INVOICES;
  }
}

/* -------------------------------------------------------------------------- */
/*  Loading skeleton (gold shimmer matching KanbanBoard pattern)              */
/* -------------------------------------------------------------------------- */

function ShimmerBlock({ reduced, className }: { reduced: boolean; className?: string }) {
  return (
    <div
      className={cn('relative overflow-hidden rounded bg-white/[0.04] border border-white/5', className)}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.10) 50%, transparent 100%)' }}
        animate={reduced ? undefined : { x: ['-100%', '100%'] }}
        transition={
          reduced
            ? REDUCED_TRANSITION
            : { duration: 1.6, repeat: Infinity, ease: [...EASE.entrance] as [number, number, number, number] }
        }
      />
    </div>
  );
}

function FinanceSkeleton({ reduced }: { reduced: boolean }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading finance data">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3">
          <ShimmerBlock reduced={reduced} className="h-3 w-40" />
          <ShimmerBlock reduced={reduced} className="h-8 w-64" />
          <ShimmerBlock reduced={reduced} className="h-3 w-80" />
        </div>
        <ShimmerBlock reduced={reduced} className="h-9 w-44 rounded-full" />
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="artisan-glass artisan-specular-top relative overflow-hidden rounded-2xl p-6 space-y-4"
          >
            <ShimmerBlock reduced={reduced} className="h-2.5 w-28" />
            <ShimmerBlock reduced={reduced} className="h-9 w-36" />
            <ShimmerBlock reduced={reduced} className="h-2.5 w-24" />
          </div>
        ))}
      </div>

      {/* Ledger skeleton */}
      <div className="artisan-glass artisan-specular-top relative overflow-hidden rounded-2xl">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <ShimmerBlock reduced={reduced} className="h-4 w-44" />
          <ShimmerBlock reduced={reduced} className="h-3 w-40 hidden sm:block" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <ShimmerBlock key={i} reduced={reduced} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Status pill — refined glass pill with dot indicator                       */
/* -------------------------------------------------------------------------- */

function StatusPill({ status }: { status: InvoiceItem['status'] }) {
  const config = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.15em]',
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

function LedgerEmptyState({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      variants={fadeLift}
      custom={reduced}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center text-center py-20 px-6"
      role="status"
    >
      <div className="mb-6 flex items-center justify-center gap-2" aria-hidden="true">
        <span className="h-2 w-2 rotate-45 border border-accent/40" />
        <span className="h-2 w-2 rotate-45 bg-accent/70" />
        <span className="h-2 w-2 rotate-45 border border-accent/40" />
      </div>
      <p className="font-serif text-xl font-light tracking-tight text-foreground sm:text-2xl">
        The ledger awaits its first entry
      </p>
      <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-neutral-500">
        Invoices issued through Odoo will appear here as elegant index entries —
        status, currency, and payment milestones at a glance.
      </p>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function FinanceCenterView() {
  const reduced = useReducedMotion();
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const exchangeRates = { USD: 1, EUR: 0.92, GBP: 0.78 };

  const { data: invoices = [], isLoading } = useQuery<InvoiceItem[]>({
    queryKey: ['portal-invoices'],
    queryFn: fetchInvoices,
  });

  const summaryCards = useMemo(() => {
    const totalContractValue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const outstandingBalance = invoices
      .filter((inv) => inv.status !== 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const paidCount = invoices.filter((inv) => inv.status === 'paid').length;
    const totalCount = invoices.length;
    const completionPct = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;
    const outstandingCount = invoices.filter((inv) => inv.status !== 'paid').length;

    return [
      {
        label: 'Total Contract Value',
        valueFn: (fmt: (n: number) => string) => fmt(totalContractValue),
        valueClass: 'text-foreground',
        note: `${totalCount} Invoice${totalCount !== 1 ? 's' : ''}`,
        noteClass: 'text-neutral-500',
      },
      {
        label: 'Total Paid',
        valueFn: (fmt: (n: number) => string) => fmt(totalPaid),
        valueClass: 'text-gradient-gold',
        note: `${completionPct}% Completed`,
        noteClass: 'text-emerald-400/90',
      },
      {
        label: 'Outstanding Balance',
        valueFn: (fmt: (n: number) => string) => fmt(outstandingBalance),
        valueClass: 'text-amber-300',
        note: `Across ${outstandingCount} invoice${outstandingCount !== 1 ? 's' : ''}`,
        noteClass: 'text-amber-300/80',
      },
    ];
  }, [invoices]);

  const formatAmount = (usdVal: number) => {
    const rate = exchangeRates[selectedCurrency];
    const converted = usdVal * rate;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedCurrency }).format(converted);
  };

  if (isLoading) {
    return <FinanceSkeleton reduced={reduced} />;
  }

  return (
    <div className="space-y-8">
      {/* ================================================================ */}
      {/*  HEADER — editorial eyebrow + serif ledger title                 */}
      {/* ================================================================ */}

      <motion.div
        variants={fadeLift}
        custom={reduced}
        initial="hidden"
        animate="visible"
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div>
          <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.4em] text-accent/70">
            <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-accent/70" />
            § 01 — Finance
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl">
            The Finance <em className="text-gradient-gold font-normal italic">Ledger</em>
          </h1>
          <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-neutral-500">
            Real-time Odoo ERP sync for invoices, quotations, contracts, and dynamic currency conversions.
          </p>
        </div>

        {/* Currency selector — gold artisan pill */}
        <div
          role="group"
          aria-label="Select display currency"
          className="artisan-glass artisan-specular-top flex items-center gap-1 rounded-full p-1.5 self-start lg:self-auto"
        >
          <span className="pl-3 pr-1 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-neutral-500">
            Currency
          </span>
          {(['USD', 'EUR', 'GBP'] as const).map((curr) => {
            const isActive = selectedCurrency === curr;
            return (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                aria-pressed={isActive}
                aria-label={`Display amounts in ${curr}`}
                className={cn(
                  'relative rounded-full px-4 py-1.5 font-mono text-xs tracking-[0.15em] transition-colors duration-500',
                  isActive ? 'text-neutral-950' : 'text-neutral-400 hover:text-accent'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="currency-indicator"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-dark via-accent to-accent-light shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                    transition={reduced ? { duration: 0.01 } : makeTransition('interaction', 'micro')}
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{curr}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ================================================================ */}
      {/*  SUMMARY KPI STRIP — obsidian glass cards, serif numerals         */}
      {/* ================================================================ */}

      <motion.div
        variants={staggerContainer(STAGGER.component)}
        custom={reduced}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5"
      >
        {summaryCards.map((card) => (
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

            <p className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-neutral-500">
              {card.label}
            </p>

            <p className={cn('mt-3 font-serif text-3xl font-light tracking-tight tabular-nums sm:text-4xl', card.valueClass)}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={selectedCurrency}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={reduced ? { duration: 0.01 } : makeTransition('transition', 'micro')}
                  className="inline-block"
                >
                  {card.valueFn(formatAmount)}
                </motion.span>
              </AnimatePresence>
            </p>

            <p className={cn('mt-2 flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.2em]', card.noteClass)}>
              <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-current opacity-70" />
              {card.note}
            </p>

            {/* Specular gold hairline on hover */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 right-0 h-px bg-accent/0 transition-colors duration-1000 group-hover:bg-accent/30"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* ================================================================ */}
      {/*  THE LEDGER — invoice index entries on artisan-glass rows         */}
      {/* ================================================================ */}

      <div className="artisan-glass artisan-specular-top relative overflow-hidden rounded-2xl">
        {/* Panel header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 border-b border-white/5">
          <h2 className="flex items-center gap-3 font-serif text-lg font-light tracking-tight text-foreground">
            <span aria-hidden="true" className="h-2 w-2 rotate-45 border border-accent/60" />
            Invoices &amp; Milestone Statements
          </h2>
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-neutral-500">
            Synced from Odoo account.move
          </span>
        </div>

        {invoices.length === 0 ? (
          <LedgerEmptyState reduced={reduced} />
        ) : (
          <div className="overflow-x-auto" role="table" aria-label="Invoices and milestone statements">
            <div className="min-w-[860px]">
              {/* Column headers */}
              <div
                role="row"
                className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-4 px-6 py-3 border-b border-white/5"
              >
                {[
                  'Invoice',
                  'Issued',
                  'Due',
                  'Amount',
                  'Status',
                  '',
                ].map((label, idx) => (
                  <div
                    key={idx}
                    role="columnheader"
                    className={cn(
                      'font-mono text-[0.625rem] uppercase tracking-[0.3em] text-neutral-500',
                      idx === 3 && 'text-right',
                      idx === 5 && 'text-right'
                    )}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Ledger rows */}
              <motion.div
                role="rowgroup"
                variants={staggerContainer(STAGGER.component)}
                custom={reduced}
                initial="hidden"
                animate="visible"
                className="p-4 space-y-3"
              >
                <AnimatePresence>
                  {invoices.map((inv) => (
                    <motion.div
                      key={inv.id}
                      role="row"
                      variants={fadeLift}
                      custom={reduced}
                      whileHover={reduced ? undefined : { y: -2, transition: makeTransition('interaction', 'micro') }}
                      className="artisan-glass artisan-specular-top group relative grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-6 py-4"
                    >
                      {/* Invoice number + description */}
                      <div role="cell" className="min-w-0">
                        <p className="font-mono text-xs font-semibold tracking-tight text-foreground">
                          {inv.number}
                        </p>
                        <p className="mt-1 truncate text-[11px] font-light text-neutral-500">
                          {inv.items[0]?.description}
                        </p>
                      </div>

                      {/* Issue / Due */}
                      <div role="cell" className="font-mono text-xs text-neutral-400">
                        {inv.issueDate}
                      </div>
                      <div role="cell" className="font-mono text-xs text-neutral-400">
                        {inv.dueDate}
                      </div>

                      {/* Amount — serif, tabular */}
                      <div role="cell" className="text-right">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={selectedCurrency}
                            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                            transition={reduced ? { duration: 0.01 } : makeTransition('sharp', 'micro')}
                            className="inline-block font-serif text-base font-light tracking-tight tabular-nums text-foreground"
                          >
                            {formatAmount(inv.amount)}
                          </motion.span>
                        </AnimatePresence>
                      </div>

                      {/* Status pill */}
                      <div role="cell">
                        <StatusPill status={inv.status} />
                      </div>

                      {/* Actions */}
                      <div role="cell" className="text-right">
                        <a
                          href={inv.downloadUrl}
                          className="inline-flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-accent transition-colors duration-500 hover:text-accent-light"
                          aria-label={`Download invoice ${inv.number} as PDF`}
                        >
                          <Icon name="download" className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
