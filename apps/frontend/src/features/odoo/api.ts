'use client';

import { API_BASE_URL } from '@/config/constants';
import type {
  OdooLead,
  OdooProject,
  OdooInvoice,
  OdooPipelineSummary,
  OdooPartner,
  OdooMilestone,
  OdooTask,
  OdooCompany,
  OdooQuotation,
  OdooActivity,
} from '@hexastudio/types';

export interface OdooSalesOrder {
  id: number;
  name: string;
  partner_id: [number, string] | false;
  amount_total: number;
  state: string;
  date_order: string;
}

export interface SyncState {
  lastSync: number;
  lastError?: string;
  counts: Record<string, number>;
}

export interface OdooDocumentRecord {
  id: string;
  name: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  projectId: number;
  createdAt: string;
  downloadUrl?: string;
}

export interface OdooCompanySettings {
  id: number;
  name: string;
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  vat?: string;
  registry?: string;
  currency?: string;
  logo?: string;
}

// --- Task, Quotation, Activity API types (re-exported from @hexastudio/types) ---
export type { OdooTask, OdooCompany, OdooQuotation, OdooActivity } from '@hexastudio/types';

const BASE = `${API_BASE_URL}/api/odoo`;

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Odoo API error: ${res.status}`);
  return res.json() as Promise<T>;
}

async function mutate<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Odoo API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export const odooApi = {
  // Pipeline
  getPipeline: () => request<OdooPipelineSummary>('/crm/pipeline'),

  // Leads CRUD
  getLeads: (limit = 50, offset = 0) =>
    request<OdooLead[]>(`/crm/leads?limit=${limit}&offset=${offset}`),
  getLeadDetail: (id: number) =>
    request<OdooLead>(`/crm/leads/${id}`),
  createLead: (data: Record<string, unknown>) =>
    mutate<{ id: number; success: boolean }>('/crm/leads', 'POST', data),
  updateLead: (id: number, data: Record<string, unknown>) =>
    mutate<{ success: boolean }>(`/crm/leads/${id}`, 'PATCH', data),
  archiveLead: (id: number) =>
    mutate<{ success: boolean }>(`/crm/leads/${id}`, 'DELETE'),

  // Contacts CRUD
  getContacts: (limit = 50, offset = 0, search?: string) =>
    request<OdooPartner[]>(`/contacts?limit=${limit}&offset=${offset}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  getContactDetail: (id: number) =>
    request<OdooPartner>(`/contacts/${id}`),
  createContact: (data: Record<string, unknown>) =>
    mutate<{ id: number; success: boolean }>('/contacts', 'POST', data),
  updateContact: (id: number, data: Record<string, unknown>) =>
    mutate<{ success: boolean }>(`/contacts/${id}`, 'PATCH', data),

  // Projects CRUD
  getProjects: (limit = 50, offset = 0) =>
    request<OdooProject[]>(`/projects?limit=${limit}&offset=${offset}`),
  getProjectDetail: (id: number) =>
    request<OdooProject>(`/projects/${id}`),
  updateProject: (id: number, data: Record<string, unknown>) =>
    mutate<{ success: boolean }>(`/projects/${id}`, 'PATCH', data),
  getProjectMilestones: (projectId: number) =>
    request<OdooMilestone[]>(`/projects/${projectId}/milestones`),
  createMilestone: (projectId: number, data: Record<string, unknown>) =>
    mutate<{ id: number; success: boolean }>(`/projects/${projectId}/milestones`, 'POST', data),
  updateMilestone: (id: number, data: Record<string, unknown>) =>
    mutate<{ success: boolean }>(`/milestones/${id}`, 'PATCH', data),

  // Sales & Invoices
  getSalesOrders: (limit = 50, offset = 0) =>
    request<OdooSalesOrder[]>(`/sales/orders?limit=${limit}&offset=${offset}`),
  getInvoices: (limit = 50, offset = 0) =>
    request<OdooInvoice[]>(`/invoices?limit=${limit}&offset=${offset}`),

  // Sync & Health
  getSyncState: () => request<SyncState>('/sync/state'),
  triggerSync: () => mutate<{ success: boolean }>('/sync/trigger', 'POST'),
  getHealth: () => request<{ odoo: string; circuit: string }>('/health'),

  // Documents
  getProjectDocuments: (projectId: number) =>
    request<OdooDocumentRecord[]>(`/documents/${projectId}`),
  getDocumentDownloadUrl: (documentId: string) =>
    request<{ url: string }>(`/documents/download/${documentId}`),

  // Tasks CRUD
  getTasks: (limit = 50, offset = 0, projectId?: number) =>
    request<OdooTask[]>(`/tasks?limit=${limit}&offset=${offset}${projectId ? `&projectId=${projectId}` : ''}`),
  getTaskDetail: (id: number) =>
    request<OdooTask>(`/tasks/${id}`),
  createTask: (data: Record<string, unknown>) =>
    mutate<{ id: number; success: boolean }>('/tasks', 'POST', data),
  updateTask: (id: number, data: Record<string, unknown>) =>
    mutate<{ success: boolean }>(`/tasks/${id}`, 'PATCH', data),

  // Quotations CRUD
  getQuotations: (limit = 50, offset = 0, state?: string) =>
    request<OdooQuotation[]>(`/quotations?limit=${limit}&offset=${offset}${state ? `&state=${state}` : ''}`),
  getQuotationDetail: (id: number) =>
    request<OdooQuotation>(`/quotations/${id}`),
  getQuotationLines: (id: number) =>
    request<Record<string, unknown>[]>(`/quotations/${id}/lines`),
  createQuotation: (data: Record<string, unknown>) =>
    mutate<{ id: number; success: boolean }>('/quotations', 'POST', data),
  updateQuotation: (id: number, data: Record<string, unknown>) =>
    mutate<{ success: boolean }>(`/quotations/${id}`, 'PATCH', data),

  // Activities CRUD
  getActivities: (limit = 50, offset = 0, resModel?: string, resId?: number) =>
    request<OdooActivity[]>(`/activities?limit=${limit}&offset=${offset}${resModel ? `&resModel=${encodeURIComponent(resModel)}` : ''}${resId ? `&resId=${resId}` : ''}`),
  createActivity: (data: Record<string, unknown>) =>
    mutate<{ id: number; success: boolean }>('/activities', 'POST', data),
  updateActivity: (id: number, data: Record<string, unknown>) =>
    mutate<{ success: boolean }>(`/activities/${id}`, 'PATCH', data),
  completeActivity: (id: number) =>
    mutate<{ success: boolean }>(`/activities/${id}/complete`, 'POST'),

  // Company Settings
  getCompanySettings: (companyId?: number) =>
    request<OdooCompany>(`/company/settings${companyId ? `?companyId=${companyId}` : ''}`),
  uploadDocument: async (projectId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/documents/${projectId}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json() as Promise<OdooDocumentRecord>;
  },
};

