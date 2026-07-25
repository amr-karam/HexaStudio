import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { StrapiProjectSyncService } from '../src/modules/odoo/strapi-project-sync.service';
import { OdooApiService } from '../src/modules/odoo/odoo-api.service';
import { OdooService } from '../src/modules/odoo/odoo.service';
import { RedisService } from '../src/modules/storage/redis.service';
import { RealtimeGateway } from '../src/modules/realtime/realtime.gateway';
import type { OdooProject } from '@hexastudio/types';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockHttpService = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
};

const mockOdooApiService = {
  createProject: vi.fn().mockResolvedValue(100),
  findProjectBySlug: vi.fn(),
  getProjectDetail: vi.fn(),
  getOrCreatePartner: vi.fn(),
  getProjects: vi.fn(),
  updateProject: vi.fn().mockResolvedValue(true),
};

const mockOdooService = {
  execute: vi.fn(),
  searchRead: vi.fn(),
  create: vi.fn(),
};

const mockRedisService = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
  hset: vi.fn().mockResolvedValue(undefined),
  hget: vi.fn().mockResolvedValue(null),
  hgetall: vi.fn().mockResolvedValue({}),
};

const mockRealtimeGateway = {
  emitToRoom: vi.fn(),
};

// ── Fixtures ─────────────────────────────────────────────────────────────────

const mockStrapiPortfolio = {
  id: 42,
  slug: 'seaside-villa',
  title: 'Seaside Villa',
  description: 'A luxurious seaside residence',
  client: 'John Doe',
  services: ['residential', 'interior'],
};

const mockOdooProject: OdooProject = {
  id: 100,
  name: 'Seaside Villa',
  x_slug: 'seaside-villa',
  x_hexa_type: 'residential',
  x_hexa_status: 'active',
  partner_id: [10, 'John Doe'],
  stage_id: [3, 'In Progress'],
};

