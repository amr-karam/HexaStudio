import { Injectable, Logger } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
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

@Injectable()
export class PortalService {
  private readonly logger = new Logger(PortalService.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly odooService: OdooService,
  ) {}

  async getClientProjectData(clientEmail?: string) {
    // Fetch real project tasks from Odoo
    let tasks: Record<string, unknown>[] = [];
    try {
      tasks = await this.odooService.searchRead(
        'project.task',
        [],
        ['name', 'stage_id', 'state', 'date_deadline'],
      );
    } catch (err) {
      this.logger.warn(`Failed to fetch tasks from Odoo: ${err}`);
    }

    // Map Odoo tasks to timeline
    const timeline = tasks.map((task: Record<string, unknown>) => {
      const stage = task.stage_id as [number, string] | false;
      const state = task.state as string;
      return {
        phase: (task.name as string) || 'Unknown Task',
        status: state === '1_done' ? 'completed' : state === '01_in_progress' ? 'in-progress' : 'pending',
        description: stage ? stage[1] : 'No stage',
        date: (task.date_deadline as string) || undefined,
      };
    });

    // Fetch invoices from Odoo
    let invoices: Record<string, unknown>[] = [];
    try {
      invoices = await this.odooService.searchRead(
        'account.move',
        [['move_type', '=', 'out_invoice']],
        ['name', 'amount_total', 'invoice_date', 'payment_state'],
      );
    } catch (err) {
      this.logger.warn(`Failed to fetch invoices from Odoo: ${err}`);
    }

    const invoiceData = invoices.map((inv: Record<string, unknown>) => ({
      id: (inv.name as string) || 'INV-000',
      amount: (inv.amount_total as number) || 0,
      date: (inv.invoice_date as string) || new Date().toISOString(),
      status: inv.payment_state === 'paid' ? 'paid' : inv.payment_state === 'not_paid' ? 'pending' : 'overdue',
    }));

    // Fallback to mock data if no real data exists
    let project: { title: string; category?: string; status?: string } = { title: 'No Project' };
    try {
      const projects = (await this.projectsService.getAllProjects()).projects;
      if (projects[0]) project = projects[0] as { title: string; category?: string; status?: string };
    } catch (err) {
      this.logger.warn(`Failed to fetch projects from CMS: ${err}`);
    }

    return {
      project: {
        title: project.title,
        category: project.category || '',
        status: project.status || '',
      },
      timeline: timeline.length > 0 ? timeline : [
        { phase: 'Concept Design', status: 'completed', description: 'Initial moodboards approved.', date: '2026-05-12' },
        { phase: '3D Modeling', status: 'in-progress', description: 'High-fidelity models in progress.', date: '2026-06-01' },
        { phase: 'Final Rendering', status: 'pending', description: 'Final 8K renders.', date: '2026-07-15' },
      ],
      documents: [
        { name: 'Project_Agreement.pdf', url: '/docs/agreement.pdf', type: 'pdf', size: '1.2 MB' },
        { name: 'Material_Palette.pdf', url: '/docs/palette.pdf', type: 'pdf', size: '4.5 MB' },
      ],
      invoices: invoiceData.length > 0 ? invoiceData : [
        { id: 'INV-2026-001', amount: 5000, date: '2026-05-01', status: 'paid' },
        { id: 'INV-2026-002', amount: 12000, date: '2026-06-15', status: 'pending' },
      ],
      lead: {
        name: 'Client',
        role: 'Project Manager',
        email: clientEmail || 'client@hexastudio.net',
        avatar: '/avatars/default.jpg',
      },
    };
  }
}
