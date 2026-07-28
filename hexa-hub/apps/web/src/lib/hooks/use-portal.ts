// ─── HEXA Hub — Client Portal Hooks ────────────────────────────────────────
// React Query hooks for the Client Portal module.
// These endpoints serve client-facing data (projects, invoices, summary).
// ───────────────────────────────────────────────────────────────────────────

'use client';

import { useOdooList, useOdooItem } from './use-odoo-query';
import type {
  OdooProject,
  OdooInvoice,
  ExecutiveMetrics,
} from '@hexa-hub/types';
import type { ListParams } from './use-odoo-query';

// ─── Query Key Constants ───────────────────────────────────────────────────

const PORTAL_KEYS = {
  projects: 'portal-projects',
  invoices: 'portal-invoices',
  summary: 'portal-summary',
} as const;

// ─── usePortalProjects ──────────────────────────────────────────────────────

/**
 * Fetch projects visible to the authenticated client.
 * GET /portal/odoo/projects
 *
 * @param filters — Optional filter parameters.
 */
export function usePortalProjects(filters?: ListParams) {
  return useOdooList<OdooProject>(
    PORTAL_KEYS.projects,
    '/portal/odoo/projects',
    filters,
  );
}

// ─── usePortalProject ───────────────────────────────────────────────────────

/**
 * Fetch a single project visible to the authenticated client.
 * GET /portal/odoo/projects/:id
 *
 * @param id — The project ID.
 */
export function usePortalProject(id?: string | number) {
  return useOdooItem<OdooProject>(
    PORTAL_KEYS.projects,
    '/portal/odoo/projects',
    id,
  );
}

// ─── usePortalInvoices ──────────────────────────────────────────────────────

/**
 * Fetch invoices visible to the authenticated client.
 * GET /portal/odoo/invoices
 *
 * @param filters — Optional filter parameters.
 */
export function usePortalInvoices(filters?: ListParams) {
  return useOdooList<OdooInvoice>(
    PORTAL_KEYS.invoices,
    '/portal/odoo/invoices',
    filters,
  );
}

// ─── usePortalInvoice ───────────────────────────────────────────────────────

/**
 * Fetch a single invoice visible to the authenticated client.
 * GET /portal/odoo/invoices/:id
 *
 * @param id — The invoice ID.
 */
export function usePortalInvoice(id?: string | number) {
  return useOdooItem<OdooInvoice>(
    PORTAL_KEYS.invoices,
    '/portal/odoo/invoices',
    id,
  );
}

// ─── usePortalSummary ───────────────────────────────────────────────────────

/**
 * Fetch the client portal summary (project count, invoice totals, etc.).
 * GET /portal/odoo/summary
 */
export function usePortalSummary() {
  return useOdooItem<ExecutiveMetrics>(
    PORTAL_KEYS.summary,
    '/portal/odoo/summary',
    'summary',
  );
}
