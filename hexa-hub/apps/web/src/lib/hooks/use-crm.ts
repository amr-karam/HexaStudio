// ─── HEXA Hub — CRM Hooks ──────────────────────────────────────────────────
// React Query hooks for the CRM module (leads, pipeline, stats).
// ───────────────────────────────────────────────────────────────────────────

'use client';

import { useOdooList, useOdooItem, useOdooMutation } from './use-odoo-query';
import type {
  OdooLead,
  LeadPipelineStage,
  PipelineMetrics,
  CreateLeadDto,
  UpdateLeadDto,
} from '@hexa-hub/types';
import type { ListParams } from './use-odoo-query';

// ─── Query Key Constants ───────────────────────────────────────────────────

const CRM_KEYS = {
  pipeline: 'crm-pipeline',
  leads: 'crm-leads',
  lead: 'crm-lead',
  stats: 'crm-stats',
} as const;

// ─── useCrmPipeline ────────────────────────────────────────────────────────

/**
 * Fetch the CRM pipeline with all stages and their leads.
 * GET /odoo/crm/pipeline
 */
export function useCrmPipeline() {
  return useOdooList<LeadPipelineStage>(
    CRM_KEYS.pipeline,
    '/odoo/crm/pipeline',
  );
}

// ─── useCrmLeads ────────────────────────────────────────────────────────────

/**
 * Fetch CRM leads with optional filters (search, stage, source, etc.).
 * GET /odoo/crm/leads
 *
 * @param filters — Optional filter parameters.
 */
export function useCrmLeads(filters?: ListParams) {
  return useOdooList<OdooLead>(
    CRM_KEYS.leads,
    '/odoo/crm/leads',
    filters,
  );
}

// ─── useCrmLead ─────────────────────────────────────────────────────────────

/**
 * Fetch a single CRM lead by ID.
 * GET /odoo/crm/leads/:id
 *
 * @param id — The lead ID.
 */
export function useCrmLead(id?: string | number) {
  return useOdooItem<OdooLead>(
    CRM_KEYS.lead,
    '/odoo/crm/leads',
    id,
  );
}

// ─── useCrmStats ────────────────────────────────────────────────────────────

/**
 * Fetch CRM statistics (pipeline metrics, conversion rates, etc.).
 * GET /odoo/crm/stats
 */
export function useCrmStats() {
  return useOdooItem<PipelineMetrics>(
    CRM_KEYS.stats,
    '/odoo/crm/stats',
    'stats', // static ID to enable the query
  );
}

// ─── useCreateLead ──────────────────────────────────────────────────────────

/**
 * Create a new CRM lead.
 * POST /odoo/crm/leads
 */
export function useCreateLead() {
  return useOdooMutation<OdooLead, CreateLeadDto>(
    '/odoo/crm/leads',
    'POST',
    {
      invalidateKeys: [CRM_KEYS.leads, CRM_KEYS.pipeline, CRM_KEYS.stats],
    },
  );
}

// ─── useUpdateLead ──────────────────────────────────────────────────────────

/**
 * Update an existing CRM lead.
 * PUT /odoo/crm/leads/:id
 *
 * @param id — The lead ID to update.
 */
export function useUpdateLead(id?: string | number) {
  return useOdooMutation<OdooLead, UpdateLeadDto>(
    `/odoo/crm/leads/${id}`,
    'PUT',
    {
      invalidateKeys: [CRM_KEYS.leads, CRM_KEYS.lead, CRM_KEYS.pipeline, CRM_KEYS.stats],
    },
  );
}

// ─── useDeleteLead ──────────────────────────────────────────────────────────

/**
 * Delete a CRM lead.
 * DELETE /odoo/crm/leads/:id
 *
 * @param id — The lead ID to delete.
 */
export function useDeleteLead(id?: string | number) {
  return useOdooMutation<void, void>(
    `/odoo/crm/leads/${id}`,
    'DELETE',
    {
      invalidateKeys: [CRM_KEYS.leads, CRM_KEYS.pipeline, CRM_KEYS.stats],
    },
  );
}
