'use client';

import { useOdooList, useOdooItem } from './use-odoo-query';
import type { ListParams } from './use-odoo-query';

const KEYS = { employees: 'employees', employee: 'employee' } as const;

export function useEmployees(filters?: ListParams) {
  return useOdooList(KEYS.employees, '/odoo/employees', filters);
}

export function useEmployee(id?: string | number) {
  return useOdooItem(KEYS.employee, '/odoo/employees', id);
}
