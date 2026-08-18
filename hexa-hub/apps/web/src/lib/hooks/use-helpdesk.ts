'use client';

import { useOdooList, useOdooItem, useOdooMutation } from './use-odoo-query';
import type { ListParams } from './use-odoo-query';

const KEYS = { tickets: 'helpdesk-tickets', ticket: 'helpdesk-ticket' } as const;

/** Minimal shape for a helpdesk ticket mutation payload. */
export interface HelpdeskTicketInput {
  name?: string;
  description?: string;
  stage_id?: number | string;
  partner_id?: number | string;
  [key: string]: unknown;
}

export function useHelpdeskTickets(filters?: ListParams) {
  return useOdooList(KEYS.tickets, '/odoo/helpdesk/tickets', filters);
}

export function useHelpdeskTicket(id?: string | number) {
  return useOdooItem(KEYS.ticket, '/odoo/helpdesk/tickets', id);
}

export function useCreateTicket() {
  return useOdooMutation<HelpdeskTicketInput, HelpdeskTicketInput>('/odoo/helpdesk/tickets', 'POST', { invalidateKeys: [KEYS.tickets] });
}

export function useUpdateTicket(id?: string | number) {
  return useOdooMutation<HelpdeskTicketInput, HelpdeskTicketInput>(`/odoo/helpdesk/tickets/${id}`, 'PATCH', { invalidateKeys: [KEYS.tickets, KEYS.ticket] });
}
