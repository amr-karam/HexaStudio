// ─── HEXA Hub — Tasks Hooks ────────────────────────────────────────────────
// React Query hooks for the Tasks module.
// ───────────────────────────────────────────────────────────────────────────

'use client';

import { useOdooList, useOdooItem, useOdooMutation } from './use-odoo-query';
import type {
  OdooTask,
  CreateTaskDto,
  UpdateTaskDto,
} from '@hexa-hub/types';
import type { ListParams } from './use-odoo-query';

// ─── Query Key Constants ───────────────────────────────────────────────────

const TASKS_KEYS = {
  tasks: 'tasks',
  task: 'task',
} as const;

// ─── useTasks ───────────────────────────────────────────────────────────────

/**
 * Fetch tasks with optional filters.
 * GET /odoo/tasks
 *
 * @param filters — Optional filter parameters (state, priority, project, user, etc.).
 */
export function useTasks(filters?: ListParams) {
  return useOdooList<OdooTask>(
    TASKS_KEYS.tasks,
    '/odoo/tasks',
    filters,
  );
}

// ─── useTask ────────────────────────────────────────────────────────────────

/**
 * Fetch a single task by ID.
 * GET /odoo/tasks/:id
 *
 * @param id — The task ID.
 */
export function useTask(id?: string | number) {
  return useOdooItem<OdooTask>(
    TASKS_KEYS.task,
    '/odoo/tasks',
    id,
  );
}

// ─── useCreateTask ──────────────────────────────────────────────────────────

/**
 * Create a new task.
 * POST /odoo/tasks
 */
export function useCreateTask() {
  return useOdooMutation<OdooTask, CreateTaskDto>(
    '/odoo/tasks',
    'POST',
    {
      invalidateKeys: [TASKS_KEYS.tasks],
    },
  );
}

// ─── useUpdateTask ──────────────────────────────────────────────────────────

/**
 * Update an existing task.
 * PUT /odoo/tasks/:id
 *
 * @param id — The task ID to update.
 */
export function useUpdateTask(id?: string | number) {
  return useOdooMutation<OdooTask, UpdateTaskDto>(
    `/odoo/tasks/${id}`,
    'PUT',
    {
      invalidateKeys: [TASKS_KEYS.tasks, TASKS_KEYS.task],
    },
  );
}

// ─── useCompleteTask ────────────────────────────────────────────────────────

/**
 * Mark a task as completed.
 * POST /odoo/tasks/:id/complete
 *
 * @param id — The task ID to complete.
 */
export function useCompleteTask(id?: string | number) {
  return useOdooMutation<OdooTask, void>(
    `/odoo/tasks/${id}/complete`,
    'POST',
    {
      invalidateKeys: [TASKS_KEYS.tasks, TASKS_KEYS.task],
    },
  );
}

// ─── useDeleteTask ──────────────────────────────────────────────────────────

/**
 * Delete a task.
 * DELETE /odoo/tasks/:id
 *
 * @param id — The task ID to delete.
 */
export function useDeleteTask(id?: string | number) {
  return useOdooMutation<void, void>(
    `/odoo/tasks/${id}`,
    'DELETE',
    {
      invalidateKeys: [TASKS_KEYS.tasks],
    },
  );
}
