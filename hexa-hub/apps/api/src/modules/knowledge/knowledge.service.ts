import { Injectable } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class KnowledgeService {
  constructor(private readonly odoo: OdooService) {}

  async getArticles(query: { page?: number; limit?: number; category?: string; search?: string }) {
    const domain: unknown[] = [];
    if (query.category) domain.push(['category_id', '=', query.category]);
    if (query.search) { domain.push('|'); domain.push(['title', 'ilike', query.search]); }
    const limit = query.limit || 20;
    const offset = query.page ? (query.page - 1) * limit : 0;
    const [articles, total] = await Promise.all([
      this.odoo.getKnowledgeArticles(domain, ['id', 'title', 'content', 'category_id', 'published', 'create_date', 'write_date'], { limit, offset, order: 'write_date desc' }),
      this.odoo.searchCount('knowledge.article', domain),
    ]);
    return { data: articles, meta: { total, page: query.page || 1, limit } };
  }

  async getArticle(id: number) {
    return this.odoo.read('knowledge.article', [id]);
  }
}
