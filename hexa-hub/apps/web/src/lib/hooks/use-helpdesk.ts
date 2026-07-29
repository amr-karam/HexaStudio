'use client';

import { useOdooList, useOdooItem, useOdooMutation } from './use-odoo-query';
import type { ListParams } from './use-odoo-query';

const KEYS = { tickets: 'helpdesk-tickets', ticket: 'helpdesk-ticket' } as const;

export function useHelpdeskTickets(filters?: ListParams) {
  return useOdooList(KEYS.tickets, '/odoo/helpdesk/tickets', filters);
}

export function useHelpdeskTicket(id?: string | number) {
  return useOdooItem(KEYS.ticket, '/odoo/helpdesk/tickets', id);
}

export function useCreateTicket() {
  return useOdooMutation<any, any>('/odoo/helpdesk/tickets', 'POST', { invalidateKeys: [KEYS.tickets] });
}

export function useUpdateTicket(id?: string | number) {
  return useOdooMutation<any, any>(`/odoo/helpdesk/tickets/${id}`, 'PATCH', { invalidateKeys: [KEYS.tickets, KEYS.ticket] });
}
