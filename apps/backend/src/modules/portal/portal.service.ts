import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';

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
  constructor(private readonly projectsService: ProjectsService) {}

  async getClientProjectData() {
    const projects = (await this.projectsService.getAllProjects()).projects;
    const project = projects[0]; // Mocking for the first project

    return {
      project: {
        title: project.title,
        category: project.category,
        status: project.status,
      },
      timeline: [
        { phase: 'Concept Design', status: 'completed', description: 'Initial moodboards and spatial layouts approved.', date: '2026-05-12' },
        { phase: '3D Modeling', status: 'in-progress', description: 'Developing high-fidelity geometric models and material studies.', date: '2026-06-01' },
        { phase: 'Final Rendering', status: 'pending', description: 'Final 8K cinematic renders and post-production.', date: '2026-07-15' },
      ],
      documents: [
        { name: 'Project_Agreement.pdf', url: '/docs/agreement.pdf', type: 'pdf', size: '1.2 MB' },
        { name: 'Material_Palette.pdf', url: '/docs/palette.pdf', type: 'pdf', size: '4.5 MB' },
        { name: 'Site_Analysis.pdf', url: '/docs/analysis.pdf', type: 'pdf', size: '8.1 MB' },
        { name: 'Initial_Concepts.zip', url: '/docs/concepts.zip', type: 'zip', size: '45 MB' },
      ],
      invoices: [
        { id: 'INV-2026-001', amount: 5000, date: '2026-05-01', status: 'paid' },
        { id: 'INV-2026-002', amount: 12000, date: '2026-06-15', status: 'pending' },
      ],
      lead: {
        name: 'Alexander Thorne',
        role: 'Chief Architect',
        email: 'alexander@hexastudio.net',
        avatar: '/avatars/alexander.jpg',
      },
    };
  }
}
