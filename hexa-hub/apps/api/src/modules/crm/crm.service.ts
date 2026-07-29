import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(private readonly odoo: OdooService) {}

  async getPipeline() {
    const leads = await this.odoo.getLeads(
      [],
      ['id', 'name', 'contact_name', 'email_from', 'phone', 'stage_id', 'planned_revenue', 'probability', 'x_hexa_source', 'x_hexa_service', 'x_hexa_budget', 'create_date'],
    );

    const staged = new Map<string, { stageId: number; stageName: string; leads: unknown[]; totalRevenue: number }>();

    for (const lead of leads as Record<string, unknown>[]) {
      const stage = lead.stage_id as [number, string] | undefined;
      const stageName = stage?.[1] || 'Unknown';
      const stageId = stage?.[0] || 0;

      if (!staged.has(stageName)) {
        staged.set(stageName, { stageId, stageName, leads: [], totalRevenue: 0 });
      }

      const bucket = staged.get(stageName)!;
      bucket.leads.push(lead);
      bucket.totalRevenue += (lead.planned_revenue as number) || 0;
    }

    return Array.from(staged.values());
  }

  async getLeads(query: { stage?: string; source?: string; service?: string; search?: string; page?: number; limit?: number }) {
    const domain: unknown[] = [];

    if (query.stage) domain.push(['stage_id', 'ilike', query.stage]);
    if (query.source) domain.push(['x_hexa_source', '=', query.source]);
    if (query.service) domain.push(['x_hexa_service', '=', query.service]);
    if (query.search) {
      domain.push('|');
      domain.push(['name', 'ilike', query.search]);
      domain.push(['contact_name', 'ilike', query.search]);
    }

    const limit = query.limit || 25;
    const offset = query.page ? (query.page - 1) * limit : 0;

    const leads = await this.odoo.getLeads(
      domain,
      ['id', 'name', 'contact_name', 'email_from', 'phone', 'mobile', 'stage_id', 'planned_revenue', 'probability', 'x_hexa_source', 'x_hexa_service', 'x_hexa_budget', 'create_date', 'write_date'],
      { limit, offset, order: 'create_date desc' },
    );

    const total = await this.odoo.searchCount('crm.lead', domain);

    return { data: leads, meta: { total, page: query.page || 1, limit } };
  }

  async getLead(id: number) {
    const lead = await this.odoo.getLead(id);
    if (!lead) return null;

    const messages = await this.odoo.getMailMessages('crm.lead', id);
    return { ...lead as object, messages };
  }

  async createLead(data: Record<string, unknown>) {
    const id = await this.odoo.createLead(data);
    return { id };
  }

  async updateLead(id: number, data: Record<string, unknown>) {
    await this.odoo.updateLead(id, data);
    return { id, updated: true };
  }

  async deleteLead(id: number) {
    await this.odoo.deleteLead(id);
    return { id, deleted: true };
  }

  async getStats() {
    const leads = await this.odoo.getLeads([], ['stage_id', 'planned_revenue', 'x_hexa_source', 'create_date']);
    const allLeads = leads as Record<string, unknown>[];

    const total = allLeads.length;
    const totalRevenue = allLeads.reduce((sum, l) => sum + ((l.planned_revenue as number) || 0), 0);

    const bySource: Record<string, number> = {};
    const byStage: Record<string, number> = {};
    for (const lead of allLeads) {
      const src = (lead.x_hexa_source as string) || 'unknown';
      bySource[src] = (bySource[src] || 0) + 1;

      const stage = lead.stage_id as [number, string] | undefined | null;
      const stageName = stage?.[1] || 'unknown';
      byStage[stageName] = (byStage[stageName] || 0) + 1;
    }

    const wonLeads = allLeads.filter((l) => {
      const stage = l.stage_id as [number, string] | undefined;
      return stage?.[1]?.toLowerCase() === 'won';
    });

    const conversionRate = total > 0 ? (wonLeads.length / total) * 100 : 0;
    const averageDealSize = wonLeads.length > 0
      ? wonLeads.reduce((sum, l) => sum + ((l.planned_revenue as number) || 0), 0) / wonLeads.length
      : 0;

    return {
      total_leads: total,
      total_revenue: totalRevenue,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      average_deal_size: Math.round(averageDealSize * 100) / 100,
      leads_by_source: bySource,
      leads_by_stage: byStage,
    };
  }
}
