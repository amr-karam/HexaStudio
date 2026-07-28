import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

export interface SearchResult {
  model: string;
  id: number;
  title: string;
  subtitle?: string;
  url?: string;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly odoo: OdooService) {}

  async globalSearch(query: string, models?: string[], limit = 20) {
    const results: SearchResult[] = [];
    const searchModels = models || ['crm.lead', 'res.partner', 'project.project', 'project.task', 'sale.order', 'account.move'];

    const searchPromises = searchModels.map(async (model) => {
      try {
        let domain: unknown[];
        let titleField: string;
        let subtitleField: string;

        switch (model) {
          case 'crm.lead':
            domain = ['|', ['name', 'ilike', query], ['contact_name', 'ilike', query]];
            titleField = 'name';
            subtitleField = 'contact_name';
            break;
          case 'res.partner':
            domain = ['|', ['name', 'ilike', query], ['email', 'ilike', query]];
            titleField = 'name';
            subtitleField = 'email';
            break;
          case 'project.project':
            domain = [['name', 'ilike', query]];
            titleField = 'name';
            subtitleField = 'partner_id';
            break;
          case 'project.task':
            domain = [['name', 'ilike', query]];
            titleField = 'name';
            subtitleField = 'project_id';
            break;
          case 'sale.order':
            domain = [['name', 'ilike', query]];
            titleField = 'name';
            subtitleField = 'partner_id';
            break;
          case 'account.move':
            domain = [['name', 'ilike', query]];
            titleField = 'name';
            subtitleField = 'partner_id';
            break;
          default:
            return;
        }

        const items = await this.odoo.searchRead(model, domain, [titleField, subtitleField], { limit: 5 });
        for (const item of items as Record<string, unknown>[]) {
          results.push({
            model,
            id: item.id as number,
            title: (item[titleField] as string) || 'Untitled',
            subtitle: (item[subtitleField] as string) || undefined,
          });
        }
      } catch (error) {
        this.logger.warn(`Search failed for model ${model}: ${error.message}`);
      }
    });

    await Promise.allSettled(searchPromises);

    // Limit total results
    const limited = results.slice(0, limit);
    return { data: limited, meta: { total: limited.length, query } };
  }
}
