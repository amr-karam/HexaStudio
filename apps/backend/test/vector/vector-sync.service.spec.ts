import '../setup';
import { Test, TestingModule } from '@nestjs/testing';
import { VectorSyncService } from '../../src/modules/vector/vector-sync.service';
import { EmbeddingService } from '../../src/modules/ai/embedding.service';
import { ProjectsService } from '../../src/modules/projects/projects.service';

describe('VectorSyncService', () => {
  let service: VectorSyncService;
  let embeddingService: jest.Mocked<EmbeddingService>;
  let projectsService: jest.Mocked<ProjectsService>;

  beforeEach(async () => {
    const mockEmbeddingService = {
      embedProject: jest.fn(),
    };
    const mockProjectsService = {
      getProjectBySlug: jest.fn(),
      getAllProjects: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VectorSyncService,
        { provide: EmbeddingService, useValue: mockEmbeddingService },
        { provide: ProjectsService, useValue: mockProjectsService },
      ],
    }).compile();

    service = module.get<VectorSyncService>(VectorSyncService);
    embeddingService = module.get(EmbeddingService) as any;
    projectsService = module.get(ProjectsService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sync a single project successfully', async () => {
    const mockProject = { slug: 'test-project', title: 'Test' };
    projectsService.getProjectBySlug.mockResolvedValue(mockProject as any);
    embeddingService.embedProject.mockResolvedValue(undefined as any);

    await service.syncProject('test-project');
    expect(projectsService.getProjectBySlug).toHaveBeenCalledWith('test-project');
    expect(embeddingService.embedProject).toHaveBeenCalledWith(mockProject);
  });

  it('should throw an error if syncProject fails', async () => {
    projectsService.getProjectBySlug.mockRejectedValue(new Error('Not found'));

    await expect(service.syncProject('missing-project')).rejects.toThrow('Not found');
  });

  it('should sync all projects and log results', async () => {
    const mockProjects = [
      { slug: 'p1', title: 'P1' },
      { slug: 'p2', title: 'P2' },
    ];
    projectsService.getAllProjects.mockResolvedValue({ projects: mockProjects } as any);
    embeddingService.embedProject.mockImplementation((p: any) => {
      if (p.slug === 'p2') return Promise.reject(new Error('Failed'));
      return Promise.resolve(undefined as any);
    });

    await service.syncAllProjects();
    expect(projectsService.getAllProjects).toHaveBeenCalled();
    expect(embeddingService.embedProject).toHaveBeenCalledTimes(2);
  });
});
