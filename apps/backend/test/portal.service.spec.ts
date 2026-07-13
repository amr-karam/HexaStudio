import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { PortalService } from '../src/modules/portal/portal.service';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { OdooService } from '../src/modules/odoo/odoo.service';

describe('PortalService', () => {
  let service: PortalService;
  let projectsService: ProjectsService;
  let odooService: OdooService;

  const mockTasks = [
    { id: 1, name: 'Concept Design', stage_id: [1, 'Design'], state: '1_done', date_deadline: '2026-05-12' },
    { id: 2, name: '3D Modeling', stage_id: [2, 'In Progress'], state: '01_in_progress', date_deadline: '2026-06-01' },
    { id: 3, name: 'Final Rendering', stage_id: [3, 'Pending'], state: '01_normal', date_deadline: '2026-07-15' },
  ];

  const mockOdooInvoices = [
    { id: 1, name: 'INV-2026-001', amount_total: 5000, invoice_date: '2026-05-01', payment_state: 'paid' },
    { id: 2, name: 'INV-2026-002', amount_total: 12000, invoice_date: '2026-06-15', payment_state: 'not_paid' },
  ];

  const mockProjects = {
    projects: [{ id: 1, title: 'Villa Beirut', category: 'residential', status: 'in-progress' }],
    total: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalService,
        { provide: ProjectsService, useValue: { getAllProjects: vi.fn() } },
        { provide: OdooService, useValue: { searchRead: vi.fn() } },
      ],
    }).compile();

    service = module.get<PortalService>(PortalService);
    projectsService = module.get<ProjectsService>(ProjectsService);
    odooService = module.get<OdooService>(OdooService);
  });

  it('returns project title from CMS', async () => {
    vi.mocked(odooService.searchRead).mockResolvedValueOnce(mockTasks).mockResolvedValueOnce(mockOdooInvoices);
    vi.mocked(projectsService.getAllProjects).mockResolvedValueOnce(mockProjects as any);
    const result = await service.getClientProjectData('client@example.com');
    expect(result.project.title).toBe('Villa Beirut');
    expect(result.timeline).toHaveLength(3);
  });

  it('maps task states correctly', async () => {
    vi.mocked(odooService.searchRead).mockResolvedValueOnce(mockTasks).mockResolvedValueOnce([]);
    vi.mocked(projectsService.getAllProjects).mockResolvedValueOnce(mockProjects as any);
    const result = await service.getClientProjectData();
    expect(result.timeline[0].status).toBe('completed');
    expect(result.timeline[1].status).toBe('in-progress');
    expect(result.timeline[2].status).toBe('pending');
  });

  it('maps invoice payment state correctly', async () => {
    vi.mocked(odooService.searchRead).mockResolvedValueOnce([]).mockResolvedValueOnce(mockOdooInvoices);
    vi.mocked(projectsService.getAllProjects).mockResolvedValueOnce(mockProjects as any);
    const result = await service.getClientProjectData();
    expect(result.invoices[0].status).toBe('paid');
    expect(result.invoices[1].status).toBe('pending');
  });

  it('falls back to mock timeline when no Odoo tasks', async () => {
    vi.mocked(odooService.searchRead).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    vi.mocked(projectsService.getAllProjects).mockResolvedValueOnce(mockProjects as any);
    const result = await service.getClientProjectData();
    expect(result.timeline).toHaveLength(3);
    expect(result.timeline[0].phase).toBe('Concept Design');
  });

  it('sets lead email from parameter', async () => {
    vi.mocked(odooService.searchRead).mockResolvedValue([]);
    vi.mocked(projectsService.getAllProjects).mockResolvedValueOnce(mockProjects as any);
    const result = await service.getClientProjectData('specific@client.com');
    expect(result.lead.email).toBe('specific@client.com');
  });

  it('uses default email when no clientEmail provided', async () => {
    vi.mocked(odooService.searchRead).mockResolvedValue([]);
    vi.mocked(projectsService.getAllProjects).mockResolvedValueOnce(mockProjects as any);
    const result = await service.getClientProjectData();
    expect(result.lead.email).toBe('client@hexastudio.net');
  });

  it('handles Odoo task failure gracefully', async () => {
    vi.mocked(odooService.searchRead).mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce([]);
    vi.mocked(projectsService.getAllProjects).mockResolvedValueOnce(mockProjects as any);
    const result = await service.getClientProjectData();
    expect(result.timeline).toBeDefined();
  });
});
