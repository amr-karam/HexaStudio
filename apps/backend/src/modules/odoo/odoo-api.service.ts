import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from './odoo.service';
import {
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

// OdooCompanySettings is now defined in @hexastudio/types as OdooCompany

@Injectable()
export class OdooApiService {
  private readonly logger = new Logger(OdooApiService.name);

  constructor(private readonly odooService: OdooService) {}

  async getCrmPipeline(): Promise<OdooPipelineSummary> {
    const leads = (await this.odooService.searchRead(
      'crm.lead',
      [],
      ['id', 'stage_id', 'expected_revenue'],
    )) as unknown as OdooLead[];

    const stageMap = new Map<number, { name: string; leadCount: number; expectedRevenue: number }>();
    let totalLeads = 0;
    let totalExpectedRevenue = 0;

    for (const lead of leads) {
      const stage = lead.stage_id;
      const stageId = Array.isArray(stage) ? stage[0] : 0;
      const stageName = Array.isArray(stage) ? stage[1] : 'No Stage';
      const revenue = (lead as unknown as { expected_revenue?: number }).expected_revenue ?? 0;

      const entry = stageMap.get(stageId) ?? { name: stageName, leadCount: 0, expectedRevenue: 0 };
      entry.leadCount += 1;
      entry.expectedRevenue += revenue;
      stageMap.set(stageId, entry);

      totalLeads += 1;
      totalExpectedRevenue += revenue;
    }

    return {
      stages: Array.from(stageMap.entries()).map(([id, v]) => ({ id, ...v })),
      totalLeads,
      totalExpectedRevenue,
      weightedRevenue: totalExpectedRevenue,
    };
  }

  async getLeads(limit = 50, offset = 0): Promise<OdooLead[]> {
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'crm.lead',
      'search_read',
      [[], ['name', 'partner_name', 'email_from', 'stage_id', 'priority', 'expected_revenue', 'create_date'], offset, limit, 'create_date desc'],
    )) as unknown as OdooLead[];
  }

  async getLeadDetail(id: number): Promise<OdooLead> {
    const results = await this.odooService.execute<Record<string, unknown>[]>(
      'crm.lead',
      'search_read',
      [[['id', '=', id]], ['name', 'contact_name', 'partner_name', 'email_from', 'phone', 'description', 'stage_id', 'priority', 'expected_revenue', 'create_date', 'x_hexa_source', 'x_hexa_service', 'x_hexa_budget']],
    );
    if (!results.length) throw new Error(`Lead #${id} not found`);
    return results[0] as unknown as OdooLead;
  }

  async createLead(data: Record<string, unknown>): Promise<number> {
    return this.odooService.create('crm.lead', data);
  }

  async updateLead(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.odooService.write('crm.lead', [id], data);
  }

  async archiveLead(id: number): Promise<boolean> {
    return this.odooService.write('crm.lead', [id], { active: false });
  }

  // --- Contacts / Partners ---

  async getContacts(limit = 50, offset = 0, search?: string): Promise<OdooPartner[]> {
    const domain: unknown[] = search
      ? [['name', 'ilike', search]]
      : [];
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'res.partner',
      'search_read',
      [domain, ['id', 'name', 'email', 'phone', 'x_hexa_client', 'x_hexa_source'], offset, limit, 'name asc'],
    )) as unknown as OdooPartner[];
  }

  async getContactDetail(id: number): Promise<OdooPartner> {
    const results = await this.odooService.execute<Record<string, unknown>[]>(
      'res.partner',
      'search_read',
      [[['id', '=', id]], ['id', 'name', 'email', 'phone', 'x_hexa_client', 'x_hexa_source', 'x_hexa_project_ids']],
    );
    if (!results.length) throw new Error(`Partner #${id} not found`);
    return results[0] as unknown as OdooPartner;
  }

  async createPartner(data: Record<string, unknown>): Promise<number> {
    return this.odooService.create('res.partner', data);
  }

  async updatePartner(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.odooService.write('res.partner', [id], data);
  }

  // --- Projects ---

  async getProjects(limit = 50, offset = 0): Promise<OdooProject[]> {
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'project.project',
      'search_read',
      [[], ['name', 'partner_id', 'x_slug', 'x_hexa_type', 'x_hexa_status', 'x_hexa_budget_amount', 'stage_id'], offset, limit, 'name asc'],
    )) as unknown as OdooProject[];
  }

  async getProjectDetail(id: number): Promise<OdooProject> {
    const results = await this.odooService.execute<Record<string, unknown>[]>(
      'project.project',
      'search_read',
      [[['id', '=', id]], ['name', 'partner_id', 'x_slug', 'x_hexa_type', 'x_hexa_status', 'x_hexa_budget_amount', 'x_hexa_client_portal_active', 'x_hexa_milestone_ids', 'date_start', 'date', 'stage_id']],
    );
    if (!results.length) throw new Error(`Project #${id} not found`);
    return results[0] as unknown as OdooProject;
  }

  async updateProject(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.odooService.write('project.project', [id], data);
  }

  async getProjectMilestones(projectId: number): Promise<OdooMilestone[]> {
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'project.milestone',
      'search_read',
      [[['project_id', '=', projectId]], ['id', 'name', 'date', 'completed', 'x_hexa_client_viewable', 'x_hexa_description', 'x_hexa_order'], 0, 100, 'x_hexa_order asc'],
    )) as unknown as OdooMilestone[];
  }

  async createMilestone(projectId: number, data: Record<string, unknown>): Promise<number> {
    return this.odooService.create('project.milestone', { ...data, project_id: projectId });
  }

  async updateMilestone(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.odooService.write('project.milestone', [id], data);
  }

  // --- Invoices & Sales ---

  async getInvoices(limit = 50, offset = 0): Promise<OdooInvoice[]> {
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'account.move',
      'search_read',
      [[['move_type', '=', 'out_invoice']], ['name', 'invoice_date', 'partner_id', 'amount_total', 'amount_residual', 'payment_state', 'state'], offset, limit, 'invoice_date desc'],
    )) as unknown as OdooInvoice[];
  }

  async getSalesOrders(limit = 50, offset = 0): Promise<Record<string, unknown>[]> {
    return this.odooService.execute<Record<string, unknown>[]>(
      'sale.order',
      'search_read',
      [[], ['name', 'partner_id', 'amount_total', 'state', 'date_order'], offset, limit, 'date_order desc'],
    );
  }

  async getCompanySettings(companyId?: number): Promise<OdooCompany> {
    const domain = companyId ? [['id', '=', companyId]] : [];
    const results = await this.odooService.execute<Record<string, unknown>[]>(
      'res.company',
      'search_read',
      [
        domain,
        ['id', 'name', 'street', 'street2', 'city', 'state_id', 'zip', 'country_id', 'phone', 'mobile', 'email', 'website', 'vat', 'company_registry', 'currency_id', 'logo'],
      ],
    );
    if (!results.length) throw new Error('Company not found');
    const c = results[0];
    return {
      id: c.id as number,
      name: (c.name as string) || '',
      street: (c.street as string) || undefined,
      street2: (c.street2 as string) || undefined,
      city: (c.city as string) || undefined,
      state_id: c.state_id as [number, string] | undefined,
      zip: (c.zip as string) || undefined,
      country_id: c.country_id as [number, string] | undefined,
      phone: (c.phone as string) || undefined,
      mobile: (c.mobile as string) || undefined,
      email: (c.email as string) || undefined,
      website: (c.website as string) || undefined,
      vat: (c.vat as string) || undefined,
      company_registry: (c.company_registry as string) || undefined,
      currency_id: c.currency_id as [number, string] | undefined,
      logo: (c.logo as string) || undefined,
    };
  }

  /** Manual re-sync trigger for admin use. */
  async getHealth() {
    const ok = await this.odooService.ping();
    return { odoo: ok ? 'ok' : 'error', circuit: this.odooService.getCircuitState() };
  }

  // --- Tasks ---

  async getTasks(limit = 50, offset = 0, projectId?: number): Promise<OdooTask[]> {
    const domain: unknown[] = projectId ? [['project_id', '=', projectId]] : [];
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'project.task',
      'search_read',
      [
        domain,
        ['name', 'project_id', 'milestone_id', 'user_ids', 'stage_id', 'state', 'date_deadline', 'date_assign', 'date_end', 'planned_hours', 'effective_hours', 'remaining_hours', 'x_hexa_client_viewable', 'x_hexa_priority', 'description'],
        offset,
        limit,
        'date_deadline asc',
      ],
    )) as unknown as OdooTask[];
  }

  async getTaskDetail(id: number): Promise<OdooTask> {
    const results = await this.odooService.execute<Record<string, unknown>[]>(
      'project.task',
      'search_read',
      [
        [['id', '=', id]],
        ['name', 'project_id', 'milestone_id', 'user_ids', 'stage_id', 'state', 'date_deadline', 'date_assign', 'date_end', 'planned_hours', 'effective_hours', 'remaining_hours', 'x_hexa_client_viewable', 'x_hexa_priority', 'description'],
      ],
    );
    if (!results.length) throw new Error(`Task #${id} not found`);
    return results[0] as unknown as OdooTask;
  }

  async createTask(data: Record<string, unknown>): Promise<number> {
    return this.odooService.create('project.task', data);
  }

  async updateTask(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.odooService.write('project.task', [id], data);
  }

  // --- Quotations ---

  async getQuotations(limit = 50, offset = 0, state?: string): Promise<OdooQuotation[]> {
    const domain: unknown[] = state ? [['state', '=', state]] : [];
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'sale.order',
      'search_read',
      [
        domain,
        ['name', 'partner_id', 'state', 'date_order', 'date_validity', 'amount_total', 'amount_untaxed', 'amount_tax', 'currency_id', 'user_id', 'x_hexa_project_id'],
        offset,
        limit,
        'date_order desc',
      ],
    )) as unknown as OdooQuotation[];
  }

  async getQuotationDetail(id: number): Promise<OdooQuotation> {
    const results = await this.odooService.execute<Record<string, unknown>[]>(
      'sale.order',
      'search_read',
      [
        [['id', '=', id]],
        ['name', 'partner_id', 'state', 'date_order', 'date_validity', 'amount_total', 'amount_untaxed', 'amount_tax', 'currency_id', 'user_id', 'x_hexa_project_id'],
      ],
    );
    if (!results.length) throw new Error(`Quotation #${id} not found`);
    return results[0] as unknown as OdooQuotation;
  }

  async getQuotationLines(orderId: number): Promise<Record<string, unknown>[]> {
    return this.odooService.execute<Record<string, unknown>[]>(
      'sale.order.line',
      'search_read',
      [
        [['order_id', '=', orderId]],
        ['id', 'product_id', 'name', 'product_uom_qty', 'price_unit', 'price_subtotal', 'price_tax'],
      ],
    );
  }

  async createQuotation(data: Record<string, unknown>): Promise<number> {
    return this.odooService.create('sale.order', data);
  }

  async updateQuotation(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.odooService.write('sale.order', [id], data);
  }

  // --- Activities ---

  async getActivities(limit = 50, offset = 0, resModel?: string, resId?: number): Promise<OdooActivity[]> {
    const domain: unknown[] = [];
    if (resModel) domain.push(['res_model', '=', resModel]);
    if (resId) domain.push(['res_id', '=', resId]);
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'mail.activity',
      'search_read',
      [
        domain,
        ['name', 'activity_type_id', 'summary', 'note', 'user_id', 'res_model', 'res_id', 'date_deadline', 'state', 'create_date'],
        offset,
        limit,
        'date_deadline asc',
      ],
    )) as unknown as OdooActivity[];
  }

  async createActivity(data: Record<string, unknown>): Promise<number> {
    return this.odooService.create('mail.activity', data);
  }

  async updateActivity(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.odooService.write('mail.activity', [id], data);
  }

  async completeActivity(id: number): Promise<boolean> {
    return this.odooService.execute<boolean>('mail.activity', 'action_done', [[id]]);
  }
}
