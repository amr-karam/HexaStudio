// ─── HEXA Hub — Notifications Hooks ────────────────────────────────────────
// React Query hooks for the Notifications module.
// ───────────────────────────────────────────────────────────────────────────

'use client';

import { useQuery } from '@tanstack/react-query';
import { useOdooList, useOdooMutation } from './use-odoo-query';
import { get } from '@/lib/api';
import type { Notification } from '@hexa-hub/types';
import type { ListParams } from './use-odoo-query';

// ─── Query Key Constants ───────────────────────────────────────────────────

const NOTIFICATIONS_KEYS = {
  notifications: 'notifications',
} as const;

// ─── useNotifications ───────────────────────────────────────────────────────

/**
 * Fetch notifications for the current user.
 * GET /notifications
 *
 * @param filters — Optional filter parameters (read status, channel, etc.).
 */
export function useNotifications(filters?: ListParams) {
  return useOdooList<Notification>(
    NOTIFICATIONS_KEYS.notifications,
    '/notifications',
    filters,
  );
}

// ─── useMarkNotificationRead ────────────────────────────────────────────────

/**
 * Mark a single notification as read.
 * PATCH /notifications/:id/read
 *
 * @param id — The notification ID to mark as read.
 */
export function useMarkNotificationRead(id?: string) {
  return useOdooMutation<Notification, void>(
    `/notifications/${id}/read`,
    'PATCH',
    {
      invalidateKeys: [NOTIFICATIONS_KEYS.notifications],
    },
  );
}

// ─── useMarkAllRead ────────────────────────────────────────────────────────

/**
 * Mark all notifications as read for the current user.
 * PATCH /notifications/read-all
 */
export function useMarkAllRead() {
  return useOdooMutation<{ count: number }, void>(
    '/notifications/read-all',
    'PATCH',
    {
      invalidateKeys: [NOTIFICATIONS_KEYS.notifications],
    },
  );
}

// ─── useDeleteNotification ─────────────────────────────────────────────────

/**
 * Delete a notification.
 * DELETE /notifications/:id
 *
 * @param id — The notification ID to delete.
 */
export function useDeleteNotification(id?: string) {
  return useOdooMutation<void, void>(
    `/notifications/${id}`,
    'DELETE',
    {
      invalidateKeys: [NOTIFICATIONS_KEYS.notifications],
    },
  );
}

// ─── useUnreadCount ──────────────────────────────────────────────────────────

/**
 * Fetch the count of unread notifications for the current user.
 * GET /notifications/unread-count
 */
export function useUnreadCount() {
  const { data, isLoading, isError, error, refetch } = useQuery<{ count: number }, Error>({
    queryKey: [NOTIFICATIONS_KEYS.notifications, 'unread-count'],
    queryFn: () => get<{ count: number }>('/notifications/unread-count'),
    staleTime: 30_000,
    retry: 1,
  });

  return {
    count: data?.count ?? 0,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
