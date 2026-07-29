import { Injectable } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class TimesheetsService {
  constructor(private readonly odoo: OdooService) {}

  async getTimesheets(query: { page?: number; limit?: number; employeeId?: number; projectId?: number; dateFrom?: string; dateTo?: string }) {
    const domain: unknown[] = [];
    if (query.employeeId) domain.push(['employee_id', '=', query.employeeId]);
    if (query.projectId) domain.push(['project_id', '=', query.projectId]);
    if (query.dateFrom) domain.push(['date', '>=', query.dateFrom]);
    if (query.dateTo) domain.push(['date', '<=', query.dateTo]);
    const limit = query.limit || 25;
    const offset = query.page ? (query.page - 1) * limit : 0;
    const [timesheets, total] = await Promise.all([
      this.odoo.getTimesheets(domain, ['id', 'employee_id', 'project_id', 'task_id', 'name', 'unit_amount', 'date', 'create_date'], { limit, offset, order: 'date desc' }),
      this.odoo.searchCount('account.analytic.line', domain),
    ]);
    return { data: timesheets, meta: { total, page: query.page || 1, limit } };
  }

  async createTimesheet(data: Record<string, unknown>) {
    const id = await this.odoo.create('account.analytic.line', data);
    return { id, success: true };
  }

  async getStats(query: { dateFrom?: string; dateTo?: string }) {
    const domain: unknown[] = [];
    if (query.dateFrom) domain.push(['date', '>=', query.dateFrom]);
    if (query.dateTo) domain.push(['date', '<=', query.dateTo]);
    const entries = await this.odoo.getTimesheets(domain, ['id', 'unit_amount', 'employee_id']);
    const arr = entries as Record<string, unknown>[];
    const totalHours = arr.reduce((sum, e) => sum + ((e.unit_amount as number) || 0), 0);
    const uniqueEmployees = new Set(arr.map(e => (e.employee_id as [number, string])?.[0]));
    return { total_hours: Math.round(totalHours * 100) / 100, total_entries: arr.length, unique_employees: uniqueEmployees.size };
  }
}
