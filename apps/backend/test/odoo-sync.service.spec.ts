import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { OdooSyncService } from '../src/modules/odoo/odoo-sync.service';
import { OdooService } from '../src/modules/odoo/odoo.service';
import { RedisService } from '../src/modules/storage/redis.service';
import { EventBus } from '../src/modules/realtime/event-bus.service';
import { WebhookRetryService } from '../src/modules/odoo/webhook-retry.service';
import { ConflictResolutionService } from '../src/modules/odoo/conflict-resolution.service';
import { DeltaSyncService } from '../src/modules/odoo/delta-sync.service';
import { StrapiProjectSyncService } from '../src/modules/odoo/strapi-project-sync.service';
import type {
  OdooWebhookPayload,
  SyncConflict,
  SyncOperationResult,
  SyncStatusResponse,
} from '@hexastudio/types';

// ── Mock objects ──────────────────────────────────────────────────────────────

const mockRedisService = {
  set: vi.fn().mockResolvedValue(undefined),
  get: vi.fn(),
  del: vi.fn().mockResolvedValue(undefined),
  llen: vi.fn().mockResolvedValue(0),
  lrange: vi.fn().mockResolvedValue([]),
  lrem: vi.fn().mockResolvedValue(undefined),
  lpush: vi.fn().mockResolvedValue(undefined),
  flush: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
};

const mockEventBus = {
  emit: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
};

const mockOdooService = {
  searchRead: vi.fn(),
  create: vi.fn(),
};

const mockWebhookRetryService = {
  enqueue: vi.fn().mockResolvedValue(undefined),
};

const mockConflictResolutionService = {
  detectConflict: vi.fn(),
  autoResolve: vi.fn(),
  getUnresolvedConflicts: vi.fn().mockResolvedValue([]),
  resolveConflict: vi.fn(),
  getAllConflicts: vi.fn().mockResolvedValue([]),
  getAuditLog: vi.fn().mockResolvedValue([]),
};

const mockDeltaSyncService = {
  syncAll: vi.fn().mockResolvedValue([]),
  syncEntityDelta: vi.fn(),
  syncEntityFull: vi.fn(),
  getCursor: vi.fn().mockResolvedValue(null),
  getSyncStatus: vi.fn(),
  getAllCursors: vi.fn().mockResolvedValue({}),
  resetCursor: vi.fn().mockResolvedValue(undefined),
};

