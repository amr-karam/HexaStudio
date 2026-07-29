import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

const MODEL = 'hr.employee';
const DEFAULT_FIELDS = [
  'name', 'work_email', 'work_phone', 'job_title', 'department_id',
  'parent_id', 'user_id', 'active',
];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

interface QueryOptions {
  page?: number;
  limit?: number;
  department?: string;
  search?: string;
}

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(private readonly odoo: OdooService) {}

  /**
   * List employees with pagination, department, and search filters.
   */
  async getEmployees(query: QueryOptions = {}): Promise<PaginatedResult<Record<string, unknown>>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));
    const offset = (page - 1) * limit;

    const domain: unknown[] = [['active', '=', true]];
    if (query.department) domain.push(['department_id.name', 'ilike', query.department]);
    if (query.search) {
      domain.push('|');
      domain.push(['name', 'ilike', query.search]);
      domain.push(['work_email', 'ilike', query.search]);
    }

    const [total, data] = await Promise.all([
      this.odoo.execute<number>(MODEL, 'search_count', [domain]).catch(() => 0),
      this.odoo.searchRead(MODEL, domain, DEFAULT_FIELDS).then((rows) =>
        rows.slice(offset, offset + limit),
      ),
    ]);

    return {
      data: data as Record<string, unknown>[],
      meta: { total, page, limit },
    };
  }

  /**
   * Get a single employee by ID.
   */
  async getEmployee(id: number): Promise<Record<string, unknown>> {
    const results = await this.odoo.searchRead(
      MODEL,
      [['id', '=', id]],
      DEFAULT_FIELDS,
    );
    if (!results.length) {
      throw new NotFoundException(`Employee #${id} not found`);
    }
    return results[0] as Record<string, unknown>;
  }
}
