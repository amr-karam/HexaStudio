import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly odoo: OdooService) {}

  async getTasks(query: { project_id?: number; state?: string; priority?: string; user_id?: number; search?: string; page?: number; limit?: number }) {
    const domain: unknown[] = [];

    if (query.project_id) domain.push(['project_id', '=', query.project_id]);
    if (query.state) domain.push(['state', '=', query.state]);
    if (query.priority) domain.push(['priority', '=', query.priority]);
    if (query.user_id) domain.push(['user_id', '=', query.user_id]);
    if (query.search) {
      domain.push(['|']);
      domain.push(['name', 'ilike', query.search]);
    }

    const limit = query.limit || 25;
    const offset = query.page ? (query.page - 1) * limit : 0;

    const tasks = await this.odoo.getTasks(
      domain,
      ['id', 'name', 'description', 'state', 'priority', 'user_id', 'partner_id', 'project_id', 'stage_id', 'date_deadline', 'date_assign', 'date_end', 'planned_hours', 'effective_hours', 'remaining_hours', 'create_date'],
      { limit, offset, order: 'create_date desc' },
    );

    const total = await this.odoo.searchCount('project.task', domain);
    return { data: tasks, meta: { total, page: query.page || 1, limit } };
  }

  async getTask(id: number) {
    const task = await this.odoo.getTask(id);
    if (!task) return null;

    const messages = await this.odoo.getMailMessages('project.task', id);
    return { ...(task as object), messages };
  }

  async createTask(data: Record<string, unknown>) {
    const id = await this.odoo.createTask(data);
    return { id };
  }

  async updateTask(id: number, data: Record<string, unknown>) {
    await this.odoo.updateTask(id, data);
    return { id, updated: true };
  }

  async deleteTask(id: number) {
    await this.odoo.deleteTask(id);
    return { id, deleted: true };
  }

  async completeTask(id: number) {
    await this.odoo.updateTask(id, {
      state: 'done',
      date_end: new Date().toISOString(),
    });
    return { id, completed: true };
  }
}