// --- Client Portal Odoo API ---
const PORTAL_BASE = `${API_BASE_URL}/api/portal`;

async function portalRequest<T>(path: string): Promise<T> {
  const res = await fetch(`${PORTAL_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Portal API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export interface PortalProject {
  id: number;
  name: string;
  status: string;
  type: string;
  startDate: string;
  endDate: string;
  milestones: PortalMilestone[];
}

export interface PortalMilestone {
  id: number;
  name: string;
  date: string;
  completed: boolean;
  description: string;
}

export interface PortalInvoice {
  id: number;
  name: string;
  date: string;
  amount: number;
  residual: number;
  paymentState: string;
  state: string;
}

export interface PortalDocumentRecord {
  id: string;
  name: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  projectId: number;
  createdAt: string;
  downloadUrl?: string;
}

export const portalOdooApi = {
  getProjects: () =>
    portalRequest<PortalProject[]>('/odoo/projects'),
  getMilestones: (projectId: number) =>
    portalRequest<PortalMilestone[]>(`/odoo/projects/${projectId}/milestones`),
  getInvoices: () =>
    portalRequest<PortalInvoice[]>('/odoo/invoices'),

  // Documents (client-scoped)
  getDocuments: (projectId: number) =>
    portalRequest<PortalDocumentRecord[]>(`/projects/${projectId}/documents`),

  uploadDocument: async (projectId: number, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);

    const res = await fetch(`${PORTAL_BASE}/projects/${projectId}/documents`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json() as Promise<PortalDocumentRecord>;
  },

  deleteDocument: async (projectId: number, documentId: string) => {
    const res = await fetch(`${PORTAL_BASE}/projects/${projectId}/documents/${documentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    return res.json() as Promise<{ success: boolean }>;
  },
};
