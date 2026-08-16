// Odoo ↔ Application type mappings.
// Mirror of the custom fields defined by the `hexa_studio` Odoo module.
// See docs/odoo/data-models.md

export type OdooIdName = [number, string] | false;

export type HexaProjectType = 'residential' | 'commercial' | 'interior';
export type HexaProjectStatus =
  | 'inquiry'
  | 'consultation'
  | 'proposal'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'archived';
export type HexaLeadSource = 'website' | 'referral' | 'direct';
export type HexaLeadService = 'residential' | 'commercial' | 'interior';
export type HexaLeadBudget =
  | 'under_50k'
  | '50k_100k'
  | '100k_500k'
  | '500k_plus';

export interface OdooLead {
  id: number;
  name: string;
  contact_name?: string;
  partner_name?: string;
  email_from?: string;
  phone?: string;
  description?: string;
  stage_id?: OdooIdName;
  priority?: string;
  create_date?: string;
  x_hexa_source?: HexaLeadSource;
  x_hexa_service?: HexaLeadService;
  x_hexa_budget?: HexaLeadBudget;
  x_hexa_referral_code?: string;
  x_hexa_website_contact_id?: string;
}

export interface OdooProject {
  id: number;
  name: string;
  partner_id?: OdooIdName;
  x_slug?: string;
  x_hexa_type?: HexaProjectType;
  x_hexa_status?: HexaProjectStatus;
  x_hexa_client_portal_active?: boolean;
  x_hexa_budget_amount?: number;
  x_hexa_milestone_ids?: number[];
  date_start?: string;
  date?: string;
  stage_id?: OdooIdName;
}

export interface OdooMilestone {
  id: number;
  name: string;
  date?: string;
  completed?: boolean;
  completed_date?: string;
  x_hexa_client_viewable?: boolean;
  x_hexa_description?: string;
  x_hexa_order?: number;
}

export interface OdooTask {
  id: number;
  name: string;
  project_id?: OdooIdName;
  milestone_id?: OdooIdName;
  user_ids?: OdooIdName[];
  stage_id?: OdooIdName;
  state?: string;
  date_deadline?: string;
  date_assign?: string;
  date_end?: string;
  planned_hours?: number;
  effective_hours?: number;
  remaining_hours?: number;
  x_hexa_client_viewable?: boolean;
  x_hexa_priority?: number;
  description?: string;
}

export interface OdooCompany {
  id: number;
  name: string;
  street?: string;
  street2?: string;
  city?: string;
  state_id?: OdooIdName;
  zip?: string;
  country_id?: OdooIdName;
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  vat?: string;
  company_registry?: string;
  currency_id?: OdooIdName;
  logo?: string;
}

export interface OdooQuotation {
  id: number;
  name: string;
  partner_id?: OdooIdName;
  state?: 'draft' | 'sent' | 'sale' | 'done' | 'cancel';
  date_order?: string;
  date_validity?: string;
  amount_total?: number;
  amount_untaxed?: number;
  amount_tax?: number;
  currency_id?: OdooIdName;
  user_id?: OdooIdName;
  x_hexa_project_id?: OdooIdName;
  order_line?: OdooQuotationLine[];
}

export interface OdooQuotationLine {
  id: number;
  product_id?: OdooIdName;
  name?: string;
  product_uom_qty?: number;
  price_unit?: number;
  price_subtotal?: number;
  price_tax?: number;
}

export interface OdooActivity {
  id: number;
  name?: string;
  activity_type_id?: OdooIdName;
  summary?: string;
  note?: string;
  user_id?: OdooIdName;
  res_model?: string;
  res_id?: number;
  date_deadline?: string;
  state?: string;
  create_date?: string;
}

export interface OdooInvoice {
  id: number;
  name: string;
  invoice_date?: string;
  invoice_origin?: string;
  partner_id?: OdooIdName;
  amount_total?: number;
  amount_residual?: number;
  amount_untaxed?: number;
  currency_id?: OdooIdName;
  state?: string;
  move_type?: string;
  payment_state?: string;
  invoice_line_ids?: OdooInvoiceLine[];
}

export interface OdooInvoiceLine {
  id: number;
  move_id?: OdooIdName;
  product_id?: OdooIdName;
  name?: string;
  quantity?: number;
  price_unit?: number;
  price_subtotal?: number;
  price_total?: number;
  tax_ids?: OdooIdName[];
  account_id?: OdooIdName;
}

