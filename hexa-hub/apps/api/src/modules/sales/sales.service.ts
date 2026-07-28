import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(private readonly odoo: OdooService) {}

  async getQuotations(query: { state?: string; partner_id?: number; search?: string; page?: number; limit?: number }) {
    const domain: unknown[] = [];
    const filterDomain: unknown[] = [];

    if (query.state) filterDomain.push(['state', '=', query.state]);
    if (query.partner_id) filterDomain.push(['partner_id', '=', query.partner_id]);
    if (query.search) {
      filterDomain.push(['|']);
      filterDomain.push(['name', 'ilike', query.search]);
    }

    const limit = query.limit || 25;
    const offset = query.page ? (query.page - 1) * limit : 0;

    const quotations = await this.odoo.getQuotations(
      filterDomain,
      ['id', 'name', 'partner_id', 'state', 'date_order', 'validity_date', 'amount_total', 'amount_untaxed', 'amount_tax', 'currency_id', 'user_id', 'create_date'],
      { limit, offset, order: 'create_date desc' },
    );

    const total = await this.odoo.searchCount('sale.order', filterDomain);
    return { data: quotations, meta: { total, page: query.page || 1, limit } };
  }

  async getQuotation(id: number) {
    const quotation = await this.odoo.getQuotation(id);
    if (!quotation) return null;

    const lines = await this.odoo.getQuotationLines(id);
    return { ...(quotation as object), order_line: lines };
  }

  async createQuotation(data: Record<string, unknown>) {
    const id = await this.odoo.createQuotation(data);
    return { id };
  }

  async updateQuotation(id: number, data: Record<string, unknown>) {
    await this.odoo.updateQuotation(id, data);
    return { id, updated: true };
  }

  async sendQuotation(id: number) {
    await this.odoo.updateQuotation(id, { state: 'sent' });
    return { id, sent: true };
  }

  async acceptQuotation(id: number) {
    await this.odoo.updateQuotation(id, { state: 'sale' });
    return { id, accepted: true };
  }

  async cancelQuotation(id: number) {
    await this.odoo.updateQuotation(id, { state: 'cancel' });
    return { id, cancelled: true };
  }

  async getQuotationLines(quotationId: number) {
    const lines = await this.odoo.getQuotationLines(quotationId);
    return { data: lines };
  }

  async getSalesOrders(query: { search?: string; page?: number; limit?: number }) {
    const domain: unknown[] = [['state', 'in', ['sale', 'done']]];

    if (query.search) {
      domain.push(['|']);
      domain.push(['name', 'ilike', query.search]);
    }

    const limit = query.limit || 25;
    const offset = query.page ? (query.page - 1) * limit : 0;

    const orders = await this.odoo.getQuotations(
      domain,
      ['id', 'name', 'partner_id', 'state', 'date_order', 'amount_total', 'currency_id', 'user_id', 'create_date'],
      { limit, offset, order: 'create_date desc' },
    );

    const total = await this.odoo.searchCount('sale.order', domain);
    return { data: orders, meta: { total, page: query.page || 1, limit } };
  }

  async getInvoices(query: { state?: string; partner_id?: number; search?: string; page?: number; limit?: number }) {
    const domain: unknown[] = [['move_type', '=', 'out_invoice']];

    if (query.state) domain.push(['state', '=', query.state]);
    if (query.partner_id) domain.push(['partner_id', '=', query.partner_id]);
    if (query.search) {
      domain.push(['|']);
      domain.push(['name', 'ilike', query.search]);
    }

    const limit = query.limit || 25;
    const offset = query.page ? (query.page - 1) * limit : 0;

    const invoices = await this.odoo.getInvoices(
      domain,
      ['id', 'name', 'partner_id', 'state', 'move_type', 'invoice_date', 'invoice_date_due', 'amount_total', 'amount_untaxed', 'amount_tax', 'currency_id', 'payment_state', 'user_id', 'create_date'],
      { limit, offset, order: 'invoice_date desc' },
    );

    const total = await this.odoo.searchCount('account.move', domain);
    return { data: invoices, meta: { total, page: query.page || 1, limit } };
  }

  async getInvoice(id: number) {
    const invoice = await this.odoo.getInvoice(id);
    if (!invoice) return null;

    const lines = await this.odoo.getInvoiceLines(id);
    return { ...(invoice as object), invoice_line_ids: lines };
  }

  async getStats() {
    const quotations = await this.odoo.getQuotations([], ['state', 'amount_total', 'create_date']);
    const invoices = await this.odoo.getInvoices([['move_type', '=', 'out_invoice']], ['state', 'amount_total', 'invoice_date_due']);

    const allQuotations = quotations as Record<string, unknown>[];
    const allInvoices = invoices as Record<string, unknown>[];

    const pendingQuotations = allQuotations.filter((q) => q.state === 'draft' || q.state === 'sent').length;
    const totalQuotationValue = allQuotations.reduce((sum, q) => sum + ((q.amount_total as number) || 0), 0);

    const paidInvoices = allInvoices.filter((i) => i.state === 'posted');
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + ((i.amount_total as number) || 0), 0);

    const now = new Date();
    const overdueInvoices = allInvoices.filter((i) => {
      if (i.state !== 'posted') return false;
      const due = new Date(i.invoice_date_due as string);
      return due < now;
    }).length;

    return {
      pending_quotations: pendingQuotations,
      total_quotation_value: totalQuotationValue,
      total_revenue: totalRevenue,
      overdue_invoices: overdueInvoices,
      total_invoices: allInvoices.length,
    };
  }
}
