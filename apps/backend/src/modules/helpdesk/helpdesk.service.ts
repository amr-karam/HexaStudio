import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

const MODEL = 'helpdesk.ticket';
const DEFAULT_FIELDS = [
  'name', 'partner_id', 'stage_id', 'user_id', 'priority',
  'description', 'create_date', 'close_date',
];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

interface QueryOptions {
  page?: number;
  limit?: number;
  state?: string;
  priority?: string;
  search?: string;
}

/** Paginated list response shape. */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

@Injectable()
export class HelpdeskService {
  private readonly logger = new Logger(HelpdeskService.name);

  constructor(private readonly odoo: OdooService) {}

  /**
   * List helpdesk tickets with pagination, state, priority, and search filters.
   */
  async getTickets(query: QueryOptions = {}): Promise<PaginatedResult<Record<string, unknown>>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));
    const offset = (page - 1) * limit;

    const domain: unknown[] = [];
    if (query.state) domain.push(['stage_id.name', 'ilike', query.state]);
    if (query.priority) domain.push(['priority', '=', query.priority]);
    if (query.search) {
      domain.push('|');
      domain.push(['name', 'ilike', query.search]);
      domain.push(['description', 'ilike', query.search]);
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
   * Get a single helpdesk ticket by ID.
   */
  async getTicket(id: number): Promise<Record<string, unknown>> {
    const results = await this.odoo.searchRead(
      MODEL,
      [['id', '=', id]],
      DEFAULT_FIELDS,
    );
    if (!results.length) {
      throw new NotFoundException(`Helpdesk ticket #${id} not found`);
    }
    return results[0] as Record<string, unknown>;
  }

  /**
   * Create a new helpdesk ticket.
   */
  async createTicket(data: Record<string, unknown>): Promise<number> {
    return this.odoo.create(MODEL, data);
  }

  /**
   * Update an existing helpdesk ticket.
   */
  async updateTicket(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.odoo.write(MODEL, [id], data);
  }
}