const mockStrapiProjectSyncService = {
  syncOdooProjectToStrapi: vi.fn().mockResolvedValue(null),
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const makePayload = (overrides: Partial<OdooWebhookPayload> = {}): OdooWebhookPayload => ({
  model: 'project.project',
  id: 1,
  action: 'update',
  ...overrides,
});

const projectPayload  = makePayload({ model: 'project.project', id: 42 });
const leadPayload     = makePayload({ model: 'crm.lead',       id: 7 });
const invoicePayload  = makePayload({ model: 'account.move',  id: 13 });
const syncPayload     = makePayload({ model: 'sync',          id: 0 });
const unknownPayload  = makePayload({ model: 'unknown.model', id: 99 });

const okResult = (entityType: string, recordsProcessed: number): SyncOperationResult => ({
  entityType,
  recordsProcessed,
  conflictsDetected: 0,
  durationMs: 10,
  success: true,
});

const pendingConflict: SyncConflict = {
  id: 'conflict-1',
  entityType: 'crm.lead',
  entityId: 7,
  odooVersion: { name: 'Odoo lead' },
  hexaVersion: { name: 'Hexa lead' },
  detectedAt: '2026-01-02T00:00:00.000Z',
  resolution: 'pending',
  conflictingFields: ['name'],
};

// ── Suite ──────────────────────────────────────────────────────────────────────

describe('OdooSyncService', () => {
  let service: OdooSyncService;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Re-establish stable defaults so one-time / persistent overrides can
    // never leak between tests.
    mockRedisService.llen.mockReset().mockResolvedValue(0);
    mockRedisService.lrange.mockReset().mockResolvedValue([]);
    mockDeltaSyncService.syncAll.mockReset().mockResolvedValue([]);
    mockConflictResolutionService.getUnresolvedConflicts.mockReset().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OdooSyncService,
        { provide: OdooService,   useValue: mockOdooService },
        { provide: RedisService,  useValue: mockRedisService },
        { provide: EventBus,      useValue: mockEventBus },
        { provide: WebhookRetryService, useValue: mockWebhookRetryService },
        { provide: ConflictResolutionService, useValue: mockConflictResolutionService },
        { provide: DeltaSyncService, useValue: mockDeltaSyncService },
        { provide: StrapiProjectSyncService, useValue: mockStrapiProjectSyncService },
      ],
    }).compile();

    service = module.get<OdooSyncService>(OdooSyncService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ──────────────────────────────────────────────────────────────────────────────
  //  1  onModuleInit
  // ──────────────────────────────────────────────────────────────────────────────

  describe('onModuleInit', () => {
    it('calls pullAll immediately and sets up interval with correct delay', () => {
      vi.useFakeTimers();
      const pullAllSpy = vi.spyOn(service, 'pullAll').mockResolvedValue(undefined);
      const setIntervalSpy = vi.spyOn(global, 'setInterval');

      service.onModuleInit();

      expect(pullAllSpy).toHaveBeenCalledTimes(1);
      expect(setIntervalSpy).toHaveBeenCalledTimes(1);
      // SYNC_INTERVAL_MS = 10 * 60 * 1000 = 600 000
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 600_000);

      vi.useRealTimers();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  //  2  handleWebhook — project.project
  // ──────────────────────────────────────────────────────────────────────────────

  describe('handleWebhook (project.project)', () => {
    it('caches payload, fetches project from Odoo, caches enriched data, emits event', async () => {
      const projectData = [
        { id: 42, name: 'Seaside Villa', stage_id: [3, 'In Progress'] as [number, string] },
      ];
      mockOdooService.searchRead.mockResolvedValueOnce(projectData);

      await service.handleWebhook(projectPayload);

      // 1. Raw webhook payload cached
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'odoo:sync:project.project:42',
        projectPayload,
        3600,
      );

      // 2. Odoo called for enriched data
      expect(mockOdooService.searchRead).toHaveBeenCalledWith(
        'project.project',
        [['id', '=', 42]],
        [
          'name', 'stage_id', 'x_slug', 'x_hexa_status', 'x_hexa_type',
          'x_hexa_client_portal_active', 'write_date', 'create_date',
        ],
      );

      // 3. Enriched data cached with shorter TTL
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'odoo:project:42',
        projectData[0],
        900,
      );

      // 4. Domain event emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('odoo:project', projectPayload);
    });

    it('still emits event when Odoo returns empty (no enriched data to cache)', async () => {
      mockOdooService.searchRead.mockResolvedValueOnce([]);

      await service.handleWebhook(projectPayload);

      // Raw webhook cached
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'odoo:sync:project.project:42',
        projectPayload,
        3600,
      );

      // No second set call for project data
      expect(mockRedisService.set).toHaveBeenCalledTimes(1);

      // Event still emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('odoo:project', projectPayload);
    });

    it('auto-resolves a conflict when a cached HEXA version differs', async () => {
      const projectData = [
        {
          id: 42,
          name: 'Seaside Villa',
          stage_id: [3, 'In Progress'] as [number, string],
          write_date: '2026-01-02T00:00:00Z',
        },
      ];
      const hexaCached = { id: 42, name: 'Old Villa Name' };

      mockOdooService.searchRead.mockResolvedValueOnce(projectData);
      mockRedisService.get.mockResolvedValueOnce(hexaCached);
      mockDeltaSyncService.getCursor.mockResolvedValueOnce({
        entityType: 'project.project',
        lastSyncAt: '2026-01-01T00:00:00.000Z',
        lastSyncId: 0,
        recordsSynced: 0,
        errors: 0,
      });
      mockConflictResolutionService.detectConflict.mockResolvedValueOnce(pendingConflict);
      mockConflictResolutionService.autoResolve.mockResolvedValueOnce({
        ...pendingConflict,
        resolution: 'odoo-wins',
      });

      await service.handleWebhook(projectPayload);

      expect(mockConflictResolutionService.detectConflict).toHaveBeenCalledWith(
        'project.project',
        42,
        projectData[0],
        hexaCached,
        '2026-01-01T00:00:00.000Z',
      );
      expect(mockConflictResolutionService.autoResolve).toHaveBeenCalledWith(pendingConflict);
      // Odoo version is still cached as the source of truth.
      expect(mockRedisService.set).toHaveBeenCalledWith('odoo:project:42', projectData[0], 900);
      expect(mockEventBus.emit).toHaveBeenCalledWith('odoo:project', projectPayload);
    });

    it('enqueues a retry when the Odoo fetch fails', async () => {
      mockOdooService.searchRead.mockRejectedValueOnce(new Error('Odoo down'));

      await service.handleWebhook(projectPayload);

      expect(mockWebhookRetryService.enqueue).toHaveBeenCalledWith(projectPayload, 'Odoo down');
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  //  3  handleWebhook — crm.lead
  // ──────────────────────────────────────────────────────────────────────────────

  describe('handleWebhook (crm.lead)', () => {
    it('caches payload, fetches lead from Odoo, caches enriched data, emits event', async () => {
      const leadData = [{ id: 7, name: 'New Lead', email_from: 'lead@test.com' }];
      mockOdooService.searchRead.mockResolvedValueOnce(leadData);

      await service.handleWebhook(leadPayload);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        'odoo:sync:crm.lead:7',
        leadPayload,
        3600,
      );

      expect(mockOdooService.searchRead).toHaveBeenCalledWith(
        'crm.lead',
        [['id', '=', 7]],
        [
          'id', 'name', 'stage_id', 'partner_id', 'email_from', 'phone',
          'priority', 'write_date', 'create_date', 'x_hexa_source',
          'x_hexa_service', 'x_hexa_budget', 'description',
        ],
      );

      expect(mockRedisService.set).toHaveBeenCalledWith('odoo:lead:7', leadData[0], 900);
      expect(mockEventBus.emit).toHaveBeenCalledWith('odoo:lead', leadPayload);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  //  4  handleWebhook — account.move
  // ──────────────────────────────────────────────────────────────────────────────

  describe('handleWebhook (account.move)', () => {
    it('caches payload and emits invoice event (read-only, no Odoo fetch)', async () => {
      await service.handleWebhook(invoicePayload);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        'odoo:sync:account.move:13',
        invoicePayload,
        3600,
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith('odoo:invoice', invoicePayload);
      expect(mockOdooService.searchRead).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  //  5  handleWebhook — sync (special model that triggers pullAll)
  // ──────────────────────────────────────────────────────────────────────────────

  describe('handleWebhook (sync)', () => {
    it('triggers pullAll when receiving the sync model', async () => {
      const pullAllSpy = vi.spyOn(service, 'pullAll').mockResolvedValue(undefined);

      await service.handleWebhook(syncPayload);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        'odoo:sync:sync:0',
        syncPayload,
        3600,
      );
      expect(pullAllSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  //  6  handleWebhook — unknown model (graceful degradation)
  // ──────────────────────────────────────────────────────────────────────────────

  describe('handleWebhook (unknown model)', () => {
    it('caches payload, logs debug message, does not emit or fetch', async () => {
      const debugSpy = vi.spyOn(Logger.prototype, 'debug');

      await service.handleWebhook(unknownPayload);

      // Raw payload is always cached regardless of model
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'odoo:sync:unknown.model:99',
        unknownPayload,
        3600,
      );

      // Debug log about unmapped model
      expect(debugSpy).toHaveBeenCalledWith('Unmapped Odoo webhook model: unknown.model');

      // No events emitted for unknown models
      expect(mockEventBus.emit).not.toHaveBeenCalled();

      // No Odoo queries fired
      expect(mockOdooService.searchRead).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  //  7  processRetryWebhook — re-processing without recursive enqueue
  // ──────────────────────────────────────────────────────────────────────────────

  describe('processRetryWebhook', () => {
    it('syncs a project and emits the event without enqueueing another retry', async () => {
      const projectData = [
        { id: 42, name: 'Retry Villa', stage_id: [3, 'In Progress'] as [number, string] },
      ];
      mockOdooService.searchRead.mockResolvedValueOnce(projectData);

      await service.processRetryWebhook(projectPayload);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        'odoo:sync:project.project:42',
        projectPayload,
        3600,
      );
      expect(mockRedisService.set).toHaveBeenCalledWith('odoo:project:42', projectData[0], 900);
      expect(mockEventBus.emit).toHaveBeenCalledWith('odoo:project', projectPayload);
      expect(mockWebhookRetryService.enqueue).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  //  8  getState()  (legacy sync state snapshot)
  // ──────────────────────────────────────────────────────────────────────────────

  describe('getState', () => {
    it('returns default initial state before any sync has occurred', () => {
      const state = service.getState();
      expect(state).toEqual({ lastSync: 0, counts: {} });
    });

    it('returns lastError undefined when no error has occurred', () => {
      const state = service.getState();
      expect(state.lastError).toBeUndefined();
    });

    it('reflects updated counts and timestamp after a successful pullAll', async () => {
      const frozenNow = 1_700_000_000_000;
      vi.setSystemTime(frozenNow);

      mockDeltaSyncService.syncAll.mockResolvedValueOnce([
        okResult('crm.lead', 2),
        okResult('project.project', 1),
        okResult('account.move', 0),
      ]);

      await service.pullAll();

      const state = service.getState();
      expect(state.lastSync).toBe(frozenNow);
      expect(state.counts).toEqual({ 'crm.lead': 2, 'project.project': 1, 'account.move': 0 });
      expect(state.lastError).toBeUndefined();
    });

    it('records lastError on the state object when pullAll fails', async () => {
      mockDeltaSyncService.syncAll.mockRejectedValueOnce(new Error('Odoo connection timeout'));

      await service.pullAll();

      const state = service.getState();
      expect(state.lastError).toBe('Odoo connection timeout');
      // lastSync remains unchanged from default
      expect(state.lastSync).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  //  9  pullAll — scheduled reconciliation via delta sync
  // ──────────────────────────────────────────────────────────────────────────────

  describe('pullAll (scheduled / manual reconciliation)', () => {
    it('delegates to the delta sync service and builds state counts', async () => {
      mockDeltaSyncService.syncAll.mockResolvedValueOnce([
        okResult('crm.lead', 3),
        okResult('project.project', 2),
        okResult('account.move', 1),
      ]);

      await service.pullAll();

      expect(mockDeltaSyncService.syncAll).toHaveBeenCalledWith(false);
      expect(service.getState().counts).toEqual({
        'crm.lead': 3,
        'project.project': 2,
        'account.move': 1,
      });
    });

    it('flushes pending leads that were queued while Odoo was unavailable', async () => {
      // Delta sync returns empty — focus on the flush
      mockDeltaSyncService.syncAll.mockResolvedValueOnce([]);

      // There are 2 pending leads in the Redis queue
      mockRedisService.llen.mockResolvedValueOnce(2);
      mockRedisService.lrange.mockResolvedValueOnce([
        { name: 'Lead Alpha', contact_name: 'Alice' },
        { name: 'Lead Beta', contact_name: 'Bob' },
      ]);

      mockOdooService.create
        .mockResolvedValueOnce(201)
        .mockResolvedValueOnce(202);

      await service.pullAll();

      // Both leads were flushed
      expect(mockOdooService.create).toHaveBeenCalledTimes(2);
      expect(mockOdooService.create).toHaveBeenCalledWith('crm.lead', { name: 'Lead Alpha', contact_name: 'Alice' });
      expect(mockOdooService.create).toHaveBeenCalledWith('crm.lead', { name: 'Lead Beta', contact_name: 'Bob' });

      // Both entries removed from Redis queue
      expect(mockRedisService.lrem).toHaveBeenCalledTimes(2);
      expect(mockRedisService.lrem).toHaveBeenCalledWith('odoo:pending-leads', 1, { name: 'Lead Alpha', contact_name: 'Alice' });
      expect(mockRedisService.lrem).toHaveBeenCalledWith('odoo:pending-leads', 1, { name: 'Lead Beta', contact_name: 'Bob' });
    });

    it('stops flushing on first Odoo create failure and preserves remaining queue', async () => {
      mockDeltaSyncService.syncAll.mockResolvedValueOnce([]);

      mockRedisService.llen.mockResolvedValueOnce(3);
      mockRedisService.lrange.mockResolvedValueOnce([
        { name: 'Good' },
        { name: 'Failing' },
        { name: 'Skipped' },
      ]);

      mockOdooService.create
        .mockResolvedValueOnce(201)
        .mockRejectedValueOnce(new Error('Odoo write rejected'));

      const warnSpy = vi.spyOn(Logger.prototype, 'warn');

      await service.pullAll();

      // First create succeeded, second failed → loop broke
      expect(mockOdooService.create).toHaveBeenCalledTimes(2);
      expect(mockRedisService.lrem).toHaveBeenCalledTimes(1); // only "Good" was removed

      // Warning logged
      expect(warnSpy).toHaveBeenCalledWith('Failed to flush pending lead: Odoo write rejected');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 10  flushPendingLeads — low-level queue drain
  // ──────────────────────────────────────────────────────────────────────────────

  describe('flushPendingLeads', () => {
    it('skips everything when no pending leads exist', async () => {
      mockRedisService.llen.mockResolvedValueOnce(0);

      await service.flushPendingLeads();

      expect(mockRedisService.lrange).not.toHaveBeenCalled();
      expect(mockOdooService.create).not.toHaveBeenCalled();
      expect(mockRedisService.lrem).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 11  triggerSync — manual sync entry point
  // ──────────────────────────────────────────────────────────────────────────────

  describe('triggerSync', () => {
    it('syncs all entities (delta) and flushes pending leads when no entityType is given', async () => {
      const results = [okResult('crm.lead', 5), okResult('project.project', 2)];
      mockDeltaSyncService.syncAll.mockResolvedValueOnce(results);
      const flushSpy = vi.spyOn(service, 'flushPendingLeads').mockResolvedValue(undefined);

      await expect(service.triggerSync({})).resolves.toEqual(results);

      expect(mockDeltaSyncService.syncAll).toHaveBeenCalledWith(false);
      expect(flushSpy).toHaveBeenCalledOnce();
    });

    it('syncs a single entity via delta when entityType is provided', async () => {
      const result = okResult('crm.lead', 3);
      mockDeltaSyncService.syncEntityDelta.mockResolvedValueOnce(result);

      await expect(service.triggerSync({ entityType: 'crm.lead' })).resolves.toEqual([result]);

      expect(mockDeltaSyncService.syncEntityDelta).toHaveBeenCalledWith('crm.lead');
      expect(mockDeltaSyncService.syncAll).not.toHaveBeenCalled();
    });

    it('syncs a single entity via full sync when fullSync is set', async () => {
      const result = okResult('project.project', 9);
      mockDeltaSyncService.syncEntityFull.mockResolvedValueOnce(result);

      await expect(
        service.triggerSync({ entityType: 'project.project', fullSync: true }),
      ).resolves.toEqual([result]);

      expect(mockDeltaSyncService.syncEntityFull).toHaveBeenCalledWith('project.project');
      expect(mockDeltaSyncService.syncEntityDelta).not.toHaveBeenCalled();
    });

    it('blocks the sync when the circuit breaker is OPEN', async () => {
      mockDeltaSyncService.syncAll.mockReset().mockRejectedValue(new Error('Odoo unreachable'));

      // Drive enough consecutive failures to trip the breaker
      // (requires failureCount >= 5 AND totalRequests > 10).
      for (let i = 0; i < 11; i++) {
        await service.pullAll().catch(() => undefined);
      }

      await expect(service.triggerSync({})).rejects.toThrow('Circuit breaker is OPEN');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 12  getSyncStatus / getConflicts / resolveConflict / getMetrics
  // ──────────────────────────────────────────────────────────────────────────────

  describe('getSyncStatus', () => {
    it('enriches the delta sync status with circuit state and conflict count', async () => {
      const baseStatus: SyncStatusResponse = {
        state: 'healthy',
        lastFullSyncAt: '2026-01-01T00:00:00.000Z',
        entities: [],
        circuitBreaker: 'CLOSED',
        pendingConflicts: 0,
        generatedAt: '2026-01-01T00:00:00.000Z',
      };
      mockDeltaSyncService.getSyncStatus.mockResolvedValueOnce(baseStatus);
      mockConflictResolutionService.getUnresolvedConflicts.mockResolvedValueOnce([
        pendingConflict,
      ]);

      const out = await service.getSyncStatus();

      expect(out.circuitBreaker).toBe('CLOSED');
      expect(out.pendingConflicts).toBe(1);
      expect(mockDeltaSyncService.getSyncStatus).toHaveBeenCalledOnce();
    });
  });

  describe('getConflicts', () => {
    it('returns unresolved conflicts from the conflict resolution service', async () => {
      mockConflictResolutionService.getUnresolvedConflicts.mockResolvedValueOnce([
        pendingConflict,
      ]);

      await expect(service.getConflicts()).resolves.toEqual([pendingConflict]);
    });
  });

  describe('resolveConflict', () => {
    it('delegates to the conflict resolution service with the requested strategy', async () => {
      const resolved: SyncConflict = {
        ...pendingConflict,
        resolution: 'odoo-wins',
        resolvedAt: '2026-01-02T00:00:00.000Z',
        resolvedBy: 'user-1',
      };
      mockConflictResolutionService.resolveConflict.mockResolvedValueOnce(resolved);

      await expect(service.resolveConflict('conflict-1', 'odoo-wins', 'user-1')).resolves.toEqual(
        resolved,
      );
      expect(mockConflictResolutionService.resolveConflict).toHaveBeenCalledWith('conflict-1', {
        strategy: 'odoo-wins',
        resolvedBy: 'user-1',
        mergedValues: undefined,
      });
    });
  });

  describe('getMetrics', () => {
    it('reads recent metric entries from the Redis log list', async () => {
      const entries = [
        { operation: 'trigger-sync', success: true, durationMs: 42, timestamp: '2026-01-01T00:00:00.000Z' },
      ];
      mockRedisService.lrange.mockReset().mockResolvedValueOnce(entries);

      await expect(service.getMetrics()).resolves.toEqual(entries);
      expect(mockRedisService.lrange).toHaveBeenCalledWith('odoo:sync:metrics-log', 0, 49);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 13  retryWithBackoff — exponential back-off
  // ──────────────────────────────────────────────────────────────────────────────

  describe('retryWithBackoff', () => {
    it('returns the operation result on the first attempt', async () => {
      const op = vi.fn().mockResolvedValue('ok');

      await expect(service.retryWithBackoff(op, 'test-op')).resolves.toBe('ok');
      expect(op).toHaveBeenCalledTimes(1);
    });

    it('retries a flaky operation and resolves once it succeeds', async () => {
      vi.useFakeTimers();
      const op = vi.fn()
        .mockRejectedValueOnce(new Error('flaky #1'))
        .mockRejectedValueOnce(new Error('flaky #2'))
        .mockResolvedValueOnce('recovered');

      const promise = service.retryWithBackoff(op, 'test-op', 2);
      await vi.advanceTimersByTimeAsync(10_000);

      await expect(promise).resolves.toBe('recovered');
      expect(op).toHaveBeenCalledTimes(3);
    });

    it('throws the last error once max retries are exhausted', async () => {
      const op = vi.fn().mockRejectedValue(new Error('always fails'));

      await expect(service.retryWithBackoff(op, 'test-op', 0)).rejects.toThrow('always fails');
      expect(op).toHaveBeenCalledTimes(1);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 14  Error handling — resilience when Redis / Odoo are down
  // ──────────────────────────────────────────────────────────────────────────────

  describe('error handling (Redis / Odoo failure resilience)', () => {
    it('catches delta sync failures in pullAll and logs a warning, does not crash', async () => {
      mockDeltaSyncService.syncAll.mockRejectedValueOnce(new Error('ECONNREFUSED odoo:8069'));

      const warnSpy = vi.spyOn(Logger.prototype, 'warn');

      // Must not throw — pullAll wraps everything in try-catch
      await expect(service.pullAll()).resolves.toBeUndefined();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Odoo scheduled pull failed: ECONNREFUSED odoo:8069'),
      );
      expect(service.getState().lastError).toBe('ECONNREFUSED odoo:8069');
    });

    it('catches Redis queue read failures during flushPendingLeads inside pullAll', async () => {
      mockDeltaSyncService.syncAll.mockResolvedValueOnce([]);

      // llen works, but lrange throws
      mockRedisService.llen.mockResolvedValueOnce(2);
      mockRedisService.lrange.mockRejectedValueOnce(new Error('Redis connection lost'));

      const warnSpy = vi.spyOn(Logger.prototype, 'warn');

      await expect(service.pullAll()).resolves.toBeUndefined();

      // Error is caught by the pullAll try-catch, not the flushPendingLeads one
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Odoo scheduled pull failed'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Redis connection lost'),
      );
    });

    it('propagates errors from handleWebhook when Redis.set fails (no try-catch there)', async () => {
      mockRedisService.set.mockRejectedValueOnce(new Error('Redis is down'));

      // handleWebhook does NOT have internal error handling, so error propagates
      await expect(service.handleWebhook(projectPayload)).rejects.toThrow('Redis is down');
    });
  });
});