export interface OdooPartner {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  x_hexa_client?: boolean;
  x_hexa_source?: HexaLeadSource;
  x_hexa_website_user_id?: number;
  x_hexa_project_ids?: number[];
}

export interface OdooUser {
  id: number;
  name: string;
  login: string;
  email: string;
  active: boolean;
}

/** Webhook payload sent by Odoo automated actions to the NestJS BFF. */
export interface OdooWebhookPayload {
  model: string;
  id: number;
  action: 'create' | 'update' | 'delete';
  data?: Record<string, unknown>;
}

/** Normalized CRM pipeline stage as rendered on the frontend. */
export interface OdooPipelineStage {
  id: number;
  name: string;
  leadCount: number;
  expectedRevenue: number;
}

export interface OdooPipelineSummary {
  stages: OdooPipelineStage[];
  totalLeads: number;
  totalExpectedRevenue: number;
  weightedRevenue: number;
}

export interface OdooHelpdeskTicket {
  id: number;
  name: string;
  partner_id?: OdooIdName;
  stage_id?: OdooIdName;
  team_id?: OdooIdName;
  user_id?: OdooIdName;
  priority?: string;
  description?: string;
  create_date?: string;
  close_date?: string;
}

export interface OdooHelpdeskTeam {
  id: number;
  name: string;
  description?: string;
  member_ids?: OdooIdName[];
  company_id?: OdooIdName;
  ticket_count?: number;
  ticketCount?: number;
  color?: number;
}

export interface OdooHelpdeskTeamDetail extends OdooHelpdeskTeam {
  recentTickets?: OdooHelpdeskTicket[];
}

export interface OdooEmployee {
  id: number;
  name: string;
  work_email?: string;
  work_phone?: string;
  job_title?: string;
  department_id?: OdooIdName;
  parent_id?: OdooIdName;
  user_id?: OdooIdName;
  active?: boolean;
}

export interface OdooTimesheet {
  id: number;
  name: string;
  date: string;
  user_id?: OdooIdName;
  project_id?: OdooIdName;
  task_id?: OdooIdName;
  unit_amount: number;
  employee_id?: OdooIdName;
}

export interface OdooKnowledgeArticle {
  id: number;
  name: string;
  body?: string;
  category_id?: OdooIdName;
  create_uid?: OdooIdName;
  create_date?: string;
  write_date?: string;
}

export interface OdooKnowledgeCategory {
  id: number;
  name: string;
  parent_id?: OdooIdName;
  child_ids?: OdooIdName[];
  article_count?: number;
  articleCount?: number;
}

export interface OdooCalendarEvent {
  id: number;
  name: string;
  start: string;
  stop: string;
  duration?: number;
  allday?: boolean;
  partner_ids?: OdooIdName[];
  user_id?: OdooIdName;
  description?: string;
  location?: string;
}

export interface OdooMailMessage {
  id: number;
  subject?: string;
  body?: string;
  date?: string;
  email_from?: string;
  author_id?: OdooIdName;
  model?: string;
  res_id?: number;
  message_type?: string;
}

export interface OdooMailNotification {
  id: number;
  mail_message_id?: OdooIdName;
  res_partner_id?: OdooIdName;
  notification_type?: string;
  notification_status?: string;
  is_read?: boolean;
  failure_type?: string;
}

export interface OdooDocument {
  id: number;
  name: string;
  mimetype?: string;
  file_size?: number;
  res_model?: string;
  res_id?: number;
  create_date?: string;
  create_uid?: OdooIdName;
}

/** Aggregated Executive Dashboard payload from Odoo SOT. */
export interface OdooHubExecutiveDashboard {
  crm: {
    totalLeads: number;
    expectedRevenue: number;
    pipelineStagesCount: number;
  };
  projects: {
    activeProjectsCount: number;
    totalProjectsCount: number;
  };
  finance: {
    unpaidInvoicesCount: number;
    totalUnpaidAmount: number;
  };
  helpdesk: {
    openTicketsCount: number;
  };
  timesheets: {
    totalHoursLoggedThisMonth: number;
  };
  timestamp: string;
}

// ─── Sales Teams (crm.team) ─────────────────────────────────────────────────

