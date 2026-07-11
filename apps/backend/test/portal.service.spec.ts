import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { PortalService } from '../src/modules/portal/portal.service';
import { ProjectsService } from '../src/modules/projects/projects.service';

describe('PortalService', () => {
  let service: PortalService;
  let projectsService: { getAllProjects: ReturnType<typeof vi.fn> };

  const mockProject = {
    title: 'Skyline Tower',
    category: { id: 1, name: 'Residential', slug: 'residential' },
    status: 'in-progress',
  };

  beforeEach(async () => {
    projectsService = {
      getAllProjects: vi.fn().mockResolvedValue({ projects: [mockProject], total: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalService,
        { provide: ProjectsService, useValue: projectsService },
      ],
    }).compile();

    service = module.get<PortalService>(PortalService);
  });

  it('getClientProjectData maps the first project into the portal payload', async () => {
    const data = await service.getClientProjectData();

    expect(projectsService.getAllProjects).toHaveBeenCalled();
    expect(data.project).toEqual({
      title: 'Skyline Tower',
      category: mockProject.category,
      status: 'in-progress',
    });
  });

  it('getClientProjectData returns static timeline, documents, invoices and lead', async () => {
    const data = await service.getClientProjectData();

    expect(data.timeline).toHaveLength(3);
    expect(data.timeline[0].status).toBe('completed');
    expect(data.documents).toHaveLength(4);
    expect(data.invoices.map(i => i.status)).toEqual(['paid', 'pending']);
    expect(data.lead.email).toBe('alexander@hexastudio.net');
  });
});
