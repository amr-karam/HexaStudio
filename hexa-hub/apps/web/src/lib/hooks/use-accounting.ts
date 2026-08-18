'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';

const KEYS = {
  coa: 'accounting-coa',
  entries: 'accounting-entries',
  trialBalance: 'accounting-trial-balance',
  pnl: 'accounting-pnl',
  balanceSheet: 'accounting-balance-sheet',
} as const;

/** Mirrors the domain types declared in the accounting dashboard consumers. */
export interface AccountNode {
  id: number;
  name: string;
  code: string;
  type: string;
  reconcile: boolean;
  children: AccountNode[];
}

export interface JournalEntry {
  id: number;
  name: string;
  date: string;
  ref?: string;
  journal_id: [number, string];
  partner_id?: [number, string];
  state: string;
  amount_total: number;
}

export interface TrialBalanceRow {
  accountId: number;
  accountName: string;
  accountCode: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface PnLReport {
  revenue: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
  expenses: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
  grossProfit: number;
  netIncome: number;
}

export interface BalanceSheet {
  assets: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
  liabilities: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
  equity: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
}

export interface JournalEntriesResponse {
  data: JournalEntry[];
  meta: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: unknown;
  };
}

export function useChartOfAccounts() {
  return useQuery({ queryKey: [KEYS.coa], queryFn: () => get<AccountNode[]>('/accounting/chart-of-accounts'), staleTime: 120_000, retry: 1 });
}

export function useJournalEntries(params?: Record<string, unknown>) {
  return useQuery({ queryKey: [KEYS.entries, params], queryFn: () => get<JournalEntriesResponse>('/accounting/journal-entries', { params }), staleTime: 30_000, retry: 1 });
}

export function useTrialBalance(params?: Record<string, unknown>) {
  return useQuery({ queryKey: [KEYS.trialBalance, params], queryFn: () => get<TrialBalanceRow[]>('/accounting/reports/trial-balance', { params }), staleTime: 60_000, retry: 1 });
}

export function useProfitAndLoss(params?: Record<string, unknown>) {
  return useQuery({ queryKey: [KEYS.pnl, params], queryFn: () => get<PnLReport>('/accounting/reports/profit-and-loss', { params }), staleTime: 60_000, retry: 1 });
}

export function useBalanceSheet(params?: Record<string, unknown>) {
  return useQuery({ queryKey: [KEYS.balanceSheet, params], queryFn: () => get<BalanceSheet>('/accounting/reports/balance-sheet', { params }), staleTime: 60_000, retry: 1 });
}
