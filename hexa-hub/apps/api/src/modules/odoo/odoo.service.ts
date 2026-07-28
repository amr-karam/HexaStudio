import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface OdooSearchOptions {
  limit?: number;
  offset?: number;
  order?: string;
}

export interface OdooRpcResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

@Injectable()
export class OdooService {
  private readonly logger = new Logger(OdooService.name);
  private readonly baseUrl: string;
  private readonly db: string;
  private readonly login: string;
  private readonly password: string;
  private readonly webhookSecret: string;
  private sessionId: string | null = null;
  private uid: number | null = null;
  private sessionExpiry = 0;
  private readonly http: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('ODOO_URL') || 'http://odoo.hexastudio.net';
    this.db = this.configService.get<string>('ODOO_DB') || 'odoo';
    this.login = this.configService.get<string>('ODOO_LOGIN') || 'admin';
    this.password = this.configService.get<string>('ODOO_PASSWORD') || 'admin';
    this.webhookSecret = this.configService.get<string>('ODOO_WEBHOOK_SECRET') || '';

    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ─── Authentication ─────────────────────────────────────────────────────

  private async authenticate(): Promise<void> {
    try {
      const response = await this.http.post('/jsonrpc', {
        jsonrpc: '2.0',
        method: 'call',
        params: [this.db, this.login, this.password, 'auth', {}],
        id: Math.floor(Math.random() * 1000),
      });

      if (response.data.error) {
        throw new Error(response.data.error.data?.message || response.data.error.message);
      }

      this.uid = response.data.result;
      this.sessionId = `session_id=${response.data.result}`;
      this.sessionExpiry = Date.now() + 30 * 60 * 1000; // 30 min
      this.logger.log(`Odoo session established (uid: ${this.uid})`);
    } catch (error) {
      this.logger.error(`Odoo authentication failed: ${error.message}`);
      throw error;
    }
  }

  private async ensureSession(): Promise<void> {
    if (!this.sessionId || Date.now() >= this.sessionExpiry) {
      await this.authenticate();
    }
  }

  // ─── Core RPC ───────────────────────────────────────────────────────────

