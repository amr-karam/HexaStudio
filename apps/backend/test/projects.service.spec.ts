import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { OdooService } from '../src/modules/odoo/odoo.service';
import { RedisService } from '../src/modules/storage/redis.service';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let httpService: HttpService;

  const mockProject = {
    id: 1,
    title: 'Test Project',
    slug: 'test-project',
    description: 'A test project description',
    shortDescription: 'Short desc',
    coverImage: null,
    category: { id: 1, name: 'Residential', slug: 'residential' },
    modelUrl: null,
    hotspots: [],
    client: 'Test Client',
    location: 'Test Location',
    year: 2026,
    area: '2000 sqft',
    services: ['Architecture', 'Interior'],
    isPublished: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: HttpService,
          useValue: { get: vi.fn() },
        },
        {
          provide: OdooService,
          useValue: { searchRead: vi.fn().mockResolvedValue([]) },
        },
        {
          provide: RedisService,
          useValue: {
            get: vi.fn().mockResolvedValue(null),
            set: vi.fn().mockResolvedValue(undefined),
            del: vi.fn().mockResolvedValue(undefined),
            exists: vi.fn().mockResolvedValue(0),
            expire: vi.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('getAllProjects returns mapped projects', async () => {
    vi.mocked(httpService.get).mockReturnValueOnce(
      of({
        data: {
          data: [mockProject],
          meta: { pagination: { total: 1 } },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }),
    );

    const result = await service.getAllProjects();
    expect(result.total).toBe(1);
    expect(result.projects[0].title).toBe('Test Project');
    expect(result.projects[0].slug).toBe('test-project');
  });

  it('getProjectBySlug returns single project', async () => {
    vi.mocked(httpService.get).mockReturnValueOnce(
      of({
        data: { data: [mockProject] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }),
    );

    const result = await service.getProjectBySlug('test-project');
    expect(result.title).toBe('Test Project');
  });

  it('getProjectBySlug throws NotFoundException for missing slug', async () => {
    vi.mocked(httpService.get).mockReturnValueOnce(
      of({
        data: { data: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }),
    );

    await expect(service.getProjectBySlug('nonexistent')).rejects.toThrow(NotFoundException);
  });
});
