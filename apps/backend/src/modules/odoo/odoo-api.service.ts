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
  OdooHelpdeskTicket,
  OdooEmployee,
  OdooTimesheet,
  OdooKnowledgeArticle,
  OdooCalendarEvent,
  OdooMailMessage,
  OdooDocument,
  OdooHubExecutiveDashboard,
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

  async getOrCreatePartner(name: string, email?: string): Promise<number> {
    if (email) {
      const existing = await this.odooService.execute<Record<string, unknown>[]>(
        'res.partner',
        'search_read',
        [[['email', '=', email]], ['id'], 0, 1],
      );
      if (existing.length) return existing[0].id as number;
    }
    return this.createPartner({ name, email });
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

  async findProjectBySlug(slug: string): Promise<OdooProject | null> {
    const results = await this.odooService.execute<Record<string, unknown>[]>(
      'project.project',
      'search_read',
      [[['x_slug', '=', slug]], ['id', 'name', 'partner_id', 'x_slug', 'x_hexa_type', 'x_hexa_status', 'x_hexa_budget_amount'], 0, 1],
    );
    return results.length ? (results[0] as unknown as OdooProject) : null;
  }

  async createProject(data: Record<string, unknown>): Promise<number> {
    return this.odooService.create('project.project', data);
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

  // --- Documents (ir.attachment) ---

  async getDocuments(limit = 50, offset = 0, resModel?: string, resId?: number): Promise<OdooDocument[]> {
    const domain: unknown[] = [];
    if (resModel) domain.push(['res_model', '=', resModel]);
    if (resId) domain.push(['res_id', '=', resId]);
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'ir.attachment',
      'search_read',
      [
        domain,
        ['name', 'mimetype', 'file_size', 'res_model', 'res_id', 'create_date', 'create_uid'],
        offset,
        limit,
        'create_date desc',
      ],
    )) as unknown as OdooDocument[];
  }

  // --- Helpdesk Tickets ---

  async getHelpdeskTickets(limit = 50, offset = 0): Promise<OdooHelpdeskTicket[]> {
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'helpdesk.ticket',
      'search_read',
      [
        [],
        ['name', 'partner_id', 'stage_id', 'user_id', 'priority', 'description', 'create_date', 'close_date'],
        offset,
        limit,
        'create_date desc',
      ],
    )) as unknown as OdooHelpdeskTicket[];
  }

  async getHelpdeskTicketDetail(id: number): Promise<OdooHelpdeskTicket> {
    const results = await this.odooService.execute<Record<string, unknown>[]>(
      'helpdesk.ticket',
      'search_read',
      [
        [['id', '=', id]],
        ['name', 'partner_id', 'stage_id', 'user_id', 'priority', 'description', 'create_date', 'close_date'],
      ],
    );
    if (!results.length) throw new Error(`Ticket #${id} not found`);
    return results[0] as unknown as OdooHelpdeskTicket;
  }

  async createHelpdeskTicket(data: Record<string, unknown>): Promise<number> {
    return this.odooService.create('helpdesk.ticket', data);
  }

  async updateHelpdeskTicket(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.odooService.write('helpdesk.ticket', [id], data);
  }

  // --- Employees / HR ---

  async getEmployees(limit = 50, offset = 0): Promise<OdooEmployee[]> {
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'hr.employee',
      'search_read',
      [
        [['active', '=', true]],
        ['name', 'work_email', 'work_phone', 'job_title', 'department_id', 'parent_id', 'user_id', 'active'],
        offset,
        limit,
        'name asc',
      ],
    )) as unknown as OdooEmployee[];
  }

  async getEmployeeDetail(id: number): Promise<OdooEmployee> {
    const results = await this.odooService.execute<Record<string, unknown>[]>(
      'hr.employee',
      'search_read',
      [
        [['id', '=', id]],
        ['name', 'work_email', 'work_phone', 'job_title', 'department_id', 'parent_id', 'user_id', 'active'],
      ],
    );
    if (!results.length) throw new Error(`Employee #${id} not found`);
    return results[0] as unknown as OdooEmployee;
  }

  // --- Timesheets ---

  async getTimesheets(limit = 50, offset = 0, projectId?: number): Promise<OdooTimesheet[]> {
    const domain: unknown[] = projectId ? [['project_id', '=', projectId]] : [];
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'account.analytic.line',
      'search_read',
      [
        domain,
        ['name', 'date', 'user_id', 'project_id', 'task_id', 'unit_amount', 'employee_id'],
        offset,
        limit,
        'date desc',
      ],
    )) as unknown as OdooTimesheet[];
  }

  async createTimesheet(data: Record<string, unknown>): Promise<number> {
    return this.odooService.create('account.analytic.line', data);
  }

  // --- Knowledge / Articles ---

  async getKnowledgeArticles(limit = 50, offset = 0): Promise<OdooKnowledgeArticle[]> {
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'knowledge.article',
      'search_read',
      [
        [],
        ['name', 'body', 'category_id', 'create_uid', 'create_date', 'write_date'],
        offset,
        limit,
        'write_date desc',
      ],
    )) as unknown as OdooKnowledgeArticle[];
  }

  async getKnowledgeArticleDetail(id: number): Promise<OdooKnowledgeArticle> {
    const results = await this.odooService.execute<Record<string, unknown>[]>(
      'knowledge.article',
      'search_read',
      [
        [['id', '=', id]],
        ['name', 'body', 'category_id', 'create_uid', 'create_date', 'write_date'],
      ],
    );
    if (!results.length) throw new Error(`Knowledge Article #${id} not found`);
    return results[0] as unknown as OdooKnowledgeArticle;
  }

  // --- Calendar Events ---

  async getCalendarEvents(limit = 50, offset = 0): Promise<OdooCalendarEvent[]> {
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'calendar.event',
      'search_read',
      [
        [],
        ['name', 'start', 'stop', 'duration', 'allday', 'partner_ids', 'user_id', 'description', 'location'],
        offset,
        limit,
        'start asc',
      ],
    )) as unknown as OdooCalendarEvent[];
  }

  async createCalendarEvent(data: Record<string, unknown>): Promise<number> {
    return this.odooService.create('calendar.event', data);
  }

  // --- Mail Messages / Communication ---

  async getMailMessages(limit = 50, offset = 0, resModel?: string, resId?: number): Promise<OdooMailMessage[]> {
    const domain: unknown[] = [];
    if (resModel) domain.push(['model', '=', resModel]);
    if (resId) domain.push(['res_id', '=', resId]);
    return (await this.odooService.execute<Record<string, unknown>[]>(
      'mail.message',
      'search_read',
      [
        domain,
        ['subject', 'body', 'date', 'email_from', 'author_id', 'model', 'res_id', 'message_type'],
        offset,
        limit,
        'date desc',
      ],
    )) as unknown as OdooMailMessage[];
  }

  async postMailMessage(data: Record<string, unknown>): Promise<number> {
    return this.odooService.create('mail.message', data);
  }

  // --- Executive Hub Dashboard Aggregator ---

  async getExecutiveDashboard(): Promise<OdooHubExecutiveDashboard> {
    try {
      const [pipeline, projects, invoices, tickets, timesheets] = await Promise.all([
        this.getCrmPipeline().catch(() => ({ totalLeads: 0, totalExpectedRevenue: 0, stages: [] })),
        this.getProjects(100).catch(() => []),
        this.getInvoices(100).catch(() => []),
        this.getHelpdeskTickets(100).catch(() => []),
        this.getTimesheets(100).catch(() => []),
      ]);

      const unpaidInvoices = invoices.filter((i) => i.payment_state !== 'paid');
      const totalUnpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + (inv.amount_residual || 0), 0);
      const activeProjects = projects.filter((p) => p.stage_id && Array.isArray(p.stage_id) && !p.stage_id[1].toLowerCase().includes('done'));
      const openTickets = tickets.filter((t) => t.stage_id && Array.isArray(t.stage_id) && !t.stage_id[1].toLowerCase().includes('solved'));
      const totalHoursLogged = timesheets.reduce((sum, ts) => sum + (ts.unit_amount || 0), 0);

      return {
        crm: {
          totalLeads: pipeline.totalLeads,
          expectedRevenue: pipeline.totalExpectedRevenue,
          pipelineStagesCount: pipeline.stages.length,
        },
        projects: {
          activeProjectsCount: activeProjects.length,
          totalProjectsCount: projects.length,
        },
        finance: {
          unpaidInvoicesCount: unpaidInvoices.length,
          totalUnpaidAmount,
        },
        helpdesk: {
          openTicketsCount: openTickets.length,
        },
        timesheets: {
          totalHoursLoggedThisMonth: totalHoursLogged,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to compute executive dashboard from Odoo', error);
      return {
        crm: { totalLeads: 0, expectedRevenue: 0, pipelineStagesCount: 0 },
        projects: { activeProjectsCount: 0, totalProjectsCount: 0 },
        finance: { unpaidInvoicesCount: 0, totalUnpaidAmount: 0 },
        helpdesk: { openTicketsCount: 0 },
        timesheets: { totalHoursLoggedThisMonth: 0 },
        timestamp: new Date().toISOString(),
      };
    }
  }
}
