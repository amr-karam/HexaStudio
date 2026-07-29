import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class HelpdeskService {
  private readonly logger = new Logger(HelpdeskService.name);
  constructor(private readonly odoo: OdooService) {}

  async getTickets(query: { page?: number; limit?: number; state?: string; priority?: string; search?: string }) {
    const domain: unknown[] = [];
    if (query.state) domain.push(['stage_id', '=', query.state]);
    if (query.priority) domain.push(['priority', '=', query.priority]);
    if (query.search) { domain.push('|'); domain.push(['name', 'ilike', query.search]); }
    const limit = query.limit || 20;
    const offset = query.page ? (query.page - 1) * limit : 0;
    const [tickets, total] = await Promise.all([
      this.odoo.getHelpdeskTickets(domain, ['id', 'name', 'partner_id', 'user_id', 'stage_id', 'priority', 'description', 'create_date'], { limit, offset, order: 'create_date desc' }),
      this.odoo.searchCount('helpdesk.ticket', domain),
    ]);
    return { data: tickets, meta: { total, page: query.page || 1, limit } };
  }

  async getTicket(id: number) {
    return this.odoo.read('helpdesk.ticket', [id], ['id', 'name', 'partner_id', 'user_id', 'stage_id', 'priority', 'description', 'create_date']);
  }

  async createTicket(data: Record<string, unknown>) {
    const id = await this.odoo.create('helpdesk.ticket', data);
    return { id, success: true };
  }

  async updateTicket(id: number, data: Record<string, unknown>) {
    await this.odoo.write('helpdesk.ticket', id, data);
    return { id, success: true };
  }
}
