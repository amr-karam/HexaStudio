// Odoo ↔ Application type mappings.
// Mirror of the custom fields defined by the `hexa_studio` Odoo module.
// See HEXA-Vision-Playbook/09-ODOO/data-models.md

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
  stage_id?: OdooIdName;
  state?: string;
  date_deadline?: string;
  x_hexa_client_viewable?: boolean;
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