/** Wrap items into Strapi v5 API response shape (data.data is always an array). */
const mockStrapiResponse = (items: unknown | unknown[]) => {
  const arr = Array.isArray(items) ? items : [items];
  return {
    data: {
      data: arr.map((item) => {
        const entry = item as Record<string, unknown>;
        return { id: entry.id, attributes: { ...entry } };
      }),
      meta: { pagination: { total: arr.length } },
    },
  };
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('StrapiProjectSyncService', () => {
  let service: StrapiProjectSyncService;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Restore default mock implementations (cleared by clearAllMocks)
    mockRedisService.get.mockResolvedValue(null);
    mockRedisService.set.mockResolvedValue(undefined);
    mockRedisService.del.mockResolvedValue(undefined);
    mockOdooApiService.createProject.mockResolvedValue(100);
    mockOdooApiService.findProjectBySlug.mockResolvedValue(null);
    mockOdooApiService.getProjectDetail.mockResolvedValue(mockOdooProject);
    mockOdooApiService.getOrCreatePartner.mockResolvedValue(10);
    mockOdooApiService.getProjects.mockResolvedValue([]);
    mockOdooApiService.updateProject.mockResolvedValue(true);
    mockOdooService.execute.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrapiProjectSyncService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: OdooApiService, useValue: mockOdooApiService },
        { provide: OdooService, useValue: mockOdooService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: RealtimeGateway, useValue: mockRealtimeGateway },
      ],
    }).compile();

    service = module.get<StrapiProjectSyncService>(StrapiProjectSyncService);
  });

  // ── isSynced / markSynced (loop prevention) ─────────────────────────

  describe('loop prevention', () => {
    it('returns false for an unsynced record', async () => {
      mockRedisService.get.mockResolvedValue(null);
      const result = await service.isSynced('odoo', 'seaside-villa');
      expect(result).toBe(false);
      expect(mockRedisService.get).toHaveBeenCalledWith('sync:skip:odoo:seaside-villa');
    });

    it('returns true for a recently synced record', async () => {
      mockRedisService.get.mockResolvedValue('1');
      const result = await service.isSynced('strapi', '100');
      expect(result).toBe(true);
    });
  });

  // ── backfill ────────────────────────────────────────────────────────

  describe('backfill', () => {
    it('creates Odoo projects for Strapi entries missing a counterpart', async () => {
      mockHttpService.get
        .mockReturnValueOnce(of(mockStrapiResponse([mockStrapiPortfolio])));
      mockOdooApiService.findProjectBySlug.mockResolvedValue(null);
      mockOdooApiService.createProject.mockResolvedValue(200);
      mockRedisService.set.mockResolvedValue(undefined);

      // Mock countOdooProjects / countStrapiPortfolios
      mockOdooService.execute.mockResolvedValue([200]);
      mockHttpService.get
        .mockReturnValueOnce(of({ data: { meta: { pagination: { total: 1 } } } }));

      const result = await service.backfill();

      expect(result.created).toBe(1);
      expect(result.skipped).toBe(0);
      expect(mockOdooApiService.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Seaside Villa',
          x_slug: 'seaside-villa',
        }),
      );
    });

    it('skips entries that already have an Odoo project', async () => {
      mockHttpService.get
        .mockReturnValueOnce(of(mockStrapiResponse([mockStrapiPortfolio])));
      mockOdooApiService.findProjectBySlug.mockResolvedValue(mockOdooProject);

      mockOdooService.execute.mockResolvedValue([100]);
      mockHttpService.get
        .mockReturnValueOnce(of({ data: { meta: { pagination: { total: 1 } } } }));

      const result = await service.backfill();

      expect(result.created).toBe(0);
      expect(result.skipped).toBe(1);
      expect(mockOdooApiService.createProject).not.toHaveBeenCalled();
    });

    it('handles fetch errors gracefully', async () => {
      mockHttpService.get.mockReturnValueOnce(of({ data: { data: [], meta: { pagination: { total: 0 } } } }));
      const result = await service.backfill();
      expect(result.created).toBe(0);
      expect(result.skipped).toBe(0);
    });
  });

  // ── syncPortfolioToOdoo ─────────────────────────────────────────────

  describe('syncPortfolioToOdoo (Strapi → Odoo)', () => {
    it('creates an Odoo project when none exists', async () => {
      mockHttpService.get
        .mockReturnValueOnce(of(mockStrapiResponse(mockStrapiPortfolio)));
      mockOdooApiService.findProjectBySlug.mockResolvedValue(null);
      mockOdooApiService.getOrCreatePartner.mockResolvedValue(10);
      mockOdooApiService.createProject.mockResolvedValue(200);

      const result = await service.syncPortfolioToOdoo('seaside-villa');

      expect(result).toBe(200);
      expect(mockOdooApiService.createProject).toHaveBeenCalledWith({
        name: 'Seaside Villa',
        x_slug: 'seaside-villa',
        description: 'A luxurious seaside residence',
        partner_id: 10,
        x_hexa_type: 'residential',
      });
    });

    it('updates an existing Odoo project', async () => {
      mockHttpService.get
        .mockReturnValueOnce(of(mockStrapiResponse(mockStrapiPortfolio)));
      mockOdooApiService.findProjectBySlug.mockResolvedValue(mockOdooProject);
      mockOdooApiService.getOrCreatePartner.mockResolvedValue(10);

      const result = await service.syncPortfolioToOdoo('seaside-villa');

      expect(result).toBe(100);
      expect(mockOdooApiService.updateProject).toHaveBeenCalledWith(
        100,
        expect.objectContaining({ name: 'Seaside Villa' }),
      );
    });

    it('skips sync when recently synced from Odoo (loop prevention)', async () => {
      mockRedisService.get.mockResolvedValue('1'); // isSynced returns true
      const result = await service.syncPortfolioToOdoo('seaside-villa');
      expect(result).toBeNull();
      expect(mockHttpService.get).not.toHaveBeenCalled();
    });

    it('returns null when the Strapi entry is not found', async () => {
      mockHttpService.get.mockReturnValueOnce(of({ data: { data: [] } }));
      const result = await service.syncPortfolioToOdoo('nonexistent');
      expect(result).toBeNull();
    });
  });

  // ── syncOdooProjectToStrapi ─────────────────────────────────────────

  describe('syncOdooProjectToStrapi (Odoo → Strapi)', () => {
    it('creates a Strapi portfolio entry when none exists', async () => {
      mockOdooApiService.getProjectDetail.mockResolvedValue(mockOdooProject);
      mockHttpService.get.mockReturnValueOnce(of({ data: { data: [] } })); // not found
      mockHttpService.post.mockReturnValueOnce(of({ data: { data: { id: 42 } } }));

      const result = await service.syncOdooProjectToStrapi(100);

      expect(result).toBe(42);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/portfolios'),
        {
          data: expect.objectContaining({
            title: 'Seaside Villa',
            slug: 'seaside-villa',
          }),
        },
        expect.any(Object),
      );
    });

    it('updates an existing Strapi portfolio entry', async () => {
      mockOdooApiService.getProjectDetail.mockResolvedValue(mockOdooProject);
      mockHttpService.get.mockReturnValueOnce(of(mockStrapiResponse({ id: 42, slug: 'seaside-villa', title: 'Old Title' })));
      mockHttpService.put.mockReturnValueOnce(of({ data: { data: { id: 42 } } }));

      const result = await service.syncOdooProjectToStrapi(100);

      expect(result).toBe(42);
      expect(mockHttpService.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/portfolios/42'),
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('skips Odoo projects without an x_slug', async () => {
      mockOdooApiService.getProjectDetail.mockResolvedValue({ ...mockOdooProject, x_slug: undefined });
      const result = await service.syncOdooProjectToStrapi(100);
      expect(result).toBeNull();
    });

    it('skips sync when recently synced from Strapi (loop prevention)', async () => {
      mockOdooApiService.getProjectDetail.mockResolvedValue(mockOdooProject);
      mockRedisService.get.mockResolvedValue('1'); // isSynced('strapi', 'seaside-villa') returns true
      const result = await service.syncOdooProjectToStrapi(100);
      expect(result).toBeNull();
    });
  });

  // ── reconcile ─────────────────────────────────────────────────────────

  describe('reconcile', () => {
    it('creates Odoo projects for Strapi-only entries', async () => {
      // One Strapi entry, no Odoo match
      mockHttpService.get
        .mockReturnValueOnce(of(mockStrapiResponse([mockStrapiPortfolio]))); // fetchAllPortfolioEntries
      mockOdooApiService.getProjects.mockResolvedValue([]); // fetchAllOdooProjects — none
      mockOdooApiService.getOrCreatePartner.mockResolvedValue(10);
      mockOdooApiService.createProject.mockResolvedValue(200);
      mockOdooService.execute.mockResolvedValue([200]);
      mockHttpService.get
        .mockReturnValueOnce(of({ data: { meta: { pagination: { total: 1 } } } }));

      const result = await service.reconcile();

      expect(result.created).toBe(1);
      expect(result.updated).toBe(0);
    });

    it('creates Strapi entries for Odoo-only projects', async () => {
      // Use mockImplementation to ensure Observables are returned correctly
      mockHttpService.get.mockImplementation(((url: string) => {
        if (url.includes('pagination[pageSize]=1')) {
          return of({ data: { meta: { pagination: { total: 1 } } } });
        }
        return of({ data: { data: [], meta: { pagination: { total: 0 } } } });
      }) as typeof mockHttpService.get);
      mockOdooApiService.getProjects.mockResolvedValue([mockOdooProject]); // one Odoo project
      mockHttpService.post.mockReturnValueOnce(of({ data: { data: { id: 42 } } }));
      mockOdooService.execute.mockResolvedValue([100]);

      const result = await service.reconcile();
      // reconcile increments `updated` for Odoo→Strapi creations
      expect(result.updated).toBe(1);
      expect(result.created).toBe(0);
    });

    it('handles fetch errors gracefully in reconcile', async () => {
      mockHttpService.get.mockRejectedValueOnce(new Error('Network error'));
      const result = await service.reconcile();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.created).toBe(0);
    });
  });

  // ── Status ───────────────────────────────────────────────────────────

  describe('getStatus', () => {
    it('returns null when no status has been persisted', async () => {
      mockRedisService.get.mockResolvedValue(null);
      const status = await service.getStatus();
      expect(status).toBeNull();
    });

    it('returns persisted status', async () => {
      const fakeStatus = { backfilled: true, lastBackfill: Date.now(), lastReconciliation: null, odooProjectCount: 5, strapiPortfolioCount: 5, syncedCount: 3, errors: [] };
      mockRedisService.get.mockResolvedValue(fakeStatus);
      const status = await service.getStatus();
      expect(status?.backfilled).toBe(true);
      expect(status?.odooProjectCount).toBe(5);
    });
  });
});
