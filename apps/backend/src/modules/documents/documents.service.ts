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

const MODEL = 'ir.attachment';
const DEFAULT_FIELDS = [
  'name', 'mimetype', 'file_size', 'res_model',
  'res_id', 'create_date', 'create_uid',
];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

interface QueryOptions {
  page?: number;
  limit?: number;
  projectId?: number;
  search?: string;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private readonly odoo: OdooService) {}

  /**
   * List documents with pagination, project, and search filters.
   */
  async getDocuments(query: QueryOptions = {}): Promise<PaginatedResult<Record<string, unknown>>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));
    const offset = (page - 1) * limit;

    const domain: unknown[] = [];
    if (query.projectId) {
      domain.push(['res_model', '=', 'project.project']);
      domain.push(['res_id', '=', query.projectId]);
    }
    if (query.search) domain.push(['name', 'ilike', query.search]);

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
   * Get a single document by ID.
   */
  async getDocument(id: number): Promise<Record<string, unknown>> {
    const results = await this.odoo.searchRead(
      MODEL,
      [['id', '=', id]],
      DEFAULT_FIELDS,
    );
    if (!results.length) {
      throw new NotFoundException(`Document #${id} not found`);
    }
    return results[0] as Record<string, unknown>;
  }
}
