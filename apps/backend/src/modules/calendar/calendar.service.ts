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

const MODEL = 'calendar.event';
const DEFAULT_FIELDS = [
  'name', 'start', 'stop', 'duration', 'allday',
  'partner_ids', 'user_id', 'description', 'location',
];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

interface QueryOptions {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(private readonly odoo: OdooService) {}

  /**
   * List calendar events with pagination and date range filters.
   */
  async getEvents(query: QueryOptions = {}): Promise<PaginatedResult<Record<string, unknown>>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));
    const offset = (page - 1) * limit;

    const domain: unknown[] = [];
    if (query.dateFrom) domain.push(['start', '>=', query.dateFrom]);
    if (query.dateTo) domain.push(['stop', '<=', query.dateTo]);

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
   * Get a single calendar event by ID.
   */
  async getEvent(id: number): Promise<Record<string, unknown>> {
    const results = await this.odoo.searchRead(
      MODEL,
      [['id', '=', id]],
      DEFAULT_FIELDS,
    );
    if (!results.length) {
      throw new NotFoundException(`Calendar event #${id} not found`);
    }
    return results[0] as Record<string, unknown>;
  }

  /**
   * Create a new calendar event.
   */
  async createEvent(data: Record<string, unknown>): Promise<number> {
    return this.odoo.create(MODEL, data);
  }

  /**
   * Update an existing calendar event.
   */
  async updateEvent(id: number, data: Record<string, unknown>): Promise<boolean> {
    return this.odoo.write(MODEL, [id], data);
  }

  /**
   * Delete a calendar event.
   */
  async deleteEvent(id: number): Promise<boolean> {
    return this.odoo.write(MODEL, [id], { active: false });
  }
}
