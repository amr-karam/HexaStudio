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

const MODEL = 'knowledge.article';
const DEFAULT_FIELDS = [
  'name', 'body', 'category_id', 'create_uid',
  'create_date', 'write_date',
];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

interface QueryOptions {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(private readonly odoo: OdooService) {}

  /**
   * List knowledge articles with pagination, category, and search filters.
   */
  async getArticles(query: QueryOptions = {}): Promise<PaginatedResult<Record<string, unknown>>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));
    const offset = (page - 1) * limit;

    const domain: unknown[] = [];
    if (query.category) domain.push(['category_id.name', 'ilike', query.category]);
    if (query.search) {
      domain.push('|');
      domain.push(['name', 'ilike', query.search]);
      domain.push(['body', 'ilike', query.search]);
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
   * Get a single knowledge article by ID.
   */
  async getArticle(id: number): Promise<Record<string, unknown>> {
    const results = await this.odoo.searchRead(
      MODEL,
      [['id', '=', id]],
      DEFAULT_FIELDS,
    );
    if (!results.length) {
      throw new NotFoundException(`Knowledge article #${id} not found`);
    }
    return results[0] as Record<string, unknown>;
  }
}
