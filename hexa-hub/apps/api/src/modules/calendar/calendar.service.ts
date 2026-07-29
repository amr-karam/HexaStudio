import { Injectable } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class CalendarService {
  constructor(private readonly odoo: OdooService) {}

  async getEvents(query: { page?: number; limit?: number; dateFrom?: string; dateTo?: string }) {
    const domain: unknown[] = [];
    if (query.dateFrom) domain.push(['start', '>=', query.dateFrom]);
    if (query.dateTo) domain.push(['stop', '<=', query.dateTo]);
    const limit = query.limit || 50;
    const offset = query.page ? (query.page - 1) * limit : 0;
    const [events, total] = await Promise.all([
      this.odoo.getCalendarEvents(domain, ['id', 'name', 'start', 'stop', 'description', 'location', 'partner_ids', 'user_id', 'create_date'], { limit, offset, order: 'start asc' }),
      this.odoo.searchCount('calendar.event', domain),
    ]);
    return { data: events, meta: { total, page: query.page || 1, limit } };
  }

  async getEvent(id: number) {
    return this.odoo.read('calendar.event', [id]);
  }

  async createEvent(data: Record<string, unknown>) {
    const id = await this.odoo.create('calendar.event', data);
    return { id, success: true };
  }

  async updateEvent(id: number, data: Record<string, unknown>) {
    await this.odoo.write('calendar.event', id, data);
    return { id, success: true };
  }

  async deleteEvent(id: number) {
    await this.odoo.unlink('calendar.event', id);
    return { id, success: true };
  }
}
