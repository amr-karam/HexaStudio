// ─── HEXA Hub — Projects Hooks ─────────────────────────────────────────────
// React Query hooks for the Projects module (projects, milestones, stats).
// ───────────────────────────────────────────────────────────────────────────

'use client';

import { useOdooList, useOdooItem, useOdooMutation } from './use-odoo-query';
import type {
  OdooProject,
  OdooMilestone,
  ProjectMetrics,
  CreateProjectDto,
  UpdateProjectDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
} from '@hexa-hub/types';
import type { ListParams } from './use-odoo-query';

// ─── Query Key Constants ───────────────────────────────────────────────────

const PROJECTS_KEYS = {
  projects: 'projects',
  project: 'project',
  milestones: 'project-milestones',
  stats: 'project-stats',
} as const;

// ─── useProjects ────────────────────────────────────────────────────────────

/**
 * Fetch projects with optional filters.
 * GET /odoo/projects
 *
 * @param filters — Optional filter parameters (status, type, partner, etc.).
 */
export function useProjects(filters?: ListParams) {
  return useOdooList<OdooProject>(
    PROJECTS_KEYS.projects,
    '/odoo/projects',
    filters,
  );
}

// ─── useProject ─────────────────────────────────────────────────────────────

/**
 * Fetch a single project by ID.
 * GET /odoo/projects/:id
 *
 * @param id — The project ID.
 */
export function useProject(id?: string | number) {
  return useOdooItem<OdooProject>(
    PROJECTS_KEYS.project,
    '/odoo/projects',
    id,
  );
}

// ─── useProjectMilestones ───────────────────────────────────────────────────

/**
 * Fetch milestones for a specific project.
 * GET /odoo/projects/:id/milestones
 *
 * @param projectId — The project ID.
 */
export function useProjectMilestones(projectId?: string | number) {
  return useOdooList<OdooMilestone>(
    PROJECTS_KEYS.milestones,
    `/odoo/projects/${projectId}/milestones`,
    undefined,
    {
      enabled: projectId !== undefined && projectId !== null && projectId !== '',
    },
  );
}

// ─── useProjectStats ────────────────────────────────────────────────────────

/**
 * Fetch project statistics (active count, completion rate, etc.).
 * GET /odoo/projects/stats
 */
export function useProjectStats() {
  return useOdooItem<ProjectMetrics>(
    PROJECTS_KEYS.stats,
    '/odoo/projects/stats',
    'stats',
  );
}

// ─── useCreateProject ──────────────────────────────────────────────────────

/**
 * Create a new project.
 * POST /odoo/projects
 */
export function useCreateProject() {
  return useOdooMutation<OdooProject, CreateProjectDto>(
    '/odoo/projects',
    'POST',
    {
      invalidateKeys: [PROJECTS_KEYS.projects, PROJECTS_KEYS.stats],
    },
  );
}

// ─── useUpdateProject ──────────────────────────────────────────────────────

/**
 * Update an existing project.
 * PUT /odoo/projects/:id
 *
 * @param id — The project ID to update.
 */
export function useUpdateProject(id?: string | number) {
  return useOdooMutation<OdooProject, UpdateProjectDto>(
    `/odoo/projects/${id}`,
    'PUT',
    {
      invalidateKeys: [PROJECTS_KEYS.projects, PROJECTS_KEYS.project, PROJECTS_KEYS.stats],
    },
  );
}

// ─── useCreateMilestone ────────────────────────────────────────────────────

/**
 * Create a new milestone for a project.
 * POST /odoo/projects/:projectId/milestones
 *
 * @param projectId — The project ID.
 */
export function useCreateMilestone(projectId?: string | number) {
  return useOdooMutation<OdooMilestone, CreateMilestoneDto>(
    `/odoo/projects/${projectId}/milestones`,
    'POST',
    {
      invalidateKeys: [PROJECTS_KEYS.milestones, PROJECTS_KEYS.project],
    },
  );
}

// ─── useUpdateMilestone ────────────────────────────────────────────────────

/**
 * Update an existing milestone.
 * PUT /odoo/projects/:projectId/milestones/:milestoneId
 *
 * @param projectId — The project ID.
 * @param milestoneId — The milestone ID to update.
 */
export function useUpdateMilestone(
  projectId?: string | number,
  milestoneId?: string | number,
) {
  return useOdooMutation<OdooMilestone, UpdateMilestoneDto>(
    `/odoo/projects/${projectId}/milestones/${milestoneId}`,
    'PUT',
    {
      invalidateKeys: [PROJECTS_KEYS.milestones, PROJECTS_KEYS.project],
    },
  );
}
