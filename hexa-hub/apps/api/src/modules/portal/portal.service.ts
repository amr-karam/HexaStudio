import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class PortalService {
  private readonly logger = new Logger(PortalService.name);

  constructor(private readonly odoo: OdooService) {}

  async getClientProjects(partnerId: number) {
    const projects = await this.odoo.getProjects(
      [['partner_id', '=', partnerId], ['x_hexa_client_portal_active', '=', true]],
      ['id', 'name', 'display_name', 'partner_id', 'x_hexa_type', 'x_hexa_status', 'x_hexa_budget_amount', 'date_start', 'date'],
    );
    return { data: projects };
  }

  async getClientMilestones(projectId: number) {
    const milestones = await this.odoo.getMilestones(projectId);
    // Filter to client-viewable only
    const filtered = (milestones as Record<string, unknown>[]).filter(
      (m) => m.x_hexa_client_viewable === true,
    );
    return { data: filtered };
  }

  async getClientInvoices(partnerId: number) {
    const invoices = await this.odoo.getInvoices(
      [['partner_id', '=', partnerId], ['move_type', '=', 'out_invoice']],
      ['id', 'name', 'state', 'invoice_date', 'invoice_date_due', 'amount_total', 'currency_id', 'payment_state'],
      { order: 'invoice_date desc' },
    );
    return { data: invoices };
  }

  async getClientSummary(partnerId: number) {
    const projects = await this.getClientProjects(partnerId);
    const invoices = await this.getClientInvoices(partnerId);

    const projectData = projects.data as Record<string, unknown>[];
    const invoiceData = invoices.data as Record<string, unknown>[];

    const totalBudget = projectData.reduce(
      (sum, p) => sum + ((p.x_hexa_budget_amount as number) || 0),
      0,
    );

    const totalInvoiced = invoiceData.reduce(
      (sum, i) => sum + ((i.amount_total as number) || 0),
      0,
    );

    const nextMilestone = projectData.length > 0
      ? await this.findNextMilestone(projectData[0].id as number)
      : null;

    return {
      data: {
        total_projects: projectData.length,
        total_budget: totalBudget,
        total_invoiced: totalInvoiced,
        next_milestone: nextMilestone,
      },
    };
  }

  private async findNextMilestone(projectId: number): Promise<unknown | null> {
    const milestones = await this.odoo.getMilestones(projectId);
    const upcoming = (milestones as Record<string, unknown>[])
      .filter((m) => !m.completed && m.x_hexa_client_viewable)
      .sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());
    return upcoming[0] || null;
  }
}
