'use client';

import { useOdooList, useOdooItem, useOdooMutation } from './use-odoo-query';
import type { ListParams } from './use-odoo-query';

const KEYS = { events: 'calendar-events', event: 'calendar-event' } as const;

/** Minimal shape for a calendar event mutation payload. */
export interface CalendarEventInput {
  name?: string;
  start?: string;
  stop?: string;
  description?: string;
  [key: string]: unknown;
}

export function useCalendarEvents(filters?: ListParams) {
  return useOdooList(KEYS.events, '/odoo/calendar/events', filters);
}

export function useCalendarEvent(id?: string | number) {
  return useOdooItem(KEYS.event, '/odoo/calendar/events', id);
}

export function useCreateEvent() {
  return useOdooMutation<CalendarEventInput, CalendarEventInput>('/odoo/calendar/events', 'POST', { invalidateKeys: [KEYS.events] });
}

export function useUpdateEvent(id?: string | number) {
  return useOdooMutation<CalendarEventInput, CalendarEventInput>(`/odoo/calendar/events/${id}`, 'PATCH', { invalidateKeys: [KEYS.events, KEYS.event] });
}

export function useDeleteEvent(id?: string | number) {
  return useOdooMutation<void, void>(`/odoo/calendar/events/${id}`, 'DELETE', { invalidateKeys: [KEYS.events] });
}