export interface OdooSalesTeam {
  id: number;
  name: string;
  user_id?: OdooIdName;
  member_ids?: OdooIdName[];
  company_id?: OdooIdName;
  use_quotations?: boolean;
  use_invoices?: boolean;
  use_leads?: boolean;
  resource_emoji?: string;
  color?: number;
  /** Pipeline lead count computed from crm.lead */
  leadCount?: number;
  /** Expected revenue computed from crm.lead */
  expectedRevenue?: number;
}

export interface OdooSalesTeamDetail extends OdooSalesTeam {
  /** Recent leads associated with this team */
  recentLeads?: OdooLead[];
  /** Recent quotations associated with this team */
  recentQuotations?: OdooQuotation[];
}

// ─── HR Departments (hr.department) ─────────────────────────────────────────

export interface OdooDepartment {
  id: number;
  name: string;
  complete_name?: string;
  parent_id?: OdooIdName;
  child_ids?: OdooIdName[];
  manager_id?: OdooIdName;
  company_id?: OdooIdName;
  /** Number of active employees in the department */
  employeeCount?: number;
  /** Total planned budget */
  budget?: number;
}

export interface OdooDepartmentDetail extends OdooDepartment {
  /** Employees belonging to this department */
  employees?: OdooEmployee[];
}

// ─── Finance / Accounting (account.move, account.payment, account.journal) ──

export interface OdooJournalEntry {
  id: number;
  name: string;
  date: string;
  ref?: string;
  journal_id?: OdooIdName;
  company_id?: OdooIdName;
  state?: string;
  move_type?: string;
  currency_id?: OdooIdName;
  amount_total?: number;
  line_ids?: OdooJournalItem[];
}

export interface OdooJournalItem {
  id: number;
  name?: string;
  account_id?: OdooIdName;
  debit?: number;
  credit?: number;
  balance?: number;
  partner_id?: OdooIdName;
  currency_id?: OdooIdName;
  amount_currency?: number;
}

export interface OdooAccountJournal {
  id: number;
  name: string;
  code?: string;
  type?: string;
  currency_id?: OdooIdName;
  company_id?: OdooIdName;
  active?: boolean;
}

export interface OdooBankStatement {
  id: number;
  name: string;
  date?: string;
  journal_id?: OdooIdName;
  balance_start?: number;
  balance_end_real?: number;
  state?: string;
  company_id?: OdooIdName;
}

export interface OdooPayment {
  id: number;
  name: string;
  date: string;
  state?: string;
  payment_type?: 'inbound' | 'outbound' | 'transfer';
  partner_id?: OdooIdName;
  amount?: number;
  currency_id?: OdooIdName;
  journal_id?: OdooIdName;
  payment_method_line_id?: OdooIdName;
  ref?: string;
  move_id?: OdooIdName;
}

export interface OdooBankAccount {
  id: number;
  name: string;
  account_number?: string;
  bank_id?: OdooIdName;
  account_id?: OdooIdName;
  company_id?: OdooIdName;
  currency_id?: OdooIdName;
  balance?: number;
  /** Account code if available */
  code?: string;
}

export interface OdooSendEmailData {
  to: string;
  subject: string;
  body: string;
  partnerIds?: number[];
}

// ─── Sync Engine Types ──────────────────────────────────────────────────────

/** Supported conflict resolution strategies. */
export type ConflictResolutionStrategy =
  | 'last-write-wins'
  | 'odoo-wins'
  | 'hexa-wins'
  | 'manual';

/** Final disposition of a conflict after resolution. */
export type ConflictResolution =
  | 'odoo-wins'
  | 'hexa-wins'
  | 'merged'
  | 'pending';

/** An entity type that the sync engine manages. */
export type SyncEntityType =
  | 'crm.lead'
  | 'project.project'
  | 'account.move'
  | 'project.task'
  | 'res.partner';

/**
 * A detected sync conflict between Odoo and HEXA Hub.
 *
 * Conflicts arise when both sides modify the same record between sync cycles.
 * Each conflict records both versions so a resolution strategy can be applied.
 */
