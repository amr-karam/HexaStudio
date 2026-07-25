'use client';

/**
 * HEXA Portal v3.0 — Finance Center View
 *
 * Odoo billing integration, invoice status, multi-currency display, and contracts.
 */

import React, { useState } from 'react';
import { Icon } from './PortalIcons';
import type { InvoiceItem } from '../types';

const INVOICES: InvoiceItem[] = [
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

export function FinanceCenterView() {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const exchangeRates = { USD: 1, EUR: 0.92, GBP: 0.78 };

  const formatAmount = (usdVal: number) => {
    const rate = exchangeRates[selectedCurrency];
    const converted = usdVal * rate;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedCurrency }).format(converted);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100">Finance & Invoicing</h1>
          <p className="text-sm text-neutral-400">
            Real-time Odoo ERP sync for invoices, quotations, contracts, and dynamic currency conversions.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl">
          <span className="text-xs text-neutral-500 font-semibold px-2">Currency:</span>
          {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                selectedCurrency === curr ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-neutral-100'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <p className="text-xs text-neutral-400 font-medium">Total Contract Value</p>
          <p className="text-2xl font-bold text-neutral-100 mt-2">{formatAmount(50000)}</p>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-block">Fixed Price Agreement</span>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <p className="text-xs text-neutral-400 font-medium">Total Paid</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{formatAmount(25000)}</p>
          <span className="text-[11px] text-neutral-500 mt-1 inline-block">50% Completed</span>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <p className="text-xs text-neutral-400 font-medium">Outstanding Balance</p>
          <p className="text-2xl font-bold text-amber-400 mt-2">{formatAmount(12500)}</p>
          <span className="text-[11px] text-amber-400/80 mt-1 inline-block">Due Aug 30, 2026</span>
        </div>
      </div>

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
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="p-4 font-mono font-semibold text-neutral-100">{inv.number}</td>
                  <td className="p-4 text-neutral-400">{inv.issueDate}</td>
                  <td className="p-4 text-neutral-400">{inv.dueDate}</td>
                  <td className="p-4 font-bold text-neutral-100">{formatAmount(inv.amount)}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-semibold capitalize text-[10px] ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={inv.downloadUrl}
                      className="inline-flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                    >
                      <Icon name="download" className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
