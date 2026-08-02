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
  OdooSalesTeam,
  OdooSalesTeamDetail,
  OdooDepartment,
  OdooDepartmentDetail,
  OdooJournalEntry,
  OdooPayment,
  OdooBankAccount,
  OdooKnowledgeArticle,
  OdooMailMessage,
  OdooHubExecutiveDashboard,
  OdooSendEmailData,
  SyncStatusResponse,
  SyncMetricEntry,
  SyncConflict,
  ConflictAuditEntry,
  SyncCursor,
  SyncOperationResult,
  TriggerSyncDto,
  ResolveConflictDto,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  ExecuteWorkflowDto,
  WorkflowDefinition,
  WorkflowExecution,
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
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  } catch {
    throw new Error(`Odoo API error: network failure`);
  }
  if (!res.ok) throw new Error(`Odoo API error: ${res.status}`);
  return res.json() as Promise<T>;
}

async function mutate<T>(path: string, method: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`Odoo API error: network failure`);
  }
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
    let res: Response;
    try {
      res = await fetch(`${BASE}/documents/${projectId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
    } catch {
      throw new Error(`Upload failed: network error`);
    }
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json() as Promise<OdooDocumentRecord>;
  },

  // Sales Teams
  getSalesTeams: (userId?: number) =>
    request<OdooSalesTeam[]>(`/sales-teams${userId ? `?userId=${userId}` : ''}`),
  getSalesTeamDetail: (id: number) =>
    request<OdooSalesTeamDetail>(`/sales-teams/${id}`),

  // HR Departments
  getDepartments: () => request<OdooDepartment[]>('/departments'),
  getDepartmentDetail: (id: number) =>
    request<OdooDepartmentDetail>(`/departments/${id}`),

  // Accounting (read-only)
  getJournalEntries: (dateFrom?: string, dateTo?: string, limit = 50, offset = 0) =>
    request<OdooJournalEntry[]>(`/accounting/journal-entries?limit=${limit}&offset=${offset}${dateFrom ? `&dateFrom=${encodeURIComponent(dateFrom)}` : ''}${dateTo ? `&dateTo=${encodeURIComponent(dateTo)}` : ''}`),
  getPayments: (dateFrom?: string, dateTo?: string, limit = 50, offset = 0) =>
    request<OdooPayment[]>(`/accounting/payments?limit=${limit}&offset=${offset}${dateFrom ? `&dateFrom=${encodeURIComponent(dateFrom)}` : ''}${dateTo ? `&dateTo=${encodeURIComponent(dateTo)}` : ''}`),
  getBanks: (limit = 50, offset = 0) =>
    request<OdooBankAccount[]>(`/accounting/banks?limit=${limit}&offset=${offset}`),

  // Knowledge Articles (read + write)
  getKnowledgeArticles: (limit = 50, offset = 0) =>
    request<OdooKnowledgeArticle[]>(`/knowledge/articles?limit=${limit}&offset=${offset}`),
  getKnowledgeArticleDetail: (id: number) =>
    request<OdooKnowledgeArticle>(`/knowledge/articles/${id}`),
  createKnowledgeArticle: (data: { name: string; body?: string; category_id?: number }) =>
    mutate<{ id: number; success: boolean }>('/knowledge', 'POST', data),
  updateKnowledgeArticle: (id: number, data: { name?: string; body?: string; category_id?: number }) =>
    mutate<{ success: boolean }>(`/knowledge/${id}`, 'PATCH', data),
  archiveKnowledgeArticle: (id: number) =>
    mutate<{ success: boolean }>(`/knowledge/${id}`, 'DELETE'),

  // Email Integration (mail.mail)
  getEmails: (filter: 'inbox' | 'sent' | 'all' = 'all', limit = 50, offset = 0) =>
    request<OdooMailMessage[]>(`/emails?filter=${filter}&limit=${limit}&offset=${offset}`),
  getEmailDetail: (id: number) =>
    request<OdooMailMessage>(`/emails/${id}`),
  sendEmail: (data: OdooSendEmailData) =>
    mutate<{ id: number; success: boolean }>('/emails', 'POST', data),

  // Executive Dashboard (aggregated SOT payload)
  getExecutiveDashboard: () =>
    request<OdooHubExecutiveDashboard>('/dashboard/executive'),
};

// --- Odoo Sync Engine API (base /api/odoo/sync) ---
export const odooSyncApi = {
  // Trigger a sync (all entities, or a single one; optional full sync)
  triggerSync: (dto: TriggerSyncDto) =>
    mutate<{ success: boolean; results: SyncOperationResult[] }>('/sync/trigger', 'POST', dto),

  // Status & metrics
  getStatus: () => request<SyncStatusResponse>('/sync/status'),
  getMetrics: (limit = 50) =>
    request<SyncMetricEntry[]>(`/sync/metrics?limit=${limit}`),

  // Conflicts
  getConflicts: () => request<SyncConflict[]>('/sync/conflicts'),
  getAllConflicts: (limit = 100) =>
    request<SyncConflict[]>(`/sync/conflicts/all?limit=${limit}`),
  getConflictAudit: (limit = 50) =>
    request<ConflictAuditEntry[]>(`/sync/conflicts/audit?limit=${limit}`),
  resolveConflict: (id: string, dto: ResolveConflictDto) =>
    mutate<{ success: boolean; conflict: SyncConflict }>(`/sync/conflicts/${id}/resolve`, 'POST', dto),

  // Delta sync cursors
  getCursors: () => request<Record<string, SyncCursor>>('/sync/cursors'),
  resetCursor: (entityType: string) =>
    mutate<{ success: boolean; message: string }>(`/sync/cursors/${encodeURIComponent(entityType)}/reset`, 'POST'),
};

// --- Workflow Engine API (base /api/workflows) ---
const WORKFLOW_BASE = `${API_BASE_URL}/api/workflows`;

async function workflowRequest<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${WORKFLOW_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  } catch {
    throw new Error(`Workflow API error: network failure`);
  }
  if (!res.ok) throw new Error(`Workflow API error: ${res.status}`);
  return res.json() as Promise<T>;
}

async function workflowMutate<T>(path: string, method: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${WORKFLOW_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`Workflow API error: network failure`);
  }
  if (!res.ok) throw new Error(`Workflow API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export const workflowApi = {
  // Workflow definitions
  list: () => workflowRequest<WorkflowDefinition[]>(''),
  get: (id: string) => workflowRequest<WorkflowDefinition>(`/${id}`),
  create: (dto: CreateWorkflowDto) => workflowMutate<WorkflowDefinition>('', 'POST', dto),
  update: (id: string, dto: UpdateWorkflowDto) => workflowMutate<WorkflowDefinition>(`/${id}`, 'PUT', dto),
  remove: (id: string) => workflowMutate<{ success: boolean }>(`/${id}`, 'DELETE'),

  // Executions
  execute: (id: string, dto: ExecuteWorkflowDto = {}) =>
    workflowMutate<WorkflowExecution>(`/${id}/execute`, 'POST', dto),
  listExecutions: (workflowId?: string, limit = 50) =>
    workflowRequest<WorkflowExecution[]>(`/executions?limit=${limit}${workflowId ? `&workflowId=${workflowId}` : ''}`),
  getExecution: (id: string) => workflowRequest<WorkflowExecution>(`/executions/${id}`),
};

// --- Client Portal Odoo API ---
const PORTAL_BASE = `${API_BASE_URL}/api/portal`;

async function portalRequest<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${PORTAL_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  } catch {
    throw new Error(`Portal API error: network failure`);
  }
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

    let res: Response;
    try {
      res = await fetch(`${PORTAL_BASE}/projects/${projectId}/documents`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
    } catch {
      throw new Error(`Upload failed: network error`);
    }
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json() as Promise<PortalDocumentRecord>;
  },

  deleteDocument: async (projectId: number, documentId: string) => {
    let res: Response;
    try {
      res = await fetch(`${PORTAL_BASE}/projects/${projectId}/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch {
      throw new Error(`Delete failed: network error`);
    }
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    return res.json() as Promise<{ success: boolean }>;
  },
};
