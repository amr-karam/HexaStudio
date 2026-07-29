import { Injectable } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class DocumentsService {
  constructor(private readonly odoo: OdooService) {}

  async getDocuments(query: { page?: number; limit?: number; projectId?: number; search?: string }) {
    const domain: unknown[] = [];
    if (query.projectId) domain.push(['x_hexa_project_id', '=', query.projectId]);
    if (query.search) { domain.push('|'); domain.push(['name', 'ilike', query.search]); }
    const limit = query.limit || 20;
    const offset = query.page ? (query.page - 1) * limit : 0;
    const [docs, total] = await Promise.all([
      this.odoo.getDocuments(domain, ['id', 'name', 'mimetype', 'file_size', 'x_hexa_storage_path', 'x_hexa_project_id', 'partner_id', 'create_date'], { limit, offset, order: 'create_date desc' }),
      this.odoo.searchCount('documents.document', domain),
    ]);
    return { data: docs, meta: { total, page: query.page || 1, limit } };
  }

  async getDocument(id: number) {
    return this.odoo.read('documents.document', [id]);
  }
}
