'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  useChartOfAccounts,
  useJournalEntries,
  useTrialBalance,
  useProfitAndLoss,
  useBalanceSheet,
} from '@/lib/hooks';
import { Tabs, type Tab } from '@/components/ui/tabs';
import { ExportButton } from '@/components/ExportButton';
import type { ExportColumn } from '@/components/ExportButton';
import {
  BookOpen,
  FileText,
  BarChart3,
  TrendingUp,
  PiggyBank,
  Search,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AccountNode {
  id: number;
  name: string;
  code: string;
  type: string;
  reconcile: boolean;
  children: AccountNode[];
}

interface JournalEntry {
  id: number;
  name: string;
  date: string;
  ref?: string;
  journal_id: [number, string];
  partner_id?: [number, string];
  state: string;
  amount_total: number;
}

interface TrialBalanceRow {
  accountId: number;
  accountName: string;
  accountCode: string;
  debit: number;
  credit: number;
  balance: number;
}

interface PnLReport {
  revenue: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
  expenses: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
  grossProfit: number;
  netIncome: number;
}

interface BalanceSheet {
  assets: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
  liabilities: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
  equity: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

const tabs: Tab[] = [
  { id: 'coa', label: 'Chart of Accounts', icon: <BookOpen size={14} /> },
  { id: 'entries', label: 'Journal Entries', icon: <FileText size={14} /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={14} /> },
];

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="p-6 space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-5 bg-neutral-800 rounded w-20" />
          <div className="h-5 bg-neutral-800 rounded flex-1" />
          <div className="h-5 bg-neutral-800 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

// ─── CoA Tree Row ────────────────────────────────────────────────────────────

function CoATreeNode({ node, depth = 0 }: { node: AccountNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-b border-[#1F1F1F]/30 hover:bg-white/[0.01] transition-colors cursor-pointer"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <td className="py-2.5 pl-4" style={{ paddingLeft: `${depth * 20 + 16}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren && (
              <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                <ChevronRight size={12} className="text-[#555]" />
              </motion.span>
            )}
            {!hasChildren && <span className="w-3" />}
            <span className="text-xs text-[#555] font-mono w-16">{node.code}</span>
            <span className="text-sm text-white font-light">{node.name}</span>
          </div>
        </td>
        <td className="py-2.5 pr-4 text-right">
          <span className="text-[11px] text-[#666] capitalize">{node.type}</span>
        </td>
      </motion.tr>
      {hasChildren && expanded && node.children.map((child) => (
        <CoATreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </>
  );
}

// ─── Chart of Accounts Tab ───────────────────────────────────────────────────

function ChartOfAccountsTab() {
  const { data: tree, isLoading, isError, error } = useChartOfAccounts();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'assets' | 'liabilities' | 'equity' | 'income' | 'expenses'>('all');

  if (isLoading) return <TableSkeleton />;
  if (isError) return <div className="p-8 text-center"><AlertCircle size={24} className="mx-auto text-red-400 mb-2" /><p className="text-red-400 text-sm">{error?.message ?? 'Failed to load Chart of Accounts.'}</p></div>;

  const resolvedTree = tree ?? [];

  const filterLabels: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'assets', label: 'Assets' }, { key: 'liabilities', label: 'Liabilities' },
    { key: 'equity', label: 'Equity' }, { key: 'income', label: 'Income' }, { key: 'expenses', label: 'Expenses' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 px-6 pt-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search accounts..." className="w-full pl-9 pr-3 py-2 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#D4A843]/40 transition-all" />
        </div>
        <div className="flex gap-1">
          {filterLabels.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 text-[11px] rounded-lg transition-all ${filter === f.key ? 'bg-[#D4A843]/10 text-[#D4A843]' : 'text-[#666] hover:text-neutral-300'}`}>{f.label}</button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1F1F1F]">
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-[#555]">Account</th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.15em] text-[#555]">Type</th>
            </tr>
          </thead>
          <tbody>
            {resolvedTree.map((node) => (<CoATreeNode key={node.id} node={node} />))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Journal Entries Tab ─────────────────────────────────────────────────────

function JournalEntriesTab() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useJournalEntries({ page, limit: 20 });
  const entries: JournalEntry[] = data?.data ?? [];

  if (isLoading) return <TableSkeleton />;
  if (isError) return <div className="p-8 text-center"><AlertCircle size={24} className="mx-auto text-red-400 mb-2" /><p className="text-red-400 text-sm">{error?.message ?? 'Failed to load entries.'}</p></div>;
  if (entries.length === 0) return <div className="p-16 text-center"><FileText size={32} className="text-[#333] mx-auto mb-3" /><p className="text-[#555] text-sm">No journal entries found.</p></div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1F1F1F]">
            <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-[#555]">Name</th>
            <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-[#555]">Date</th>
            <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-[#555]">Journal</th>
            <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-[#555]">Partner</th>
            <th className="px-6 py-3 text-right text-[10px] uppercase tracking-[0.15em] text-[#555]">Amount</th>
            <th className="px-6 py-3 text-center text-[10px] uppercase tracking-[0.15em] text-[#555]">Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <motion.tr key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-[#1F1F1F]/30 hover:bg-white/[0.01]">
              <td className="px-6 py-3 text-sm text-white font-light">{e.name}</td>
              <td className="px-6 py-3 text-sm text-[#888]">{e.date}</td>
              <td className="px-6 py-3 text-sm text-[#888]">{e.journal_id?.[1] || '—'}</td>
              <td className="px-6 py-3 text-sm text-[#888]">{e.partner_id?.[1] || '—'}</td>
              <td className="px-6 py-3 text-sm text-white text-right tabular-nums">${(e.amount_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-6 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] ${e.state === 'posted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-500/10 text-neutral-400'}`}>{e.state}</span></td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between px-6 py-3 border-t border-[#1F1F1F]">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-xs text-[#888] disabled:opacity-30 hover:text-white transition-colors">Previous</button>
        <span className="text-xs text-[#555]">Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={entries.length < 20} className="px-3 py-1.5 text-xs text-[#888] disabled:opacity-30 hover:text-white transition-colors">Next</button>
      </div>
    </div>
  );
}

// ─── Reports Tab ─────────────────────────────────────────────────────────────

function ReportsTab() {
  const [report, setReport] = useState<'trial-balance' | 'pnl' | 'balance-sheet'>('trial-balance');

  // Fetch all report data — cached by React Query, only active sub-tab renders
  const tbQuery = useTrialBalance();
  const pnlQuery = useProfitAndLoss();
  const bsQuery = useBalanceSheet();

  const isLoading =
    report === 'trial-balance' ? tbQuery.isLoading
    : report === 'pnl' ? pnlQuery.isLoading
    : bsQuery.isLoading;

  const isError =
    report === 'trial-balance' ? tbQuery.isError
    : report === 'pnl' ? pnlQuery.isError
    : bsQuery.isError;

  const errorMessage =
    report === 'trial-balance' ? tbQuery.error?.message
    : report === 'pnl' ? pnlQuery.error?.message
    : bsQuery.error?.message;

  const trialBalance: TrialBalanceRow[] = tbQuery.data ?? [];
  const pnl = pnlQuery.data as PnLReport | undefined;
  const balanceSheet = bsQuery.data as BalanceSheet | undefined;

  // ─── Export Columns ───────────────────────────────────────────────────────
  const trialBalanceExportColumns: ExportColumn[] = [
    { header: 'Account Code', key: 'accountCode', format: (val: unknown) => String(val ?? '') },
    { header: 'Account Name', key: 'accountName', format: (val: unknown) => String(val ?? '') },
    { header: 'Debit', key: 'debit', format: (val: unknown) =>
      `$${Number(val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
    { header: 'Credit', key: 'credit', format: (val: unknown) =>
      `$${Number(val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
    { header: 'Balance', key: 'balance', format: (val: unknown) =>
      `$${Number(val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
  ];

  const reportTabs: { key: typeof report; label: string; icon: LucideIcon }[] = [
    { key: 'trial-balance', label: 'Trial Balance', icon: BookOpen },
    { key: 'pnl', label: 'Profit & Loss', icon: TrendingUp },
    { key: 'balance-sheet', label: 'Balance Sheet', icon: PiggyBank },
  ];

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-6">
        {reportTabs.map((rt) => (
          <button key={rt.key} onClick={() => setReport(rt.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${report === rt.key ? 'bg-[#D4A843]/10 text-[#D4A843]' : 'text-[#666] hover:text-neutral-300'}`}>
            <rt.icon size={14} /> {rt.label}
          </button>
        ))}

        {/* Export — only visible on Trial Balance tab */}
        {report === 'trial-balance' && !isLoading && !isError && (
          <div className="ml-auto">
            <ExportButton
              data={(trialBalance as unknown as Record<string, unknown>[]) ?? []}
              columns={trialBalanceExportColumns}
              filename="trial-balance-export"
              format="csv"
              label="Export CSV"
            />
          </div>
        )}
      </div>

      {isLoading && <TableSkeleton rows={6} />}
      {isError && <div className="text-center py-8"><AlertCircle size={24} className="mx-auto text-red-400 mb-2" /><p className="text-red-400 text-sm">{errorMessage ?? 'Failed to load report.'}</p></div>}

      {!isLoading && !isError && report === 'trial-balance' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[#1F1F1F]">
              <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-[#555]">Code</th>
              <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-[#555]">Account</th>
              <th className="px-6 py-3 text-right text-[10px] uppercase tracking-[0.15em] text-[#555]">Debit</th>
              <th className="px-6 py-3 text-right text-[10px] uppercase tracking-[0.15em] text-[#555]">Credit</th>
              <th className="px-6 py-3 text-right text-[10px] uppercase tracking-[0.15em] text-[#555]">Balance</th>
            </tr></thead>
            <tbody>
              {trialBalance.map((r, i) => (
                <motion.tr key={r.accountId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-[#1F1F1F]/20 hover:bg-white/[0.01]">
                  <td className="px-6 py-2.5 text-xs text-[#555] font-mono">{r.accountCode}</td>
                  <td className="px-6 py-2.5 text-sm text-white font-light">{r.accountName}</td>
                  <td className="px-6 py-2.5 text-sm text-white text-right tabular-nums">${r.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-2.5 text-sm text-white text-right tabular-nums">${r.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className={`px-6 py-2.5 text-sm text-right tabular-nums ${r.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${Math.abs(r.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !isError && report === 'pnl' && pnl && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-serif text-white mb-3">Revenue</h3>
            {pnl.revenue.accounts.map((a) => (
              <div key={a.id} className="flex justify-between py-2 border-b border-[#1F1F1F]/20"><span className="text-sm text-[#888]">{a.code} {a.name}</span><span className="text-sm text-white tabular-nums">${a.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            ))}
            <div className="flex justify-between py-2 mt-1"><span className="text-sm font-medium text-white">Total Revenue</span><span className="text-sm text-emerald-400 tabular-nums">${pnl.revenue.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
          </div>
          <div>
            <h3 className="text-sm font-serif text-white mb-3">Expenses</h3>
            {pnl.expenses.accounts.map((a) => (
              <div key={a.id} className="flex justify-between py-2 border-b border-[#1F1F1F]/20"><span className="text-sm text-[#888]">{a.code} {a.name}</span><span className="text-sm text-white tabular-nums">${a.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            ))}
            <div className="flex justify-between py-2 mt-1"><span className="text-sm font-medium text-white">Total Expenses</span><span className="text-sm text-red-400 tabular-nums">${pnl.expenses.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
          </div>
          <div className="border-t border-[#D4A843]/30 pt-4">
            <div className="flex justify-between py-2"><span className="text-sm text-[#666]">Gross Profit</span><span className="text-sm text-white tabular-nums">${pnl.grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between py-2"><span className="text-lg font-serif text-white">Net Income</span><span className={`text-lg font-serif tabular-nums ${pnl.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${pnl.netIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
          </div>
        </div>
      )}

      {!isLoading && !isError && report === 'balance-sheet' && balanceSheet && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['assets', 'liabilities', 'equity'] as const).map((section) => (
            <div key={section} className="p-4 bg-[#141414] border border-[#1F1F1F] rounded-xl">
              <h3 className="text-sm font-serif text-white mb-3 capitalize">{section}</h3>
              {balanceSheet[section].accounts.slice(0, 8).map((a) => (
                <div key={a.id} className="flex justify-between py-1.5 border-b border-[#1F1F1F]/10 text-xs"><span className="text-[#888] truncate mr-2">{a.name}</span><span className="text-white tabular-nums">${a.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
              ))}
              <div className="flex justify-between pt-3 mt-2 border-t border-[#1F1F1F]"><span className="text-sm font-medium text-white">Total</span><span className="text-sm text-[#D4A843] tabular-nums">${balanceSheet[section].total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AccountingContent() {
  const [activeTab, setActiveTab] = useState('coa');

  return (
    <div className="p-8 md:p-10 lg:p-12 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="mb-8">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#666] mb-4">
          <BookOpen size={13} /><span>Finance</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-white mb-1">Accounting</h1>
            <p className="text-[13px] text-[#666] font-light">Full accountant dashboard — CoA, journal entries, and financial reports</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#141414] border border-[#1F1F1F] rounded-xl overflow-hidden">
        {activeTab === 'coa' && <ChartOfAccountsTab />}
        {activeTab === 'entries' && <JournalEntriesTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </motion.div>
    </div>
  );
}
