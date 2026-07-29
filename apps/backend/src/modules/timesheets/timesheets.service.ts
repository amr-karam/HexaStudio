import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

const MODEL = 'account.analytic.line';
const DEFAULT_FIELDS = [
  'name', 'date', 'user_id', 'project_id', 'task_id',
  'unit_amount', 'employee_id',
];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

interface QueryOptions {
  page?: number;
  limit?: number;
  employeeId?: number;
  projectId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface TimesheetStats {
  totalEntries: number;
  totalHours: number;
  uniqueEmployees: number;
  uniqueProjects: number;
}

@Injectable()
export class TimesheetsService {
  private readonly logger = new Logger(TimesheetsService.name);

  constructor(private readonly odoo: OdooService) {}

  /**
   * List timesheet entries with pagination and filters.
   */
  async getTimesheets(query: QueryOptions = {}): Promise<PaginatedResult<Record<string, unknown>>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));
    const offset = (page - 1) * limit;

    const domain: unknown[] = [];
    if (query.employeeId) domain.push(['employee_id', '=', query.employeeId]);
    if (query.projectId) domain.push(['project_id', '=', query.projectId]);
    if (query.dateFrom) domain.push(['date', '>=', query.dateFrom]);
    if (query.dateTo) domain.push(['date', '<=', query.dateTo]);

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
   * Create a new timesheet entry.
   */
  async createTimesheet(data: Record<string, unknown>): Promise<number> {
    return this.odoo.create(MODEL, data);
  }

  /**
   * Get aggregated timesheet statistics.
   */
  async getStats(): Promise<TimesheetStats> {
    try {
      const allEntries = await this.odoo.searchRead(MODEL, [], [
        'unit_amount', 'employee_id', 'project_id',
      ]);

      const totalEntries = allEntries.length;
      const totalHours = allEntries.reduce(
        (sum, entry) => sum + ((entry.unit_amount as number) ?? 0),
        0,
      );
      const employeeIds = new Set<number>();
      const projectIds = new Set<number>();

      for (const entry of allEntries) {
        const empId = Array.isArray(entry.employee_id)
          ? (entry.employee_id as [number, string])[0]
          : (entry.employee_id as number);
        const projId = Array.isArray(entry.project_id)
          ? (entry.project_id as [number, string])[0]
          : (entry.project_id as number);
        if (empId) employeeIds.add(empId);
        if (projId) projectIds.add(projId);
      }

      return {
        totalEntries,
        totalHours: Math.round(totalHours * 100) / 100,
        uniqueEmployees: employeeIds.size,
        uniqueProjects: projectIds.size,
      };
    } catch (error) {
      this.logger.warn('Failed to compute timesheet stats', (error as Error).message);
      return { totalEntries: 0, totalHours: 0, uniqueEmployees: 0, uniqueProjects: 0 };
    }
  }
}
