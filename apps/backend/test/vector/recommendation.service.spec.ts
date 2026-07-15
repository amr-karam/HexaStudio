import '../setup';
import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from '../../src/modules/vector/recommendation.service';
import { VectorService } from '../../src/modules/vector/vector.service';
import { EmbeddingService } from '../../src/modules/ai/embedding.service';
import { ProjectsService } from '../../src/modules/projects/projects.service';

describe('RecommendationService', () => {
  let service: RecommendationService;
  let vectorService: jest.Mocked<VectorService>;
  let embeddingService: jest.Mocked<EmbeddingService>;
  let projectsService: jest.Mocked<ProjectsService>;

  beforeEach(async () => {
    const mockVectorService = {
      searchByVector: jest.fn(),
    };
    const mockEmbeddingService = {
      generateEmbedding: jest.fn(),
    };
    const mockProjectsService = {
      getProjectBySlug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        { provide: VectorService, useValue: mockVectorService },
        { provide: EmbeddingService, useValue: mockEmbeddingService },
        { provide: ProjectsService, useValue: mockProjectsService },
      ],
    }).compile();

    service = module.get<RecommendationService>(RecommendationService);
    vectorService = module.get(VectorService) as any;
    embeddingService = module.get(EmbeddingService) as any;
    projectsService = module.get(ProjectsService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty array if project is not found', async () => {
    projectsService.getProjectBySlug.mockResolvedValue(null as any);
    const result = await service.getSimilarProjects('non-existent');
    expect(result).toEqual([]);
    expect(embeddingService.generateEmbedding).not.toHaveBeenCalled();
  });

  it('should return similar projects excluding the source project', async () => {
    const mockProject = {
      slug: 'test-project',
      title: 'Test',
      description: 'Desc',
      services: ['web'],
    };
    projectsService.getProjectBySlug.mockResolvedValue(mockProject as any);
    embeddingService.generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3] as any);

    vectorService.searchByVector.mockResolvedValue({
      results: [
        { payload: { slug: 'test-project', title: 'Test', category: 'cat' }, score: 1.0 },
        { payload: { slug: 'other-project', title: 'Other', category: 'cat' }, score: 0.9 },
      ],
    } as any);

    const result = await service.getSimilarProjects('test-project');
    expect(result).toEqual([
      { slug: 'other-project', title: 'Other', category: 'cat', score: 0.9 },
    ]);
    expect(vectorService.searchByVector).toHaveBeenCalledWith('projects', [0.1, 0.2, 0.3], 6);
  });

  it('should handle errors gracefully and return empty array', async () => {
    projectsService.getProjectBySlug.mockRejectedValue(new Error('DB Error'));
    const result = await service.getSimilarProjects('test-project');
    expect(result).toEqual([]);
  });
});
