'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { TextReveal } from '@/components/ui/TextReveal';
import { API_BASE_URL } from '@/config/constants';

interface DashboardData {
  total_revenue: number;
  total_expenses: number;
  outstanding_receivable: number;
  outstanding_payable: number;
  invoice_count: number;
  draft_count: number;
  posted_count: number;
  paid_count: number;
  journal_count: number;
  account_count: number;
  tax_count: number;
  currency: string;
}

interface Account {
  id: number;
  code: string;
  name: string;
  account_type: string;
}

interface Journal {
  id: number;
  name: string;
  code: string;
  type: string;
}

interface Invoice {
  id: number;
  name: string;
  invoice_date: string;
  partner_id: [number, string];
  amount_total: number;
  amount_residual: number;
  state: string;
  move_type: string;
  payment_state: string;
}

type Tab = 'overview' | 'accounts' | 'invoices' | 'journals';

const fmt = (n: number) => new Intl.NumberFormat('en-LB').format(n);

const stateBadge = (state: string) => {
  const styles: Record<string, string> = {
    draft: 'bg-neutral-800 text-neutral-400',
    posted: 'bg-emerald-900/30 text-emerald-400',
    cancel: 'bg-red-900/30 text-red-400',
  };
  return styles[state] || 'bg-neutral-800 text-neutral-400';
};

const typeBadge = (type: string) => {
  const styles: Record<string, string> = {
    out_invoice: 'bg-blue-900/30 text-blue-400',
    in_invoice: 'bg-amber-900/30 text-amber-400',
    out_refund: 'bg-purple-900/30 text-purple-400',
    in_refund: 'bg-orange-900/30 text-orange-400',
  };
  return styles[type] || 'bg-neutral-800 text-neutral-400';
};

const typeLabel = (type: string) => {
  const labels: Record<string, string> = {
    out_invoice: 'Customer Invoice',
    in_invoice: 'Vendor Bill',
    out_refund: 'Credit Note',
    in_refund: 'Debit Note',
  };
  return labels[type] || type;
};

export default function AdminAccountingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: dashboard, isLoading: dashLoading } = useQuery<DashboardData>({
    queryKey: ['accounting-dashboard'],
    queryFn: async () => {
      const r = await fetch(`${API_BASE_URL}/api/accounting/dashboard`);
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['accounting-accounts'],
    queryFn: async () => {
      const r = await fetch(`${API_BASE_URL}/api/accounting/chart-of-accounts`);
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
    enabled: activeTab === 'accounts',
  });

  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ['accounting-invoices'],
    queryFn: async () => {
      const r = await fetch(`${API_BASE_URL}/api/accounting/invoices?limit=100`);
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
    enabled: activeTab === 'invoices',
  });

  const { data: journals } = useQuery<Journal[]>({
    queryKey: ['accounting-journals'],
    queryFn: async () => {
      const r = await fetch(`${API_BASE_URL}/api/accounting/journals`);
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
    enabled: activeTab === 'journals',
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'accounts', label: 'Chart of Accounts' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'journals', label: 'Journals' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground px-8 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 mb-4 block font-mono"
          >
            Admin / Accounting
          </motion.span>
          <div className="text-4xl md:text-6xl font-serif font-light tracking-tighter">
            <TextReveal delay={0.1}>
              Accounting <span className="italic text-accent">Dashboard</span>
            </TextReveal>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-10 border-b border-border/50">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-light transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-accent text-accent'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {dashLoading ? (
              <div className="text-neutral-500 font-light">Loading...</div>
            ) : dashboard && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Revenue', value: fmt(dashboard.total_revenue), color: 'text-emerald-400' },
                    { label: 'Expenses', value: fmt(dashboard.total_expenses), color: 'text-red-400' },
                    { label: 'Receivable', value: fmt(dashboard.outstanding_receivable), color: 'text-blue-400' },
                    { label: 'Payable', value: fmt(dashboard.outstanding_payable), color: 'text-amber-400' },
                  ].map((card) => (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-surface border border-border/50"
                    >
                      <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono block mb-3">
                        {card.label}
                      </span>
                      <span className={`text-2xl font-light ${card.color}`}>{card.value}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Invoices', value: dashboard.invoice_count },
                    { label: 'Draft', value: dashboard.draft_count },
                    { label: 'Posted', value: dashboard.posted_count },
                    { label: 'Accounts', value: dashboard.account_count },
                    { label: 'Journals', value: dashboard.journal_count },
                    { label: 'Taxes', value: dashboard.tax_count },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 bg-surface border border-border/30">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-mono block mb-2">
                        {stat.label}
                      </span>
                      <span className="text-xl font-light text-foreground">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Chart of Accounts */}
        {activeTab === 'accounts' && accounts && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono">Code</th>
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono">Name</th>
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono">Type</th>
                </tr>
              </thead>
              <tbody>
                {accounts.slice(0, 100).map((account) => (
                  <tr key={account.id} className="border-b border-border/20 hover:bg-surface transition-colors">
                    <td className="py-3 px-4 font-mono text-accent">{account.code}</td>
                    <td className="py-3 px-4 font-light text-neutral-300">{account.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-neutral-800/50 rounded text-[10px] font-mono text-neutral-400">
                        {account.account_type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {accounts.length > 100 && (
              <p className="text-center py-4 text-neutral-500 text-sm font-light">
                Showing 100 of {accounts.length} accounts
              </p>
            )}
          </div>
        )}

        {/* Invoices */}
        {activeTab === 'invoices' && invoices && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono">Number</th>
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono">Date</th>
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono">Partner</th>
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono">Type</th>
                  <th className="text-right py-3 px-4 text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono">Amount</th>
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono">State</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/20 hover:bg-surface transition-colors">
                    <td className="py-3 px-4 font-mono text-foreground">{inv.name}</td>
                    <td className="py-3 px-4 font-light text-neutral-400">{inv.invoice_date || '—'}</td>
                    <td className="py-3 px-4 font-light text-neutral-300">{inv.partner_id?.[1] || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-mono ${typeBadge(inv.move_type)}`}>
                        {typeLabel(inv.move_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-light text-foreground">{fmt(inv.amount_total)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-mono ${stateBadge(inv.state)}`}>
                        {inv.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Journals */}
        {activeTab === 'journals' && journals && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {journals.map((journal) => (
              <motion.div
                key={journal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-surface border border-border/50 hover:border-accent/30 transition-colors"
              >
                <span className="text-xs font-mono text-accent block mb-2">{journal.code}</span>
                <h3 className="text-lg font-light text-foreground mb-1">{journal.name}</h3>
                <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono">
                  {journal.type}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
