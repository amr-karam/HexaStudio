// ─── HEXA Hub — Activities Hooks ───────────────────────────────────────────
// React Query hooks for the Activities module (mail.activity).
// ───────────────────────────────────────────────────────────────────────────

'use client';

import { useOdooList, useOdooMutation } from './use-odoo-query';
import type {
  OdooActivity,
  CreateActivityDto,
  UpdateActivityDto,
} from '@hexa-hub/types';
import type { ListParams } from './use-odoo-query';

// ─── Query Key Constants ───────────────────────────────────────────────────

const ACTIVITIES_KEYS = {
  activities: 'activities',
} as const;

// ─── useActivities ──────────────────────────────────────────────────────────

/**
 * Fetch activities with optional filters.
 * GET /odoo/activities
 *
 * @param filters — Optional filter parameters (state, user, model, date range, etc.).
 */
export function useActivities(filters?: ListParams) {
  return useOdooList<OdooActivity>(
    ACTIVITIES_KEYS.activities,
    '/odoo/activities',
    filters,
  );
}

// ─── useCreateActivity ──────────────────────────────────────────────────────

/**
 * Create a new activity (schedule a call, meeting, todo, etc.).
 * POST /odoo/activities
 */
export function useCreateActivity() {
  return useOdooMutation<OdooActivity, CreateActivityDto>(
    '/odoo/activities',
    'POST',
    {
      invalidateKeys: [ACTIVITIES_KEYS.activities],
    },
  );
}

// ─── useUpdateActivity ──────────────────────────────────────────────────────

/**
 * Update an existing activity.
 * PATCH /odoo/activities/:id
 *
 * @param id — The activity ID to update.
 */
export function useUpdateActivity(id?: string | number) {
  return useOdooMutation<OdooActivity, UpdateActivityDto>(
    `/odoo/activities/${id}`,
    'PATCH',
    {
      invalidateKeys: [ACTIVITIES_KEYS.activities],
    },
  );
}

// ─── useCompleteActivity ────────────────────────────────────────────────────

/**
 * Mark an activity as done.
 * POST /odoo/activities/:id/done
 *
 * @param id — The activity ID to mark as done.
 */
export function useCompleteActivity(id?: string | number) {
  return useOdooMutation<OdooActivity, void>(
    `/odoo/activities/${id}/done`,
    'POST',
    {
      invalidateKeys: [ACTIVITIES_KEYS.activities],
    },
  );
}
