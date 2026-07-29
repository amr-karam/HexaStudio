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

export function useChartOfAccounts() {
  return useQuery({ queryKey: [KEYS.coa], queryFn: () => get<any[]>('/accounting/chart-of-accounts'), staleTime: 120_000, retry: 1 });
}

export function useJournalEntries(params?: Record<string, unknown>) {
  return useQuery({ queryKey: [KEYS.entries, params], queryFn: () => get<{ data: any[]; meta: any }>('/accounting/journal-entries', { params }), staleTime: 30_000, retry: 1 });
}

export function useTrialBalance(params?: Record<string, unknown>) {
  return useQuery({ queryKey: [KEYS.trialBalance, params], queryFn: () => get<any[]>('/accounting/reports/trial-balance', { params }), staleTime: 60_000, retry: 1 });
}

export function useProfitAndLoss(params?: Record<string, unknown>) {
  return useQuery({ queryKey: [KEYS.pnl, params], queryFn: () => get<any>('/accounting/reports/profit-and-loss', { params }), staleTime: 60_000, retry: 1 });
}

export function useBalanceSheet(params?: Record<string, unknown>) {
  return useQuery({ queryKey: [KEYS.balanceSheet, params], queryFn: () => get<any>('/accounting/reports/balance-sheet', { params }), staleTime: 60_000, retry: 1 });
}
