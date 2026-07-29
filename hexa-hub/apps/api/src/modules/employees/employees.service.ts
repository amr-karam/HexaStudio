import { Injectable } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly odoo: OdooService) {}

  async getEmployees(query: { page?: number; limit?: number; department?: string; search?: string }) {
    const domain: unknown[] = [];
    if (query.department) domain.push(['department_id', '=', query.department]);
    if (query.search) { domain.push('|'); domain.push(['name', 'ilike', query.search]); }
    const limit = query.limit || 20;
    const offset = query.page ? (query.page - 1) * limit : 0;
    const [employees, total] = await Promise.all([
      this.odoo.getEmployees(domain, ['id', 'name', 'work_email', 'job_id', 'department_id', 'user_id', 'mobile_phone', 'work_phone', 'create_date'], { limit, offset, order: 'name asc' }),
      this.odoo.searchCount('hr.employee', domain),
    ]);
    return { data: employees, meta: { total, page: query.page || 1, limit } };
  }

  async getEmployee(id: number) {
    return this.odoo.read('hr.employee', [id]);
  }
}
