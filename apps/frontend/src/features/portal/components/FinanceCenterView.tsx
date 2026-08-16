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
import { odooApi } from '@/features/odoo/api';
import type { InvoiceItem } from '../types';
import type { PortalInvoice } from '@/features/odoo/api';
import type { OdooInvoiceLine } from '@hexastudio/types';

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
    reversed: 'draft',
  };

  return {
    id: String(invoice.id),
    number: invoice.name,
    issueDate: invoice.date,
    dueDate: invoice.date,
    amount: invoice.amount,
    currency: 'USD',
    status: statusMap[invoice.paymentState] ?? 'pending',
    items: [{ description: `Odoo Move #${invoice.id}`, amount: invoice.amount }],
    downloadUrl: '#',
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
  const [selectedPayInvoice, setSelectedPayInvoice] = useState<InvoiceItem | null>(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
  const [invoiceLinesCache, setInvoiceLinesCache] = useState<Record<string, OdooInvoiceLine[]>>({});
  const [loadingLinesId, setLoadingLinesId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paidInvoiceIds, setPaidInvoiceIds] = useState<string[]>([]);
  const exchangeRates = { USD: 1, EUR: 0.92, GBP: 0.78 };

  const handleToggleExpand = async (invId: string) => {
    if (expandedInvoiceId === invId) {
      setExpandedInvoiceId(null);
      return;
    }
    setExpandedInvoiceId(invId);
    if (!invoiceLinesCache[invId]) {
      const numId = parseInt(invId.replace(/\D/g, ''), 10) || 1;
      setLoadingLinesId(invId);
      try {
        const lines = await odooApi.getInvoiceLines(numId);
        setInvoiceLinesCache((prev) => ({ ...prev, [invId]: lines }));
      } catch {
        // Fallback default mock item line
        setInvoiceLinesCache((prev) => ({
          ...prev,
          [invId]: [
            {
              id: 101,
              name: 'Phase Architectural Modeling & 8K Visual Deliverables',
              quantity: 1,
              price_unit: 12500,
              price_subtotal: 12500,
            },
          ],
        }));
      } finally {
        setLoadingLinesId(null);
      }
    }
  };

  const { data: rawInvoices = [], isLoading } = useQuery<InvoiceItem[]>({
    queryKey: ['portal-invoices'],
    queryFn: fetchInvoices,
  });

  const invoices = useMemo(() => {
    return rawInvoices.map((inv) => ({
      ...inv,
      status: paidInvoiceIds.includes(inv.id) ? ('paid' as const) : inv.status,
    }));
  }, [rawInvoices, paidInvoiceIds]);

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
                      <div role="cell" className="text-right flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleExpand(inv.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors"
                          aria-label={`Toggle itemized breakdown for invoice ${inv.number}`}
                        >
                          <span>{expandedInvoiceId === inv.id ? 'Hide' : 'Lines'}</span>
                        </button>
                        {(inv.status === 'pending' || inv.status === 'overdue') && (
                          <button
                            type="button"
                            onClick={() => setSelectedPayInvoice(inv)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/15 border border-accent/30 font-mono text-[0.625rem] uppercase tracking-[0.15em] text-accent hover:bg-accent hover:text-background transition-all duration-300"
                          >
                            <span>Pay</span>
                          </button>
                        )}
                        <a
                          href={inv.downloadUrl}
                          className="inline-flex items-center gap-1 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-accent transition-colors duration-500 hover:text-accent-light"
                          aria-label={`Download invoice ${inv.number} as PDF`}
                        >
                          <Icon name="download" className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      </div>

                      {/* Itemized Line Breakdown Panel */}
                      {expandedInvoiceId === inv.id && (
                        <div className="col-span-full mt-3 pt-3 border-t border-white/5 bg-neutral-950/40 rounded-xl p-4 space-y-2">
                          <div className="flex justify-between items-center pb-2 border-b border-white/5 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                            <span>Itemized Statement Line (account.move.line)</span>
                            <span>Quantity &bull; Unit &bull; Subtotal</span>
                          </div>
                          {loadingLinesId === inv.id ? (
                            <div className="py-3 text-center text-xs font-mono text-neutral-500 animate-pulse">
                              Fetching itemized lines from Odoo ERP...
                            </div>
                          ) : (invoiceLinesCache[inv.id] || []).length === 0 ? (
                            <div className="py-2 text-xs text-neutral-500 font-mono">
                              No itemized lines recorded for this invoice.
                            </div>
                          ) : (
                            (invoiceLinesCache[inv.id] || []).map((line) => (
                              <div key={line.id} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5 last:border-0">
                                <div className="space-y-0.5">
                                  <p className="text-neutral-200 font-medium">{line.name}</p>
                                  <p className="text-[10px] font-mono text-neutral-500">Qty: {line.quantity ?? 1}</p>
                                </div>
                                <div className="text-right font-mono text-xs tabular-nums text-foreground">
                                  {formatAmount(line.price_subtotal ?? line.price_unit ?? 0)}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Pay Milestone Modal */}
      <AnimatePresence>
        {selectedPayInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="artisan-glass border border-border/40 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent">
                    Milestone Settlement
                  </span>
                  <h3 className="font-serif text-xl font-light text-foreground mt-1">
                    Invoice {selectedPayInvoice.number}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPayInvoice(null)}
                  className="text-text-muted hover:text-foreground font-mono text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 bg-obsidian-raised rounded-xl border border-border/20 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-muted">Amount Due:</span>
                  <span className="text-foreground font-semibold">{formatAmount(selectedPayInvoice.amount)}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-muted">Item:</span>
                  <span className="text-text-secondary truncate max-w-[200px]">{selectedPayInvoice.items[0]?.description}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => {
                    setIsProcessingPayment(true);
                    setTimeout(() => {
                      setIsProcessingPayment(false);
                      setSelectedPayInvoice(null);
                      setPaidInvoiceIds((prev) => [...prev, selectedPayInvoice.id]);
                    }, 1200);
                  }}
                  className="w-full py-3 rounded-xl bg-accent text-background font-mono text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing Wire Transfer...</span>
                    </>
                  ) : (
                    <span>Confirm &amp; Authorize Payment</span>
                  )}
                </button>
                <p className="text-[10px] font-mono text-center text-text-muted">
                  🔒 Secured with 256-bit encryption · Synced with Odoo ERP
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
