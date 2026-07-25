import './setup';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import request from 'supertest';
import { ProjectsController } from '../src/modules/projects/projects.controller';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { RecommendationService } from '../src/modules/vector/recommendation.service';
import { StrapiProjectSyncService } from '../src/modules/odoo/strapi-project-sync.service';
import { OdooApiService } from '../src/modules/odoo/odoo-api.service';

import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockProjectsService = {
  getProjectBySlug: vi.fn(),
  getAllProjects: vi.fn(),
};

const mockRecommendationService = {
  getSimilarProjects: vi.fn(),
};

const mockStrapiProjectSync = {
  syncPortfolioToOdoo: vi.fn(),
  syncOdooProjectToStrapi: vi.fn(),
  getMapping: vi.fn(),
  createStrapiProject: vi.fn(),
};

const mockOdooApi = {
  updateProject: vi.fn(),
};

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const existingProject = {
  id: '42',
  title: 'Seaside Villa',
  slug: 'seaside-villa',
  description: 'A beautiful seaside villa',
  client: 'Client A',
  services: ['architecture', 'interior'],
  coverImage: '',
  hotspots: [],
  isPublished: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const createBody = {
  title: 'New Project',
  slug: 'new-project',
  description: 'A brand new project',
  client: 'Client B',
  services: ['architecture', 'landscape'],
};

const mapping = {
  slug: 'seaside-villa',
  strapiId: 42,
  odooId: 100,
  lastSyncedAt: Date.now(),
  syncedFrom: 'strapi' as const,
};

describe('ProjectsController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: RecommendationService, useValue: mockRecommendationService },
        { provide: StrapiProjectSyncService, useValue: mockStrapiProjectSync },
        { provide: OdooApiService, useValue: mockOdooApi },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: ['1', VERSION_NEUTRAL],
    });
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  // ===========================================================================
  // GET /projects — findAll
  // ===========================================================================
  describe('GET /api/projects', () => {
    it('returns all projects with pagination', async () => {
      const projectResponse = {
        total: 2,
        projects: [existingProject],
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      mockProjectsService.getAllProjects.mockResolvedValueOnce(projectResponse);

      const res = await request(app.getHttpServer()).get('/api/projects');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(projectResponse);
      expect(mockProjectsService.getAllProjects).toHaveBeenCalledWith(1, 20, undefined);
    });

    it('passes page, limit, and locale query params', async () => {
      mockProjectsService.getAllProjects.mockResolvedValueOnce({ total: 0, projects: [], page: 2, limit: 5, totalPages: 0 });

      await request(app.getHttpServer()).get('/api/projects?page=2&limit=5&locale=en');

      expect(mockProjectsService.getAllProjects).toHaveBeenCalledWith(2, 5, 'en');
    });

    it('propagates service errors', async () => {
      mockProjectsService.getAllProjects.mockRejectedValueOnce(new Error('CMS unavailable'));

      const res = await request(app.getHttpServer()).get('/api/projects');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // GET /api/projects/:slug — findOne
  // ===========================================================================
  describe('GET /api/projects/:slug', () => {
    it('returns a project by slug', async () => {
      mockProjectsService.getProjectBySlug.mockResolvedValueOnce(existingProject);

      const res = await request(app.getHttpServer()).get('/api/projects/seaside-villa');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(existingProject);
      expect(mockProjectsService.getProjectBySlug).toHaveBeenCalledWith('seaside-villa', undefined);
    });

    it('passes locale query param', async () => {
      mockProjectsService.getProjectBySlug.mockResolvedValueOnce(existingProject);

      await request(app.getHttpServer()).get('/api/projects/seaside-villa?locale=ar');

      expect(mockProjectsService.getProjectBySlug).toHaveBeenCalledWith('seaside-villa', 'ar');
    });

    it('propagates service errors', async () => {
      mockProjectsService.getProjectBySlug.mockRejectedValueOnce(new Error('Not found'));

      const res = await request(app.getHttpServer()).get('/api/projects/unknown');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // GET /api/projects/:slug/similar — findSimilar
  // ===========================================================================
  describe('GET /api/projects/:slug/similar', () => {
    const similarResults = [
      { slug: 'project-a', title: 'Project A', category: 'residential', score: 0.95 },
      { slug: 'project-b', title: 'Project B', category: 'residential', score: 0.87 },
    ];

    it('returns similar projects', async () => {
      mockRecommendationService.getSimilarProjects.mockResolvedValueOnce(similarResults);

      const res = await request(app.getHttpServer()).get('/api/projects/seaside-villa/similar');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(similarResults);
      expect(mockRecommendationService.getSimilarProjects).toHaveBeenCalledWith('seaside-villa', 5);
    });

    it('passes custom limit', async () => {
      mockRecommendationService.getSimilarProjects.mockResolvedValueOnce([similarResults[0]]);

      await request(app.getHttpServer()).get('/api/projects/seaside-villa/similar?limit=1');

      expect(mockRecommendationService.getSimilarProjects).toHaveBeenCalledWith('seaside-villa', 1);
    });

    it('propagates service errors', async () => {
      mockRecommendationService.getSimilarProjects.mockRejectedValueOnce(new Error('Vector error'));

      const res = await request(app.getHttpServer()).get('/api/projects/seaside-villa/similar');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // POST /api/projects — create
  // ===========================================================================
  describe('POST /api/projects', () => {
    it('creates a project when slug does not exist', async () => {
      mockProjectsService.getProjectBySlug.mockRejectedValueOnce(new Error('Not found'));
      mockStrapiProjectSync.createStrapiProject.mockResolvedValueOnce(99);
      mockStrapiProjectSync.syncPortfolioToOdoo.mockResolvedValueOnce(200);

      const res = await request(app.getHttpServer())
        .post('/api/projects')
        .send(createBody)
        .expect(201);

      expect(res.body).toEqual({ slug: 'new-project', strapiId: 99, odooId: 200 });
      expect(mockStrapiProjectSync.createStrapiProject).toHaveBeenCalledWith(createBody);
      expect(mockStrapiProjectSync.syncPortfolioToOdoo).toHaveBeenCalledWith('new-project');
    });

    it('syncs existing project when slug already exists', async () => {
      mockProjectsService.getProjectBySlug.mockResolvedValueOnce(existingProject);
      mockStrapiProjectSync.syncPortfolioToOdoo.mockResolvedValueOnce(200);
      mockStrapiProjectSync.getMapping.mockResolvedValueOnce(mapping);

      const res = await request(app.getHttpServer())
        .post('/api/projects')
        .send(createBody)
        .expect(201);

      expect(res.body).toEqual({ slug: 'new-project', strapiId: 42, odooId: 200 });
      expect(mockStrapiProjectSync.createStrapiProject).not.toHaveBeenCalled();
      expect(mockStrapiProjectSync.syncPortfolioToOdoo).toHaveBeenCalledWith('new-project');
    });

    it('returns proper response shape with slug, strapiId, odooId', async () => {
      mockProjectsService.getProjectBySlug.mockRejectedValueOnce(new Error('Not found'));
      mockStrapiProjectSync.createStrapiProject.mockResolvedValueOnce(99);
      mockStrapiProjectSync.syncPortfolioToOdoo.mockResolvedValueOnce(200);

      const res = await request(app.getHttpServer())
        .post('/api/projects')
        .send(createBody)
        .expect(201);

      expect(res.body).toHaveProperty('slug', 'new-project');
      expect(res.body).toHaveProperty('strapiId');
      expect(res.body).toHaveProperty('odooId');
      expect(typeof res.body.strapiId).toBe('number');
    });

    it('propagates services array in the body', async () => {
      mockProjectsService.getProjectBySlug.mockRejectedValueOnce(new Error('Not found'));
      mockStrapiProjectSync.createStrapiProject.mockResolvedValueOnce(99);
      mockStrapiProjectSync.syncPortfolioToOdoo.mockResolvedValueOnce(200);

      const bodyWithServices = { ...createBody, services: ['architecture', 'interior', 'landscape'] };

      await request(app.getHttpServer())
        .post('/api/projects')
        .send(bodyWithServices)
        .expect(201);

      expect(mockStrapiProjectSync.createStrapiProject).toHaveBeenCalledWith(bodyWithServices);
    });

    it('propagates service errors', async () => {
      mockProjectsService.getProjectBySlug.mockRejectedValueOnce(new Error('Not found'));
      mockStrapiProjectSync.createStrapiProject.mockRejectedValueOnce(new Error('Strapi error'));

      const res = await request(app.getHttpServer())
        .post('/api/projects')
        .send(createBody);

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // PATCH /api/projects/:slug/status — updateStatus
  // ===========================================================================
  describe('PATCH /api/projects/:slug/status', () => {
    it('updates Odoo stage_id and syncs back when mapping exists', async () => {
      mockStrapiProjectSync.getMapping.mockResolvedValueOnce(mapping);
      mockOdooApi.updateProject.mockResolvedValueOnce(undefined);
      mockStrapiProjectSync.syncOdooProjectToStrapi.mockResolvedValueOnce(undefined);

      const res = await request(app.getHttpServer())
        .patch('/api/projects/seaside-villa/status')
        .send({ status: 'completed' })
        .expect(200);

      expect(res.body).toEqual({ slug: 'seaside-villa', status: 'completed' });
      expect(mockOdooApi.updateProject).toHaveBeenCalledWith(100, { stage_id: 4 });
      expect(mockStrapiProjectSync.syncOdooProjectToStrapi).toHaveBeenCalledWith(100);
    });

    it('syncs from Strapi first when no Odoo mapping exists', async () => {
      mockStrapiProjectSync.getMapping.mockResolvedValueOnce(null);
      mockStrapiProjectSync.syncPortfolioToOdoo.mockResolvedValueOnce(200);
      mockOdooApi.updateProject.mockResolvedValueOnce(undefined);

      const res = await request(app.getHttpServer())
        .patch('/api/projects/seaside-villa/status')
        .send({ status: 'in_progress' })
        .expect(200);

      expect(res.body).toEqual({ slug: 'seaside-villa', status: 'in_progress' });
      expect(mockStrapiProjectSync.syncPortfolioToOdoo).toHaveBeenCalledWith('seaside-villa');
      expect(mockOdooApi.updateProject).toHaveBeenCalledWith(200, { stage_id: 2 });
      expect(mockStrapiProjectSync.syncOdooProjectToStrapi).not.toHaveBeenCalled();
    });

    it('throws for invalid status value', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/projects/seaside-villa/status')
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(500);
    });

    it('propagates service errors', async () => {
      mockStrapiProjectSync.getMapping.mockRejectedValueOnce(new Error('Redis error'));

      const res = await request(app.getHttpServer())
        .patch('/api/projects/seaside-villa/status')
        .send({ status: 'completed' });

      expect(res.status).toBe(500);
    });
  });
});
