import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

export interface PortalProjectStatus {
  phase: string;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
  date?: string;
}

export interface PortalDocument {
  name: string;
  url: string;
  type: string;
  size: string;
}

export interface PortalInvoice {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface ClientProject {
  id: number;
  name: string;
  status: string;
  type: string;
  startDate: string;
  endDate: string;
  milestones: ClientMilestone[];
}

export interface ClientMilestone {
  id: number;
  name: string;
  date: string;
  completed: boolean;
  description: string;
}

export interface ClientInvoice {
  id: number;
  name: string;
  date: string;
  amount: number;
  residual: number;
  paymentState: string;
  state: string;
}

@Injectable()
export class PortalService {
  private readonly logger = new Logger(PortalService.name);

  constructor(
    private readonly odooService: OdooService,
  ) {}

  async getClientProjectData(clientEmail?: string) {
    // Scope everything to the authenticated client's Odoo partner.
    const partnerId = clientEmail ? await this.resolvePartnerId(clientEmail) : null;

    const projects = partnerId ? await this.getClientProjects(partnerId) : [];
    const invoices = partnerId ? await this.getClientInvoices(partnerId) : [];

    const primaryProject = projects[0];
    const milestones = primaryProject?.milestones ?? [];

    const timeline = milestones.map((m: ClientMilestone) => ({
      phase: m.name,
      status: (m.completed ? 'completed' : 'pending') as PortalProjectStatus['status'],
      description: m.description,
      date: m.date || undefined,
    }));

    const invoiceData: PortalInvoice[] = invoices.map((inv) => ({
      id: String(inv.id),
      amount: inv.amount,
      date: inv.date || new Date().toISOString(),
      status:
        inv.paymentState === 'paid'
          ? 'paid'
          : inv.paymentState === 'not_paid'
            ? 'pending'
            : 'overdue',
    }));

    return {
      project: {
        title: primaryProject?.name ?? 'No Project',
        category: primaryProject?.type ?? '',
        status: primaryProject?.status ?? '',
      },
      timeline,
      documents: [],
      invoices: invoiceData,
      lead: {
        name: 'Client',
        role: 'Project Manager',
        email: clientEmail || 'client@hexastudio.net',
        avatar: '/avatars/default.jpg',
      },
    };
  }

  // --- Client-scoped Odoo methods ---

  /**
   * Resolve the Odoo partner_id for a given user email.
   * Looks up res.partner by email where x_hexa_client = true.
   */
  async resolvePartnerId(email: string): Promise<number | null> {
    try {
      const partners = await this.odooService.execute<Record<string, unknown>[]>(
        'res.partner',
        'search_read',
        [[['email', '=', email], ['x_hexa_client', '=', true]], ['id'], 0, 1],
      );
      if (partners.length > 0) {
        return partners[0].id as number;
      }
      return null;
    } catch (err) {
      this.logger.warn(`Failed to resolve partner for email ${email}: ${err}`);
      return null;
    }
  }

  /**
   * Get projects visible to the client (partner_id match + portal active).
   */
  async getClientProjects(partnerId: number): Promise<ClientProject[]> {
    try {
      const projects = await this.odooService.execute<Record<string, unknown>[]>(
        'project.project',
        'search_read',
        [
          [['partner_id', '=', partnerId], ['x_hexa_client_portal_active', '=', true]],
          ['id', 'name', 'x_hexa_status', 'x_hexa_type', 'date_start', 'date'],
          0, 50,
          'date_start desc',
        ],
      );

      const result: ClientProject[] = [];
      for (const p of projects) {
        const milestones = await this.getClientMilestones(p.id as number);
        result.push({
          id: p.id as number,
          name: p.name as string,
          status: (p.x_hexa_status as string) || 'active',
          type: (p.x_hexa_type as string) || '',
          startDate: (p.date_start as string) || '',
          endDate: (p.date as string) || '',
          milestones,
        });
      }
      return result;
    } catch (err) {
      this.logger.warn(`Failed to fetch client projects for partner ${partnerId}: ${err}`);
      return [];
    }
  }

  /**
   * Get client-viewable milestones for a project.
   */
  async getClientMilestones(projectId: number): Promise<ClientMilestone[]> {
    try {
      const milestones = await this.odooService.execute<Record<string, unknown>[]>(
        'project.milestone',
        'search_read',
        [
          [['project_id', '=', projectId], ['x_hexa_client_viewable', '=', true]],
          ['id', 'name', 'date', 'completed', 'x_hexa_description', 'x_hexa_order'],
          0, 100,
          'x_hexa_order asc',
        ],
      );
      return milestones.map((m) => ({
        id: m.id as number,
        name: m.name as string,
        date: (m.date as string) || '',
        completed: (m.completed as boolean) || false,
        description: (m.x_hexa_description as string) || '',
      }));
    } catch (err) {
      this.logger.warn(`Failed to fetch milestones for project ${projectId}: ${err}`);
      return [];
    }
  }

  /**
   * Get invoices for the client's partner_id.
   */
  async getClientInvoices(partnerId: number): Promise<ClientInvoice[]> {
    try {
      const invoices = await this.odooService.execute<Record<string, unknown>[]>(
        'account.move',
        'search_read',
        [
          [['move_type', '=', 'out_invoice'], ['partner_id', '=', partnerId]],
          ['id', 'name', 'invoice_date', 'amount_total', 'amount_residual', 'payment_state', 'state'],
          0, 50,
          'invoice_date desc',
        ],
      );
      return invoices.map((inv) => ({
        id: inv.id as number,
        name: (inv.name as string) || '',
        date: (inv.invoice_date as string) || '',
        amount: (inv.amount_total as number) || 0,
        residual: (inv.amount_residual as number) || 0,
        paymentState: (inv.payment_state as string) || 'not_paid',
        state: (inv.state as string) || 'draft',
      }));
    } catch (err) {
      this.logger.warn(`Failed to fetch invoices for partner ${partnerId}: ${err}`);
      return [];
    }
  }
}
