'use client';

import { useQuery } from '@tanstack/react-query';
import { useOdooList, useOdooMutation } from './use-odoo-query';
import { get } from '@/lib/api';
import type { ListParams } from './use-odoo-query';

const KEYS = { timesheets: 'timesheets', stats: 'timesheets-stats' } as const;

/** Minimal shape for a timesheet entry mutation payload. */
export interface TimesheetInput {
  employee_id?: number | string;
  project_id?: number | string;
  task_id?: number | string;
  name?: string;
  unit_amount?: number;
  date?: string;
  [key: string]: unknown;
}

export function useTimesheets(filters?: ListParams) {
  return useOdooList(KEYS.timesheets, '/odoo/timesheets', filters);
}

export function useCreateTimesheet() {
  return useOdooMutation<TimesheetInput, TimesheetInput>('/odoo/timesheets', 'POST', { invalidateKeys: [KEYS.timesheets, KEYS.stats] });
}

export function useTimesheetStats(filters?: { dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: [KEYS.stats, filters],
    queryFn: () => get<{ total_hours: number; total_entries: number; unique_employees: number }>('/odoo/timesheets/stats', { params: filters }),
    staleTime: 60_000,
    retry: 1,
  });
}
