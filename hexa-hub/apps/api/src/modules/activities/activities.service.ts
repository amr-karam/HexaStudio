import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(private readonly odoo: OdooService) {}

  async getActivities(query: { res_model?: string; res_id?: number; user_id?: number; search?: string; page?: number; limit?: number }) {
    const domain: unknown[] = [];

    if (query.res_model) domain.push(['res_model', '=', query.res_model]);
    if (query.res_id) domain.push(['res_id', '=', query.res_id]);
    if (query.user_id) domain.push(['user_id', '=', query.user_id]);
    if (query.search) domain.push(['summary', 'ilike', query.search]);

    const limit = query.limit || 25;
    const offset = query.page ? (query.page - 1) * limit : 0;

    const activities = await this.odoo.getActivities(
      domain,
      ['id', 'summary', 'note', 'activity_type_id', 'state', 'user_id', 'date_deadline', 'date_done', 'res_model', 'res_id', 'create_date'],
      { limit, offset, order: 'date_deadline asc' },
    );

    const total = await this.odoo.searchCount('mail.activity', domain);
    return { data: activities, meta: { total, page: query.page || 1, limit } };
  }

  async createActivity(data: Record<string, unknown>) {
    const id = await this.odoo.createActivity(data);
    return { id };
  }

  async updateActivity(id: number, data: Record<string, unknown>) {
    await this.odoo.updateActivity(id, data);
    return { id, updated: true };
  }

  async completeActivity(id: number) {
    await this.odoo.completeActivity(id);
    return { id, completed: true };
  }

  async deleteActivity(id: number) {
    await this.odoo.deleteActivity(id);
    return { id, deleted: true };
  }
}
