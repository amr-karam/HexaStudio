import { Test, TestingModule } from '@nestjs/testing';
import { VectorSyncService } from '../../src/modules/vector/vector-sync.service';
import { EmbeddingService } from '../../src/modules/ai/embedding.service';
import { ProjectsService } from '../../src/modules/projects/projects.service';
import { HttpService } from '@nestjs/axios';
import { OdooService } from '../../src/modules/odoo/odoo.service';
import { RedisService } from '../../src/modules/storage/redis.service';
import { ConfigService } from '@nestjs/config';

describe('VectorSyncService', () => {
  let service: VectorSyncService;
  let mockEmbeddingService: any;
  let mockProjectsService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockEmbeddingService = { embedProject: vi.fn().mockResolvedValue(undefined) };
    mockProjectsService = { 
      getProjectBySlug: vi.fn(),
      getAllProjects: vi.fn().mockResolvedValue({ projects: [] }),
    };
    mockConfigService = { get: vi.fn().mockReturnValue({
      VECTOR_HOST: 'localhost',
      VECTOR_PORT: 6333,
      VECTOR_API_KEY: '',
    }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VectorSyncService,
        { provide: EmbeddingService, useValue: mockEmbeddingService },
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<VectorSyncService>(VectorSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncProject', () => {
    it('should embed the project', async () => {
      const project = { id: '1', slug: 'test', title: 'T', description: 'D', services: [] };
      mockProjectsService.getProjectBySlug.mockResolvedValue(project);
      await service.syncProject('test');
      expect(mockEmbeddingService.embedProject).toHaveBeenCalledWith(project);
    });
  });

  describe('syncAllProjects', () => {
    it('should embed all projects', async () => {
      const projects = [{ id: '1', slug: 'p1' }, { id: '2', slug: 'p2' }];
      mockProjectsService.getAllProjects.mockResolvedValue({ projects });
      await service.syncAllProjects();
      expect(mockEmbeddingService.embedProject).toHaveBeenCalledTimes(projects.length);
    });
  });
});
