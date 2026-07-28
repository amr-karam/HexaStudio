// ─── HEXA Hub — Odoo Domain Types ─────────────────────────────────────────
// These types mirror the Odoo data models extended by the hexa_studio custom
// module. They are the single source of truth for all Odoo ↔ Hub data contracts.
// ───────────────────────────────────────────────────────────────────────────

// ─── Enums ─────────────────────────────────────────────────────────────────

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  DIRECT = 'direct',
  SOCIAL = 'social',
  EVENT = 'event',
}

export enum ServiceType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INTERIOR = 'interior',
  LANDSCAPE = 'landscape',
  RENOVATION = 'renovation',
}

export enum BudgetRange {
  UNDER_50K = 'under_50k',
  RANGE_50K_100K = '50k_100k',
  RANGE_100K_250K = '100k_250k',
  RANGE_250K_500K = '250k_500k',
  RANGE_500K_1M = '500k_1m',
  OVER_1M = 'over_1m',
}

export enum LeadStage {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  CONSULTATION = 'consultation',
  PROPOSAL_SENT = 'proposal_sent',
  NEGOTIATION = 'negotiation',
  WON = 'won',
  LOST = 'lost',
}

export enum ProjectType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INTERIOR = 'interior',
  LANDSCAPE = 'landscape',
}

export enum ProjectStatus {
  INQUIRY = 'inquiry',
  CONSULTATION = 'consultation',
  PROPOSAL = 'proposal',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum ProjectStage {
  CONCEPT = 'concept',
  SCHEMATIC = 'schematic',
  DETAILED_DESIGN = 'detailed_design',
  MODELING_3D = 'modeling_3d',
  TEXTURING = 'texturing',
  LIGHTING = 'lighting',
  RENDERING_STILL = 'rendering_still',
  RENDERING_PANORAMIC = 'rendering_panoramic',
  RENDERING_VR = 'rendering_vr',
  REVIEW_INTERNAL = 'review_internal',
  REVIEW_CLIENT = 'review_client',
  REVISIONS = 'revisions',
  DELIVERY_FINAL = 'delivery_final',
  ARCHIVE = 'archive',
}

export enum TaskPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
}

export enum ActivityType {
  EMAIL = 'email',
  CALL = 'call',
  MEETING = 'meeting',
  TODO = 'todo',
  NOTE = 'note',
}

export enum ActivityState {
  PLANNED = 'planned',
  TODAY = 'today',
  OVERDUE = 'overdue',
  DONE = 'done',
}

