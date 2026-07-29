// ─── HEXA Hub — Workspace Query Hooks ──────────────────────────────────────
// React Query hooks for workspace endpoints (local PostgreSQL/TypeORM entities).
// All workspace endpoints now wrap responses in { data } for API consistency.
// ───────────────────────────────────────────────────────────────────────────

'use client';

import {
  useQuery,
  type QueryKey,
} from '@tanstack/react-query';
import { get } from '@/lib/api';
import type { Workspace, WorkspaceTask } from '@hexa-hub/types';
import { useOdooItem } from './use-odoo-query';

// ─── Response Envelope Types (local) ────────────────────────────────────────
// The API wraps all responses in { data }. These match the actual contract.

interface EnvelopeResponse<T> {
  data: T;
}

// ─── Query Key Constants ───────────────────────────────────────────────────

const WORKSPACE_KEYS = {
  workspace: 'workspace',
  workspaceTasks: 'workspace-tasks',
} as const;

// ─── useWorkspace ───────────────────────────────────────────────────────────

/**
 * Fetch a workspace by ID.
 * GET /workspaces/:id
 * Returns { data: Workspace }.
 *
 * @param id — The workspace UUID.
 */
export function useWorkspace(id?: string) {
  return useOdooItem<Workspace>(
    WORKSPACE_KEYS.workspace,
    '/workspaces',
    id,
  );
}

// ─── useWorkspaceTasks ──────────────────────────────────────────────────────

/**
 * Fetch tasks for a workspace.
 * GET /workspaces/:id/tasks
 * Returns { data: WorkspaceTask[] }.
 *
 * @param workspaceId — The workspace UUID.
 */
export function useWorkspaceTasks(workspaceId?: string) {
  const queryKey: QueryKey = [WORKSPACE_KEYS.workspaceTasks, workspaceId];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EnvelopeResponse<WorkspaceTask[]>, Error>({
    queryKey,
    queryFn: () =>
      get<EnvelopeResponse<WorkspaceTask[]>>(`/workspaces/${workspaceId}/tasks`),
    staleTime: 30_000,
    retry: 1,
    enabled: !!workspaceId,
  });

  const tasks = data?.data ?? [];

  return {
    data: tasks,
    isLoading,
    isError,
    error: error ?? null,
    isEmpty: !isLoading && !isError && tasks.length === 0,
    refetch,
  };
}

// ─── useAllWorkspaces ───────────────────────────────────────────────────────

/**
 * Fetch all workspaces.
 * GET /workspaces
 * Returns { data: Workspace[] }.
 */
export function useAllWorkspaces() {
  const queryKey: QueryKey = [WORKSPACE_KEYS.workspace, 'all'];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EnvelopeResponse<Workspace[]>, Error>({
    queryKey,
    queryFn: () =>
      get<EnvelopeResponse<Workspace[]>>('/workspaces'),
    staleTime: 60_000,
    retry: 1,
  });

  const workspaces = data?.data ?? [];

  return {
    data: workspaces,
    isLoading,
    isError,
    error: error ?? null,
    isEmpty: !isLoading && !isError && workspaces.length === 0,
    refetch,
  };
}