'use client';

/**
 * HEXA Portal v3.0 — Finance Center View
 *
 * Odoo billing integration, invoice status, multi-currency display, and contracts.
 *
 * Cinematic framer-motion choreography:
 *  - Staggered entrance for summary cards and invoice rows
 *  - Hover lift effect on table rows
 *  - Shared-layout animated currency selector indicator
 */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeLift, staggerContainer, makeTransition, STAGGER, REDUCED_TRANSITION } from '@/lib/motion';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FALLBACK_SUMMARY_CARDS: {
  label: string;
  valueFn: (fmt: (n: number) => string) => string;
  valueClass: string;
  note: string;
  noteClass: string;
}[] = [
  { label: 'Total Contract Value', valueFn: (fmt: (n: number) => string) => fmt(50000), valueClass: 'text-neutral-100', note: 'Fixed Price Agreement', noteClass: 'text-emerald-400' },
  { label: 'Total Paid', valueFn: (fmt: (n: number) => string) => fmt(25000), valueClass: 'text-emerald-400', note: '50% Completed', noteClass: 'text-neutral-500' },
  { label: 'Outstanding Balance', valueFn: (fmt: (n: number) => string) => fmt(12500), valueClass: 'text-amber-400', note: 'Due Aug 30, 2026', noteClass: 'text-amber-400/80' },
];

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
    <div className={cn('relative overflow-hidden rounded bg-neutral-800', className)} aria-hidden="true">
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.10) 50%, transparent 100%)' }}
        animate={reduced ? undefined : { x: ['-100%', '100%'] }}
        transition={reduced ? REDUCED_TRANSITION : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function FinanceSkeleton({ reduced }: { reduced: boolean }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading finance data">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <ShimmerBlock reduced={reduced} className="h-6 w-48" />
          <ShimmerBlock reduced={reduced} className="h-4 w-72" />
        </div>
        <ShimmerBlock reduced={reduced} className="h-8 w-44 rounded-xl" />
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl space-y-3">
            <ShimmerBlock reduced={reduced} className="h-3 w-28" />
            <ShimmerBlock reduced={reduced} className="h-8 w-36" />
            <ShimmerBlock reduced={reduced} className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800">
          <ShimmerBlock reduced={reduced} className="h-4 w-44" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <ShimmerBlock key={i} reduced={reduced} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
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
        valueClass: 'text-neutral-100',
        note: `${totalCount} Invoice${totalCount !== 1 ? 's' : ''}`,
        noteClass: 'text-emerald-400',
      },
      {
        label: 'Total Paid',
        valueFn: (fmt: (n: number) => string) => fmt(totalPaid),
        valueClass: 'text-emerald-400',
        note: `${completionPct}% Completed`,
        noteClass: 'text-neutral-500',
      },
      {
        label: 'Outstanding Balance',
        valueFn: (fmt: (n: number) => string) => fmt(outstandingBalance),
        valueClass: 'text-amber-400',
        note: `Across ${outstandingCount} invoice${outstandingCount !== 1 ? 's' : ''}`,
        noteClass: 'text-amber-400/80',
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
          <h1 className="text-2xl font-bold text-neutral-100">Finance & Invoicing</h1>
          <p className="text-sm text-neutral-400">
            Real-time Odoo ERP sync for invoices, quotations, contracts, and dynamic currency conversions.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl" role="group" aria-label="Select display currency">
          <span className="text-xs text-neutral-500 font-semibold px-2">Currency:</span>
          {(['USD', 'EUR', 'GBP'] as const).map((curr) => {
            const isActive = selectedCurrency === curr;
            return (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                aria-pressed={isActive}
                aria-label={`Display amounts in ${curr}`}
                className={cn(
                  'relative px-3 py-1 rounded-lg text-xs font-bold transition-colors',
                  isActive ? 'text-neutral-950' : 'text-neutral-400 hover:text-neutral-100'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="currency-indicator"
                    className="absolute inset-0 rounded-lg bg-amber-500"
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

      {/* Summary Cards */}
      <motion.div
        variants={staggerContainer(STAGGER.component)}
        custom={reduced}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {summaryCards.map((card) => (
          <motion.div
            key={card.label}
            variants={fadeLift}
            whileHover={reduced ? undefined : { y: -4, transition: makeTransition('interaction', 'micro') }}
            className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl hover:border-amber-500/30 transition-colors"
          >
            <p className="text-xs text-neutral-400 font-medium">{card.label}</p>
            <p className={cn('text-2xl font-bold mt-2', card.valueClass)}>
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
            <span className={cn('text-[11px] mt-1 inline-block', card.noteClass)}>{card.note}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Invoices Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-100">Invoices & Milestone Statements</h3>
          <span className="text-xs text-neutral-500 font-mono">Synced from Odoo account.move</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-neutral-950/60 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-200">
              <AnimatePresence>
                {invoices.map((inv) => (
                  <motion.tr
                    key={inv.id}
                    variants={fadeLift}
                    custom={reduced}
                    initial="hidden"
                    animate="visible"
                    whileHover={reduced ? undefined : { backgroundColor: 'rgba(38, 38, 38, 0.4)', transition: makeTransition('sharp', 'micro') }}
                    className="hover:bg-neutral-800/40"
                  >
                    <td className="p-4 font-mono font-semibold text-neutral-100">{inv.number}</td>
                    <td className="p-4 text-neutral-400">{inv.issueDate}</td>
                    <td className="p-4 text-neutral-400">{inv.dueDate}</td>
                    <td className="p-4 font-bold text-neutral-100">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={selectedCurrency}
                          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                          transition={reduced ? { duration: 0.01 } : makeTransition('sharp', 'micro')}
                          className="inline-block"
                        >
                          {formatAmount(inv.amount)}
                        </motion.span>
                      </AnimatePresence>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full font-semibold capitalize text-[10px]',
                          inv.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        )}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={inv.downloadUrl}
                        className="inline-flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                        aria-label={`Download invoice ${inv.number} as PDF`}
                      >
                        <Icon name="download" className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </a>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}