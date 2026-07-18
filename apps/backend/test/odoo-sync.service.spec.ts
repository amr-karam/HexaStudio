import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { OdooSyncService } from '../src/modules/odoo/odoo-sync.service';
import { OdooService } from '../src/modules/odoo/odoo.service';
import { RedisService } from '../src/modules/storage/redis.service';
import { EventBus } from '../src/modules/realtime/event-bus.service';
import type { OdooWebhookPayload } from '@hexastudio/types';

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

// ── Suite ──────────────────────────────────────────────────────────────────────

describe('OdooSyncService', () => {
  let service: OdooSyncService;
  let redisService: RedisService;
  let eventBus: EventBus;
  let odooService: OdooService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OdooSyncService,
        { provide: OdooService,   useValue: mockOdooService },
        { provide: RedisService,  useValue: mockRedisService },
        { provide: EventBus,      useValue: mockEventBus },
      ],
    }).compile();

    service     = module.get<OdooSyncService>(OdooSyncService);
    redisService = module.get<RedisService>(RedisService);
    eventBus    = module.get<EventBus>(EventBus);
    odooService = module.get<OdooService>(OdooService);
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
        ['name', 'stage_id', 'x_slug', 'x_hexa_status', 'x_hexa_type', 'x_hexa_client_portal_active'],
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
  });

  // ──────────────────────────────────────────────────────────────────────────────
  //  3  handleWebhook — crm.lead
  // ──────────────────────────────────────────────────────────────────────────────

  describe('handleWebhook (crm.lead)', () => {
    it('caches payload and emits lead event (no Odoo fetch)', async () => {
      await service.handleWebhook(leadPayload);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        'odoo:sync:crm.lead:7',
        leadPayload,
        3600,
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith('odoo:lead', leadPayload);
      expect(mockOdooService.searchRead).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  //  4  handleWebhook — account.move
  // ──────────────────────────────────────────────────────────────────────────────

  describe('handleWebhook (account.move)', () => {
    it('caches payload and emits invoice event', async () => {
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
  //  7  getState()  (requirement: getSyncState returns current state)
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

      mockOdooService.searchRead
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])           // crm.lead
        .mockResolvedValueOnce([{ id: 10 }])                       // project.project
        .mockResolvedValueOnce([]);                                // account.move

      await service.pullAll();

      const state = service.getState();
      expect(state.lastSync).toBe(frozenNow);
      expect(state.counts).toEqual({ leads: 2, projects: 1, invoices: 0 });
      expect(state.lastError).toBeUndefined();

      vi.useRealTimers();
    });

    it('records lastError on the state object when pullAll fails', async () => {
      mockOdooService.searchRead.mockRejectedValueOnce(new Error('Odoo connection timeout'));

      await service.pullAll();

      const state = service.getState();
      expect(state.lastError).toBe('Odoo connection timeout');
      // lastSync remains unchanged from default
      expect(state.lastSync).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  //  8  pullAll — full reconciliation cycle
  // ──────────────────────────────────────────────────────────────────────────────

  describe('pullAll (scheduled / manual reconciliation)', () => {
    it('pulls all three models from Odoo and updates state counts', async () => {
      mockOdooService.searchRead
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }])   // leads
        .mockResolvedValueOnce([{ id: 10 }, { id: 20 }])             // projects
        .mockResolvedValueOnce([{ id: 100 }]);                       // invoices

      await service.pullAll();

      // Three distinct searchRead calls with correct arguments
      expect(mockOdooService.searchRead).toHaveBeenCalledTimes(3);
      expect(mockOdooService.searchRead).toHaveBeenCalledWith(
        'crm.lead', [], ['id', 'stage_id'], false,
      );
      expect(mockOdooService.searchRead).toHaveBeenCalledWith(
        'project.project', [], ['id', 'x_slug', 'stage_id'], false,
      );
      expect(mockOdooService.searchRead).toHaveBeenCalledWith(
        'account.move', [['move_type', '=', 'out_invoice']], ['id'], false,
      );

      // State updated correctly
      expect(service.getState().counts).toEqual({ leads: 3, projects: 2, invoices: 1 });
    });

    it('flushes pending leads that were queued while Odoo was unavailable', async () => {
      // Pull returns empty — focus on flush
      mockOdooService.searchRead
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

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
      mockOdooService.searchRead
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

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
  //  9  flushPendingLeads — low-level queue drain
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
  // 10  Error handling — resilience when Redis / Odoo are down
  // ──────────────────────────────────────────────────────────────────────────────

  describe('error handling (Redis / Odoo failure resilience)', () => {
    it('catches Odoo search failures in pullAll and logs a warning, does not crash', async () => {
      mockOdooService.searchRead.mockRejectedValueOnce(new Error('ECONNREFUSED odoo:8069'));

      const warnSpy = vi.spyOn(Logger.prototype, 'warn');

      // Must not throw — pullAll wraps everything in try-catch
      await expect(service.pullAll()).resolves.toBeUndefined();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Odoo scheduled pull failed: ECONNREFUSED odoo:8069'),
      );
      expect(service.getState().lastError).toBe('ECONNREFUSED odoo:8069');
    });

    it('catches Redis queue read failures during flushPendingLeads inside pullAll', async () => {
      mockOdooService.searchRead
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

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