export enum InvoiceState {
  DRAFT = 'draft',
  posted = 'posted',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum QuotationState {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  CANCELLED = 'cancelled',
  SALES_ORDER = 'sales_order',
}

// ─── Odoo Pair Type ────────────────────────────────────────────────────────
// Odoo returns many-to-one fields as [id, name] tuples.
export type OdooPair = [number, string];

// ─── CRM / Leads ───────────────────────────────────────────────────────────

export interface OdooLead {
  id: number;
  name: string;
  contact_name: string;
  email_from: string;
  phone?: string;
  mobile?: string;
  description?: string;
  stage_id: OdooPair;
  user_id?: OdooPair;
  team_id?: OdooPair;
  partner_id?: OdooPair;
  planned_revenue?: number;
  probability?: number;
  date_deadline?: string;
  // HEXA custom fields
  x_hexa_source?: LeadSource;
  x_hexa_service?: ServiceType;
  x_hexa_budget?: BudgetRange;
  x_hexa_referral_code?: string;
  x_hexa_website_contact_id?: string;
  // Standard Odoo timestamps
  create_date: string;
  write_date: string;
}

export interface CreateLeadDto {
  name: string;
  contact_name: string;
  email_from: string;
  phone?: string;
  mobile?: string;
  description?: string;
  stage_id?: number;
  planned_revenue?: number;
  probability?: number;
  date_deadline?: string;
  x_hexa_source?: LeadSource;
  x_hexa_service?: ServiceType;
  x_hexa_budget?: BudgetRange;
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {}

export interface LeadPipelineStage {
  stage_id: number;
  stage_name: string;
  lead_count: number;
  total_revenue: number;
  leads: OdooLead[];
}

// ─── Contacts / Partners ───────────────────────────────────────────────────

export enum ContactType {
  PERSON = 'person',
  COMPANY = 'company',
}

export interface OdooContact {
  id: number;
  name: string;
  display_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  function?: string; // job title
  parent_id?: OdooPair; // company
  street?: string;
  street2?: string;
  city?: string;
  state_id?: OdooPair;
  zip?: string;
  country_id?: OdooPair;
  image_128?: string; // base64 avatar
  comment?: string;
  is_company: boolean;
  category_id?: OdooPair[];
  // HEXA custom fields
  x_hexa_client?: boolean;
  x_hexa_source?: LeadSource;
  x_hexa_website_user_id?: string;
  x_hexa_project_ids?: number[];
  // Standard Odoo timestamps
  create_date: string;
  write_date: string;
}

export interface CreateContactDto {
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  function?: string;
  parent_id?: number;
  street?: string;
  city?: string;
  zip?: string;
  country_id?: number;
  is_company?: boolean;
  x_hexa_client?: boolean;
  x_hexa_source?: LeadSource;
}

export interface UpdateContactDto extends Partial<CreateContactDto> {}

// ─── Companies ─────────────────────────────────────────────────────────────

export interface OdooCompany {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  street?: string;
  city?: string;
  country_id?: OdooPair;
  vat?: string; // tax ID
  image_128?: string;
}

// ─── Projects ──────────────────────────────────────────────────────────────

export interface OdooProject {
  id: number;
  name: string;
  display_name: string;
  partner_id?: OdooPair;
  user_id?: OdooPair;
  stage_id?: OdooPair;
  date_start?: string;
  date?: string; // end date
  planned_hours?: number;
  total_hours?: number;
  description?: string;
  // HEXA custom fields
  x_hexa_type?: ProjectType;
  x_hexa_status?: ProjectStatus;
  x_hexa_client_portal_active?: boolean;
  x_hexa_budget_amount?: number;
  x_hexa_milestone_ids?: number[];
  // Standard Odoo timestamps
  create_date: string;
  write_date: string;
}

export interface CreateProjectDto {
  name: string;
  partner_id?: number;
  user_id?: number;
  date_start?: string;
  date?: string;
  planned_hours?: number;
  description?: string;
  x_hexa_type?: ProjectType;
  x_hexa_status?: ProjectStatus;
  x_hexa_client_portal_active?: boolean;
  x_hexa_budget_amount?: number;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

// ─── Milestones ────────────────────────────────────────────────────────────

export interface OdooMilestone {
  id: number;
  name: string;
  date: string;
  completed: boolean;
  completed_date?: string;
  x_hexa_client_viewable: boolean;
  x_hexa_description?: string;
  x_hexa_order: number;
  project_id?: OdooPair;
}

export interface CreateMilestoneDto {
  name: string;
  date: string;
  x_hexa_client_viewable?: boolean;
  x_hexa_description?: string;
  x_hexa_order?: number;
}

export interface UpdateMilestoneDto extends Partial<CreateMilestoneDto> {}

// ─── Tasks ─────────────────────────────────────────────────────────────────

export interface OdooTask {
  id: number;
  name: string;
  description?: string;
  state: 'draft' | 'in_progress' | 'cancelled' | 'done';
  priority: TaskPriority;
  user_id?: OdooPair;
  partner_id?: OdooPair;
  project_id?: OdooPair;
  stage_id?: OdooPair;
  date_deadline?: string;
  date_assign?: string;
  date_end?: string;
  planned_hours?: number;
  effective_hours?: number;
  remaining_hours?: number;
  // HEXA custom fields
  x_hexa_status?: string;
  // Standard Odoo timestamps
  create_date: string;
  write_date: string;
}

export interface CreateTaskDto {
  name: string;
  description?: string;
  priority?: TaskPriority;
  user_id?: number;
  project_id?: number;
  stage_id?: number;
  date_deadline?: string;
  planned_hours?: number;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  state?: 'draft' | 'in_progress' | 'cancelled' | 'done';
}

// ─── Sales / Quotations ────────────────────────────────────────────────────

export interface OdooQuotation {
  id: number;
  name: string;
  partner_id: OdooPair;
  state: QuotationState;
  date_order: string;
  validity_date?: string;
  amount_total: number;
  amount_untaxed: number;
  amount_tax: number;
  currency_id: OdooPair;
  user_id?: OdooPair;
  order_line?: OdooQuotationLine[];
  note?: string;
  // Standard Odoo timestamps
  create_date: string;
  write_date: string;
}

export interface OdooQuotationLine {
  id: number;
  name: string;
  product_id?: OdooPair;
  product_uom_qty: number;
  price_unit: number;
  price_subtotal: number;
  price_tax: number;
}

export interface OdooSalesOrder {
  id: number;
  name: string;
  partner_id: OdooPair;
  state: 'draft' | 'sent' | 'sale' | 'done' | 'cancel';
  date_order: string;
  amount_total: number;
  currency_id: OdooPair;
  user_id?: OdooPair;
  order_line?: OdooQuotationLine[];
  create_date: string;
}

// ─── Invoices ──────────────────────────────────────────────────────────────

export interface OdooInvoice {
  id: number;
  name: string;
  partner_id: OdooPair;
  state: InvoiceState;
  move_type: 'out_invoice' | 'out_refund' | 'in_invoice' | 'in_refund';
  invoice_date: string;
  invoice_date_due?: string;
  amount_total: number;
  amount_untaxed: number;
  amount_tax: number;
  currency_id: OdooPair;
  payment_state?: string;
  user_id?: OdooPair;
  invoice_line_ids?: OdooInvoiceLine[];
  create_date: string;
}

export interface OdooInvoiceLine {
  id: number;
  name: string;
  product_id?: OdooPair;
  quantity: number;
  price_unit: number;
  price_subtotal: number;
}

// ─── Documents ─────────────────────────────────────────────────────────────

export interface OdooDocument {
  id: number;
  name: string;
  mimetype: string;
  filesize: number;
  create_date: string;
  partner_id?: OdooPair;
  owner_id?: OdooPair;
  folder_id?: OdooPair;
}

export interface DocumentUploadDto {
  projectId: string;
  file: Buffer;
  filename: string;
  mimetype: string;
}

// ─── Activities (mail.activity) ────────────────────────────────────────────

export interface OdooActivity {
  id: number;
  summary: string;
  note?: string;
  activity_type_id: OdooPair;
  state: ActivityState;
  user_id: OdooPair;
  date_deadline: string;
  date_done?: string;
  res_model: string; // e.g. 'crm.lead', 'project.project'
  res_id: number; // ID of the related record
  create_date: string;
}

export interface CreateActivityDto {
  summary: string;
  note?: string;
  activity_type_id: number;
  user_id: number;
  date_deadline: string;
  res_model: string;
  res_id: number;
}

export interface UpdateActivityDto {
  summary?: string;
  note?: string;
  date_deadline?: string;
}

// ─── Helpdesk ──────────────────────────────────────────────────────────────

export interface OdooHelpdeskTicket {
  id: number;
  name: string;
  description?: string;
  partner_id?: OdooPair;
  user_id?: OdooPair;
  stage_id: OdooPair;
  priority: TaskPriority;
  ticket_type_id?: OdooPair;
  date_deadline?: string;
  create_date: string;
  write_date: string;
}

// ─── Calendar ──────────────────────────────────────────────────────────────

export interface OdooCalendarEvent {
  id: number;
  name: string;
  start: string;
  stop: string;
  allday: boolean;
  description?: string;
  user_id?: OdooPair;
  partner_ids?: OdooPair[];
  location?: string;
  create_date: string;
}

// ─── Employees ─────────────────────────────────────────────────────────────

export interface OdooEmployee {
  id: number;
  name: string;
  job_id?: OdooPair;
  department_id?: OdooPair;
  work_email?: string;
  work_phone?: string;
  parent_id?: OdooPair; // manager
  coach_id?: OdooPair;
  image_128?: string;
}

// ─── Timesheets ────────────────────────────────────────────────────────────

export interface OdooTimesheet {
  id: number;
  employee_id: OdooPair;
  project_id?: OdooPair;
  task_id?: OdooPair;
  date: string;
  unit_amount: number; // hours
  name?: string;
  create_date: string;
}

// ─── Knowledge ─────────────────────────────────────────────────────────────

export interface OdooKnowledgeArticle {
  id: number;
  name: string;
  body?: string; // HTML content
  parent_id?: OdooPair;
  create_uid?: OdooPair;
  is_published: boolean;
  create_date: string;
}

// ─── Email (Mail Thread) ───────────────────────────────────────────────────

export interface OdooMailMessage {
  id: number;
  body: string;
  subject?: string;
  author_id: OdooPair;
  model?: string;
  res_id?: number;
  date: string;
  message_type: 'comment' | 'email' | 'notification' | 'user_note';
}

// ─── Webhook ───────────────────────────────────────────────────────────────

export type OdooWebhookAction = 'create' | 'update' | 'delete';

export interface OdooWebhookPayload {
  model: string;
  id: number;
  action: OdooWebhookAction;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface OdooWebhookLog {
  id: string;
  model: string;
  record_id: number;
  action: OdooWebhookAction;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payload: OdooWebhookPayload;
  error?: string;
  retry_count: number;
  created_at: string;
  processed_at?: string;
}

// ─── Sync State ────────────────────────────────────────────────────────────

export interface SyncState {
  model: string;
  last_sync_at: string;
  last_sync_id: number;
  total_synced: number;
  errors: number;
  status: 'idle' | 'syncing' | 'error';
}

// ─── Dashboard / Aggregated ────────────────────────────────────────────────

/** Stats returned by GET /odoo/sales/stats */
export interface SalesStats {
  pending_quotations: number;
  total_quotation_value: number;
  total_revenue: number;
  overdue_invoices: number;
  total_invoices: number;
}

export interface ExecutiveMetrics {
  total_revenue: number;
  active_projects: number;
  pending_approvals: number;
  open_leads: number;
  won_leads_this_month: number;
  team_efficiency: number;
  overdue_tasks: number;
  unread_messages: number;
}

export interface PipelineMetrics {
  total_leads: number;
  total_revenue: number;
  conversion_rate: number;
  average_deal_size: number;
  leads_by_stage: Record<string, number>;
  leads_by_source: Record<LeadSource, number>;
}

export interface ProjectMetrics {
  total_projects: number;
  active_projects: number;
  completed_this_month: number;
  average_completion_time: number;
  budget_utilization: number;
  projects_by_type: Record<ProjectType, number>;
}

// ─── Search ────────────────────────────────────────────────────────────────

export type SearchableModel =
  | 'crm.lead'
  | 'res.partner'
  | 'project.project'
  | 'project.task'
  | 'sale.order'
  | 'account.move'
  | 'mail.activity'
  | 'documents.document';

export interface SearchResult {
  model: SearchableModel;
  id: number;
  title: string;
  subtitle?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface GlobalSearchQuery {
  q: string;
  models?: SearchableModel[];
  limit?: number;
  offset?: number;
}

// ─── Notifications ─────────────────────────────────────────────────────────

export type NotificationChannel = 'in_app' | 'email' | 'push';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Workflows ─────────────────────────────────────────────────────────────

export type WorkflowTrigger =
  | 'lead_created'
  | 'lead_stage_changed'
  | 'lead_won'
  | 'lead_lost'
  | 'project_created'
  | 'project_stage_changed'
  | 'project_completed'
  | 'task_created'
  | 'task_completed'
  | 'invoice_created'
  | 'invoice_paid'
  | 'quotation_sent'
  | 'quotation_accepted'
  | 'milestone_completed';

export interface WorkflowRule {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  enabled: boolean;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
}

export interface WorkflowAction {
  type: 'send_notification' | 'send_email' | 'update_field' | 'create_activity' | 'assign_user';
  config: Record<string, unknown>;
}
