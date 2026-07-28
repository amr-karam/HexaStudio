'use client';

/**
 * HEXA Portal v4.0 — API Service
 *
 * Centralized data access layer for all portal pages.
 * Uses authFetch (cookie-based JWT with automatic refresh) from lib/api-client.
 * All fetchers return typed responses with descriptive error messages.
 */

import { authFetch, authenticatedFetch } from '@/lib/api-client';
import { API_BASE_URL } from '@/config/constants';
import type { DashboardData, PortalTask, PortalTeamMember, PortalProjectDetail } from './types';
import type { PortalProject, PortalInvoice } from '@/features/odoo/api';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const PORTAL_BASE = `${API_BASE_URL}/api/portal`;

/* -------------------------------------------------------------------------- */
/*  Portal API Service                                                        */
/* -------------------------------------------------------------------------- */

export const portalApi = {
  /* -------- Dashboard -------- */

  getDashboard: (): Promise<DashboardData> =>
    authFetch<DashboardData>(`${PORTAL_BASE}/dashboard`, {}, 'Failed to load dashboard data'),

  /* -------- Projects -------- */

  getProjects: (): Promise<PortalProject[]> =>
    authFetch<PortalProject[]>(`${PORTAL_BASE}/odoo/projects`, {}, 'Failed to load projects'),

  getProjectDetail: (projectId: number): Promise<PortalProjectDetail> =>
    authFetch<PortalProjectDetail>(
      `${PORTAL_BASE}/projects/${projectId}/detail`,
      {},
      'Failed to load project detail',
    ),

  getProjectTasks: (projectId: number): Promise<PortalTask[]> =>
    authFetch<PortalTask[]>(
      `${PORTAL_BASE}/projects/${projectId}/tasks`,
      {},
      'Failed to load project tasks',
    ),

  getProjectTeam: (projectId: number): Promise<PortalTeamMember[]> =>
    authFetch<PortalTeamMember[]>(
      `${PORTAL_BASE}/projects/${projectId}/team`,
      {},
      'Failed to load project team',
    ),

  /* -------- Documents -------- */

  getDocuments: (projectId: number): Promise<Response> =>
    authenticatedFetch(`${PORTAL_BASE}/projects/${projectId}/documents`),

  /* -------- Invoices -------- */

  getInvoices: (): Promise<PortalInvoice[]> =>
    authFetch<PortalInvoice[]>(`${PORTAL_BASE}/odoo/invoices`, {}, 'Failed to load invoices'),

  /* -------- Approvals -------- */

  getApprovals: (projectId: number): Promise<Response> =>
    authenticatedFetch(`${API_BASE_URL}/api/approvals/project/${projectId}`),

  /* -------- Notifications -------- */

  getNotificationPreferences: (): Promise<Record<string, boolean>> =>
    authFetch<Record<string, boolean>>(
      `${PORTAL_BASE}/notifications/preferences`,
      {},
      'Failed to load notification preferences',
    ),

  updateNotificationPreferences: (preferences: Record<string, boolean>): Promise<{ success: boolean }> =>
    authFetch<{ success: boolean }>(
      `${PORTAL_BASE}/notifications/preferences`,
      {
        method: 'PUT',
        body: JSON.stringify({ preferences }),
      },
      'Failed to save notification preferences',
    ),

  /* -------- User / Profile -------- */

  getProfile: (): Promise<{ id: string; email: string; username: string; role: string }> =>
    authFetch<{ id: string; email: string; username: string; role: string }>(
      `${API_BASE_URL}/api/users/me`,
      {},
      'Failed to load profile',
    ),

  changePassword: (currentPassword: string, newPassword: string): Promise<{ success: boolean }> =>
    authFetch<{ success: boolean }>(
      `${API_BASE_URL}/api/auth/change-password`,
      {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      },
      'Failed to change password',
    ),
};

/* -------------------------------------------------------------------------- */
/*  Fallback / Mock Data (used when API is unreachable)                       */
/* -------------------------------------------------------------------------- */

export const MOCK_PROJECTS: PortalProject[] = [
  {
    id: 1,
    name: 'Horizon Villa',
    status: 'in-progress',
    type: 'Residential',
    startDate: '2026-04-01',
    endDate: '2026-12-15',
    milestones: [
      { id: 1, name: 'Concept Design', date: '2026-04-15', completed: true, description: 'Initial mood boards and concept sketches' },
      { id: 2, name: 'Schematic Design', date: '2026-05-30', completed: true, description: 'Floor plans and elevations' },
      { id: 3, name: 'Design Development', date: '2026-07-15', completed: true, description: 'Detailed drawings and material selection' },
      { id: 4, name: '3D Modeling', date: '2026-08-30', completed: false, description: 'High-fidelity 3D model creation' },
      { id: 5, name: 'Texturing & Lighting', date: '2026-10-01', completed: false, description: 'Material application and lighting setup' },
      { id: 6, name: 'Final Rendering', date: '2026-11-15', completed: false, description: 'Final production renders' },
      { id: 7, name: 'Client Review', date: '2026-12-01', completed: false, description: 'Final presentation and approval' },
    ],
  },
];