  private async jsonRpc(method: string, args: unknown[], retries = 3): Promise<unknown> {
    await this.ensureSession();

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.http.post('/jsonrpc', {
          jsonrpc: '2.0',
          method: 'call',
          params: [this.db, this.uid, this.password, method, ...args],
          id: Math.floor(Math.random() * 1000),
        }, {
          headers: this.sessionId ? { Cookie: this.sessionId } : {},
        });

        if (response.data.error) {
          const errMsg = response.data.error.data?.message || response.data.error.message || 'Unknown RPC error';
          // Session expired → re-authenticate and retry once
          if (errMsg.includes('Session') && attempt < retries) {
            this.sessionId = null;
            await this.ensureSession();
            continue;
          }
          throw new Error(errMsg);
        }

        return response.data.result;
      } catch (error) {
        if (attempt === retries) {
          this.logger.error(`Odoo RPC failed after ${retries} attempts [${method}]: ${error.message}`);
          throw error;
        }
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        this.logger.warn(`Odoo RPC retry ${attempt}/${retries} for [${method}] in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  // ─── Generic CRUD ───────────────────────────────────────────────────────

  async searchRead(model: string, domain: unknown[] = [], fields: string[] = [], options: OdooSearchOptions = {}): Promise<unknown[]> {
    const kwargs: Record<string, unknown> = {};
    if (fields.length) kwargs.fields = fields;
    if (options.limit) kwargs.limit = options.limit;
    if (options.offset) kwargs.offset = options.offset;
    if (options.order) kwargs.order = options.order;

    return this.jsonRpc('object', [model, 'search_read', domain, kwargs]) as Promise<unknown[]>;
  }

  async create(model: string, data: Record<string, unknown>): Promise<number> {
    return this.jsonRpc('object', [model, 'create', [data]]) as Promise<number>;
  }

  async write(model: string, id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.jsonRpc('object', [model, 'write', [[id], data]]) as Promise<boolean>;
  }

  async read(model: string, ids: number[], fields?: string[]): Promise<unknown[]> {
    const args = fields ? [ids, fields] : [ids];
    return this.jsonRpc('object', [model, 'read', ...args]) as Promise<unknown[]>;
  }

  async unlink(model: string, id: number): Promise<boolean> {
    return this.jsonRpc('object', [model, 'unlink', [[id]]]) as Promise<boolean>;
  }

  async search(model: string, domain: unknown[] = [], options: OdooSearchOptions = {}): Promise<number[]> {
    const kwargs: Record<string, unknown> = {};
    if (options.limit) kwargs.limit = options.limit;
    if (options.offset) kwargs.offset = options.offset;
    if (options.order) kwargs.order = options.order;

    return this.jsonRpc('object', [model, 'search', domain, kwargs]) as Promise<number[]>;
  }

  async searchCount(model: string, domain: unknown[] = []): Promise<number> {
    return this.jsonRpc('object', [model, 'search_count', [domain]]) as Promise<number>;
  }

  async getModelFields(model: string): Promise<Record<string, unknown>> {
    return this.jsonRpc('object', [model, 'fields_get', [], { attributes: ['string', 'type', 'help'] }]) as Promise<Record<string, unknown>>;
  }

  // ─── CRM / Leads ────────────────────────────────────────────────────────

  async getLeads(domain: unknown[] = [], fields: string[] = [], options: OdooSearchOptions = {}): Promise<unknown[]> {
    return this.searchRead('crm.lead', domain, fields, options);
  }

  async getLead(id: number): Promise<unknown | null> {
    const results = await this.read('crm.lead', [id]);
    return results?.[0] || null;
  }

  async createLead(data: Record<string, unknown>): Promise<number> {
    return this.create('crm.lead', data);
  }

  async updateLead(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.write('crm.lead', id, data);
  }

  async deleteLead(id: number): Promise<boolean> {
    return this.unlink('crm.lead', id);
  }

  async getLeadStageCounts(): Promise<unknown> {
    const ids = await this.search('crm.lead', []);
    const leads = await this.searchRead('crm.lead', [], ['id', 'stage_id', 'planned_revenue', 'name', 'contact_name', 'email_from', 'phone', 'x_hexa_source', 'x_hexa_service', 'x_hexa_budget']);
    return leads;
  }

  // ─── Contacts / Partners ────────────────────────────────────────────────

  async getContacts(domain: unknown[] = [], fields: string[] = [], options: OdooSearchOptions = {}): Promise<unknown[]> {
    return this.searchRead('res.partner', domain, fields, options);
  }

  async getContact(id: number): Promise<unknown | null> {
    const results = await this.read('res.partner', [id]);
    return results?.[0] || null;
  }

  async createContact(data: Record<string, unknown>): Promise<number> {
    return this.create('res.partner', data);
  }

  async updateContact(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.write('res.partner', id, data);
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.unlink('res.partner', id);
  }

  // ─── Projects ───────────────────────────────────────────────────────────

  async getProjects(domain: unknown[] = [], fields: string[] = [], options: OdooSearchOptions = {}): Promise<unknown[]> {
    return this.searchRead('project.project', domain, fields, options);
  }

  async getProject(id: number): Promise<unknown | null> {
    const results = await this.read('project.project', [id]);
    return results?.[0] || null;
  }

  async createProject(data: Record<string, unknown>): Promise<number> {
    return this.create('project.project', data);
  }

  async updateProject(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.write('project.project', id, data);
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.unlink('project.project', id);
  }

  // ─── Milestones ─────────────────────────────────────────────────────────

  async getMilestones(projectId?: number): Promise<unknown[]> {
    const domain = projectId ? [['project_id', '=', projectId]] : [];
    return this.searchRead('project.milestone', domain, ['name', 'date', 'completed', 'completed_date', 'x_hexa_client_viewable', 'x_hexa_description', 'x_hexa_order', 'project_id']);
  }

  async getMilestone(id: number): Promise<unknown | null> {
    const results = await this.read('project.milestone', [id]);
    return results?.[0] || null;
  }

  async createMilestone(data: Record<string, unknown>): Promise<number> {
    return this.create('project.milestone', data);
  }

  async updateMilestone(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.write('project.milestone', id, data);
  }

  // ─── Tasks ──────────────────────────────────────────────────────────────

  async getTasks(domain: unknown[] = [], fields: string[] = [], options: OdooSearchOptions = {}): Promise<unknown[]> {
    return this.searchRead('project.task', domain, fields, options);
  }

  async getTask(id: number): Promise<unknown | null> {
    const results = await this.read('project.task', [id]);
    return results?.[0] || null;
  }

  async createTask(data: Record<string, unknown>): Promise<number> {
    return this.create('project.task', data);
  }

  async updateTask(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.write('project.task', id, data);
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.unlink('project.task', id);
  }

  // ─── Sales / Quotations ────────────────────────────────────────────────

  async getQuotations(domain: unknown[] = [], fields: string[] = [], options: OdooSearchOptions = {}): Promise<unknown[]> {
    return this.searchRead('sale.order', domain, fields, options);
  }

  async getQuotation(id: number): Promise<unknown | null> {
    const results = await this.read('sale.order', [id]);
    return results?.[0] || null;
  }

  async createQuotation(data: Record<string, unknown>): Promise<number> {
    return this.create('sale.order', data);
  }

  async updateQuotation(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.write('sale.order', id, data);
  }

  async getQuotationLines(quotationId: number): Promise<unknown[]> {
    return this.searchRead('sale.order.line', [['order_id', '=', quotationId]]);
  }

  // ─── Invoices ───────────────────────────────────────────────────────────

  async getInvoices(domain: unknown[] = [], fields: string[] = [], options: OdooSearchOptions = {}): Promise<unknown[]> {
    return this.searchRead('account.move', domain, fields, options);
  }

  async getInvoice(id: number): Promise<unknown | null> {
    const results = await this.read('account.move', [id]);
    return results?.[0] || null;
  }

  async getInvoiceLines(invoiceId: number): Promise<unknown[]> {
    return this.searchRead('account.move.line', [['move_id', '=', invoiceId]]);
  }

  // ─── Activities ─────────────────────────────────────────────────────────

  async getActivities(domain: unknown[] = [], fields: string[] = [], options: OdooSearchOptions = {}): Promise<unknown[]> {
    return this.searchRead('mail.activity', domain, fields, options);
  }

  async createActivity(data: Record<string, unknown>): Promise<number> {
    return this.create('mail.activity', data);
  }

  async updateActivity(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.write('mail.activity', id, data);
  }

  async completeActivity(id: number): Promise<boolean> {
    await this.jsonRpc('object', ['mail.activity', 'action_done', [[id]]]);
    return true;
  }

  async deleteActivity(id: number): Promise<boolean> {
    return this.unlink('mail.activity', id);
  }

  // ─── Employees ──────────────────────────────────────────────────────────

  async getEmployees(domain: unknown[] = [], fields: string[] = []): Promise<unknown[]> {
    return this.searchRead('hr.employee', domain, fields);
  }

  // ─── Documents ──────────────────────────────────────────────────────────

  async getDocuments(domain: unknown[] = [], fields: string[] = [], options: OdooSearchOptions = {}): Promise<unknown[]> {
    return this.searchRead('documents.document', domain, fields, options);
  }

  // ─── Helpdesk ───────────────────────────────────────────────────────────

  async getHelpdeskTickets(domain: unknown[] = [], fields: string[] = [], options: OdooSearchOptions = {}): Promise<unknown[]> {
    return this.searchRead('helpdesk.ticket', domain, fields, options);
  }

  // ─── Calendar ───────────────────────────────────────────────────────────

  async getCalendarEvents(domain: unknown[] = [], fields: string[] = [], options: OdooSearchOptions = {}): Promise<unknown[]> {
    return this.searchRead('calendar.event', domain, fields, options);
  }

  // ─── Knowledge ──────────────────────────────────────────────────────────

  async getKnowledgeArticles(domain: unknown[] = [], fields: string[] = [], options: OdooSearchOptions = {}): Promise<unknown[]> {
    return this.searchRead('knowledge.article', domain, fields, options);
  }

  // ─── Mail Messages ──────────────────────────────────────────────────────

  async getMailMessages(model: string, resId: number): Promise<unknown[]> {
    return this.searchRead('mail.message', [
      ['model', '=', model],
      ['res_id', '=', resId],
    ], ['body', 'subject', 'author_id', 'date', 'message_type']);
  }

  // ─── Webhook Verification ───────────────────────────────────────────────

  verifyWebhookSignature(body: string, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('ODOO_WEBHOOK_SECRET not configured — skipping verification');
      return true;
    }

    const crypto = require('crypto');
    const expected = crypto.createHmac('sha256', this.webhookSecret).update(body).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }
}