export interface SyncConflict {
  /** UUID of the conflict record. */
  id: string;
  /** Odoo model name (e.g. `crm.lead`). */
  entityType: SyncEntityType | string;
  /** Odoo record ID. */
  entityId: number;
  /** The record as fetched from Odoo. */
  odooVersion: Record<string, unknown>;
  /** The record as cached in HEXA Hub. */
  hexaVersion: Record<string, unknown>;
  /** ISO 8601 timestamp when the conflict was detected. */
  detectedAt: string;
  /** Current resolution status — `pending` until resolved. */
  resolution: ConflictResolution;
  /** ISO 8601 timestamp when the conflict was resolved (if resolved). */
  resolvedAt?: string;
  /** User ID or `'system'` of whoever resolved the conflict. */
  resolvedBy?: string;
  /** Fields that differ between the two versions. */
  conflictingFields?: string[];
}

/**
 * Sync cursor persisted per entity type in Redis.
 *
 * Tracks the last successful delta sync so we can fetch only modified
 * records in subsequent cycles.
 */
export interface SyncCursor {
  /** Odoo model name. */
  entityType: string;
  /** ISO 8601 timestamp of the last successful sync run. */
  lastSyncAt: string;
  /** Highest Odoo record ID processed in the last sync. */
  lastSyncId: number;
  /** Number of records synced in the last run. */
  recordsSynced: number;
  /** Number of errors encountered in the last run. */
  errors: number;
}

/** Aggregated metrics for a single entity type. */
export interface SyncEntityMetrics {
  entityType: string;
  /** Total records synced across all runs. */
  totalSynced: number;
  /** Total errors across all runs. */
  totalErrors: number;
  /** Average sync duration in ms (rolling). */
  avgDurationMs: number;
  /** Number of conflicts detected for this entity. */
  conflictsDetected: number;
  /** Number of conflicts resolved for this entity. */
  conflictsResolved: number;
}

/** High-level sync status returned by the status endpoint. */
export interface SyncStatusResponse {
  /** Overall system state. */
  state: 'healthy' | 'degraded' | 'error';
  /** ISO 8601 timestamp of the last successful full sync. */
  lastFullSyncAt: string | null;
  /** Per-entity metrics. */
  entities: SyncEntityMetrics[];
  /** Circuit breaker state. */
  circuitBreaker: string;
  /** Number of unresolved conflicts. */
  pendingConflicts: number;
  /** ISO 8601 timestamp of when this status was generated. */
  generatedAt: string;
}

/** Result of a single sync operation. */
export interface SyncOperationResult {
  entityType: string;
  recordsProcessed: number;
  conflictsDetected: number;
  durationMs: number;
  success: boolean;
  error?: string;
}

/** Manual conflict resolution request body. */
export interface ResolveConflictDto {
  strategy: 'odoo-wins' | 'hexa-wins' | 'merged';
  /** Required only for `'merged'` — the merged field values. */
  mergedValues?: Record<string, unknown>;
  /** User who is resolving the conflict. */
  resolvedBy: string;
}

/** Manual sync trigger request body. */
export interface TriggerSyncDto {
  /** Specific entity type to sync. If omitted, syncs all. */
  entityType?: SyncEntityType | string;
  /** Force a full sync instead of delta. Defaults to `false`. */
  fullSync?: boolean;
}

/** Per-operation sync metric entry logged after each sync run. */
export interface SyncMetricEntry {
  /** Operation identifier (e.g. `delta-sync:crm.lead`). */
  operation: string;
  /** Whether the operation succeeded. */
  success: boolean;
  /** Duration of the operation in milliseconds. */
  durationMs: number;
  /** ISO 8601 timestamp of when the operation ran. */
  timestamp: string;
  /** Error message if the operation failed. */
  error?: string;
}

/** Audit entry recorded for every conflict resolution. */
export interface ConflictAuditEntry {
  /** UUID of the resolved conflict. */
  conflictId: string;
  /** Odoo model name (e.g. `crm.lead`). */
  entityType: string;
  /** Odoo record ID. */
  entityId: number;
  /** Resolution strategy that was applied. */
  strategy: ConflictResolutionStrategy | 'merged';
  /** Final disposition of the conflict. */
  resolution: ConflictResolution;
  /** User ID or `system` who resolved the conflict. */
  resolvedBy: string;
  /** ISO 8601 timestamp when the conflict was resolved. */
  resolvedAt: string;
  /** Fields that were in conflict. */
  conflictingFields: string[];
}
