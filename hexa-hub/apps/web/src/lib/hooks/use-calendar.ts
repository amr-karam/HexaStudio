'use client';

import { useOdooList, useOdooItem, useOdooMutation } from './use-odoo-query';
import type { ListParams } from './use-odoo-query';

const KEYS = { events: 'calendar-events', event: 'calendar-event' } as const;

export function useCalendarEvents(filters?: ListParams) {
  return useOdooList(KEYS.events, '/odoo/calendar/events', filters);
}

export function useCalendarEvent(id?: string | number) {
  return useOdooItem(KEYS.event, '/odoo/calendar/events', id);
}

export function useCreateEvent() {
  return useOdooMutation<any, any>('/odoo/calendar/events', 'POST', { invalidateKeys: [KEYS.events] });
}

export function useUpdateEvent(id?: string | number) {
  return useOdooMutation<any, any>(`/odoo/calendar/events/${id}`, 'PATCH', { invalidateKeys: [KEYS.events, KEYS.event] });
}

export function useDeleteEvent(id?: string | number) {
  return useOdooMutation<void, void>(`/odoo/calendar/events/${id}`, 'DELETE', { invalidateKeys: [KEYS.events] });
}
