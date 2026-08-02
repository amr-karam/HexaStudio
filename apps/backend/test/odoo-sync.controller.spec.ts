import './setup';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { OdooSyncController } from '../src/modules/odoo/odoo-sync.controller';
import { OdooSyncService, SyncMetricEntry } from '../src/modules/odoo/odoo-sync.service';
import { ConflictResolutionService, ConflictAuditEntry } from '../src/modules/odoo/conflict-resolution.service';
import { DeltaSyncService } from '../src/modules/odoo/delta-sync.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';
import type { SyncConflict, SyncOperationResult, SyncStatusResponse } from '@hexastudio/types';

// ---------------------------------------------------------------------------
// Mock Services
// ---------------------------------------------------------------------------

const mockOdooSyncService = {
  triggerSync: vi.fn(),
  getSyncStatus: vi.fn(),
  getMetrics: vi.fn(),
  getConflicts: vi.fn(),
  resolveConflict: vi.fn(),
};

const mockConflictResolutionService = {
  getAllConflicts: vi.fn(),
  getAuditLog: vi.fn(),
};

const mockDeltaSyncService = {
  getAllCursors: vi.fn(),
  resetCursor: vi.fn(),
};

// ---------------------------------------------------------------------------
// Mock Guards — always pass
// ---------------------------------------------------------------------------

const mockJwtAuthGuard = { canActivate: vi.fn(() => true) };
const mockRolesGuard = { canActivate: vi.fn(() => true) };

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const syncResults: SyncOperationResult[] = [
  { entityType: 'crm.lead', recordsProcessed: 5, conflictsDetected: 0, durationMs: 150, success: true },
  { entityType: 'project.project', recordsProcessed: 2, conflictsDetected: 0, durationMs: 90, success: true },
];

const syncStatus: SyncStatusResponse = {
  state: 'healthy',
  lastFullSyncAt: '2026-01-01T00:00:00.000Z',
  entities: [
    { entityType: 'crm.lead', totalSynced: 10, totalErrors: 0, avgDurationMs: 120, conflictsDetected: 0, conflictsResolved: 0 },
  ],
  circuitBreaker: 'CLOSED',
  pendingConflicts: 0,
  generatedAt: '2026-01-01T00:00:00.000Z',
};

const metrics: SyncMetricEntry[] = [
  { operation: 'trigger-sync', success: true, durationMs: 42, timestamp: '2026-01-01T00:00:00.000Z' },
];

const conflict: SyncConflict = {
  id: 'conflict-uuid-1',
  entityType: 'crm.lead',
  entityId: 7,
  odooVersion: { name: 'Odoo version' },
  hexaVersion: { name: 'Hexa version' },
  detectedAt: '2026-01-01T00:00:00.000Z',
  resolution: 'pending',
  conflictingFields: ['name'],
};

const auditEntry: ConflictAuditEntry = {
  conflictId: 'conflict-uuid-1',
  entityType: 'crm.lead',
  entityId: 7,
  strategy: 'odoo-wins',
  resolution: 'odoo-wins',
  resolvedBy: 'system',
  resolvedAt: '2026-01-01T00:00:00.000Z',
  conflictingFields: ['name'],
};

const cursors = {
  'crm.lead': {
    entityType: 'crm.lead',
    lastSyncAt: '2026-01-01T00:00:00.000Z',
    lastSyncId: 5,
    recordsSynced: 5,
    errors: 0,
  },
};

describe('OdooSyncController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OdooSyncController],
      providers: [
        { provide: OdooSyncService, useValue: mockOdooSyncService },
        { provide: ConflictResolutionService, useValue: mockConflictResolutionService },
        { provide: DeltaSyncService, useValue: mockDeltaSyncService },
        // The RolesGuard needs a Reflector — we provide a real one since
        // the guard itself is overridden below, but Nest still resolves the
        // constructor injection during module compilation.
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  // ===========================================================================
  // 1. POST /odoo/sync/trigger
  // ===========================================================================
  describe('POST /odoo/sync/trigger', () => {
    it('triggers a sync for all entities and reports success', async () => {
      mockOdooSyncService.triggerSync.mockResolvedValueOnce(syncResults);

      const res = await request(app.getHttpServer()).post('/odoo/sync/trigger').send({});

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, results: syncResults });
      expect(mockOdooSyncService.triggerSync).toHaveBeenCalledWith({});
    });

    it('passes entityType and fullSync flags through to the service', async () => {
      mockOdooSyncService.triggerSync.mockResolvedValueOnce([syncResults[0]]);

      const res = await request(app.getHttpServer())
        .post('/odoo/sync/trigger')
        .send({ entityType: 'crm.lead', fullSync: true });

      expect(res.status).toBe(200);
      expect(mockOdooSyncService.triggerSync).toHaveBeenCalledWith({
        entityType: 'crm.lead',
        fullSync: true,
      });
    });

    it('reports success=false when any entity fails', async () => {
      const results: SyncOperationResult[] = [
        { entityType: 'crm.lead', recordsProcessed: 1, conflictsDetected: 0, durationMs: 10, success: true },
        { entityType: 'project.project', recordsProcessed: 0, conflictsDetected: 0, durationMs: 10, success: false, error: 'boom' },
      ];
      mockOdooSyncService.triggerSync.mockResolvedValueOnce(results);

      const res = await request(app.getHttpServer()).post('/odoo/sync/trigger').send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
    });

    it('propagates service errors', async () => {
      mockOdooSyncService.triggerSync.mockRejectedValueOnce(new Error('Odoo unreachable'));

      const res = await request(app.getHttpServer()).post('/odoo/sync/trigger').send({});

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 2. GET /odoo/sync/status
  // ===========================================================================
  describe('GET /odoo/sync/status', () => {
    it('returns the sync engine status', async () => {
      mockOdooSyncService.getSyncStatus.mockResolvedValueOnce(syncStatus);

      const res = await request(app.getHttpServer()).get('/odoo/sync/status');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(syncStatus);
      expect(mockOdooSyncService.getSyncStatus).toHaveBeenCalledOnce();
    });

    it('propagates service errors', async () => {
      mockOdooSyncService.getSyncStatus.mockRejectedValueOnce(new Error('Redis unavailable'));

      const res = await request(app.getHttpServer()).get('/odoo/sync/status');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 3. GET /odoo/sync/metrics
  // ===========================================================================
  describe('GET /odoo/sync/metrics', () => {
    it('returns recent metrics with the default limit', async () => {
      mockOdooSyncService.getMetrics.mockResolvedValueOnce(metrics);

      const res = await request(app.getHttpServer()).get('/odoo/sync/metrics');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(metrics);
      expect(mockOdooSyncService.getMetrics).toHaveBeenCalledWith(50);
    });

    it('honours a custom limit query parameter', async () => {
      mockOdooSyncService.getMetrics.mockResolvedValueOnce(metrics);

      const res = await request(app.getHttpServer()).get('/odoo/sync/metrics?limit=5');

      expect(res.status).toBe(200);
      expect(mockOdooSyncService.getMetrics).toHaveBeenCalledWith(5);
    });
  });

  // ===========================================================================
  // 4. GET /odoo/sync/conflicts
  // ===========================================================================
  describe('GET /odoo/sync/conflicts', () => {
    it('lists unresolved conflicts', async () => {
      mockOdooSyncService.getConflicts.mockResolvedValueOnce([conflict]);

      const res = await request(app.getHttpServer()).get('/odoo/sync/conflicts');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([conflict]);
      expect(mockOdooSyncService.getConflicts).toHaveBeenCalledOnce();
    });
  });

  // ===========================================================================
  // 5. GET /odoo/sync/conflicts/all
  // ===========================================================================
  describe('GET /odoo/sync/conflicts/all', () => {
    it('lists all conflicts (resolved and unresolved)', async () => {
      mockConflictResolutionService.getAllConflicts.mockResolvedValueOnce([conflict]);

      const res = await request(app.getHttpServer()).get('/odoo/sync/conflicts/all');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([conflict]);
      expect(mockConflictResolutionService.getAllConflicts).toHaveBeenCalledOnce();
    });

    it('caps the result list at the requested limit', async () => {
      mockConflictResolutionService.getAllConflicts.mockResolvedValueOnce([
        conflict,
        { ...conflict, id: 'conflict-uuid-2' },
      ]);

      const res = await request(app.getHttpServer()).get('/odoo/sync/conflicts/all?limit=1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  // ===========================================================================
  // 6. GET /odoo/sync/conflicts/audit
  // ===========================================================================
  describe('GET /odoo/sync/conflicts/audit', () => {
    it('returns the conflict resolution audit log', async () => {
      mockConflictResolutionService.getAuditLog.mockResolvedValueOnce([auditEntry]);

      const res = await request(app.getHttpServer()).get('/odoo/sync/conflicts/audit');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([auditEntry]);
      expect(mockConflictResolutionService.getAuditLog).toHaveBeenCalledWith(50);
    });

    it('honours a custom limit query parameter', async () => {
      mockConflictResolutionService.getAuditLog.mockResolvedValueOnce([]);

      await request(app.getHttpServer()).get('/odoo/sync/conflicts/audit?limit=5');

      expect(mockConflictResolutionService.getAuditLog).toHaveBeenCalledWith(5);
    });
  });

  // ===========================================================================
  // 7. POST /odoo/sync/conflicts/:id/resolve
  // ===========================================================================
  describe('POST /odoo/sync/conflicts/:id/resolve', () => {
    it('resolves a conflict with the requested strategy', async () => {
      const resolved: SyncConflict = {
        ...conflict,
        resolution: 'odoo-wins',
        resolvedAt: '2026-01-01T00:00:00.000Z',
        resolvedBy: 'user-1',
      };
      mockOdooSyncService.resolveConflict.mockResolvedValueOnce(resolved);

      const res = await request(app.getHttpServer())
        .post('/odoo/sync/conflicts/conflict-uuid-1/resolve')
        .send({ strategy: 'odoo-wins', resolvedBy: 'user-1' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, conflict: resolved });
      expect(mockOdooSyncService.resolveConflict).toHaveBeenCalledWith(
        'conflict-uuid-1',
        'odoo-wins',
        'user-1',
        undefined,
      );
    });

    it('propagates service errors', async () => {
      mockOdooSyncService.resolveConflict.mockRejectedValueOnce(new Error('Conflict not found'));

      const res = await request(app.getHttpServer())
        .post('/odoo/sync/conflicts/unknown/resolve')
        .send({ strategy: 'hexa-wins', resolvedBy: 'user-1' });

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 8. GET /odoo/sync/cursors
  // ===========================================================================
  describe('GET /odoo/sync/cursors', () => {
    it('returns all delta sync cursors', async () => {
      mockDeltaSyncService.getAllCursors.mockResolvedValueOnce(cursors);

      const res = await request(app.getHttpServer()).get('/odoo/sync/cursors');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(cursors);
      expect(mockDeltaSyncService.getAllCursors).toHaveBeenCalledOnce();
    });
  });

  // ===========================================================================
  // 9. POST /odoo/sync/cursors/:entityType/reset
  // ===========================================================================
  describe('POST /odoo/sync/cursors/:entityType/reset', () => {
    it('resets the cursor for the given entity type', async () => {
      mockDeltaSyncService.resetCursor.mockResolvedValueOnce(undefined);

      const res = await request(app.getHttpServer()).post('/odoo/sync/cursors/crm.lead/reset');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, message: 'Cursor reset for crm.lead' });
      expect(mockDeltaSyncService.resetCursor).toHaveBeenCalledWith('crm.lead');
    });
  });

  // ===========================================================================
  // 10. Guard integration — ensure guards are actually called
  // ===========================================================================
  describe('guard integration', () => {
    it('invokes JwtAuthGuard.canActivate', async () => {
      mockOdooSyncService.getSyncStatus.mockResolvedValueOnce(syncStatus);

      await request(app.getHttpServer()).get('/odoo/sync/status');

      expect(mockJwtAuthGuard.canActivate).toHaveBeenCalled();
    });

    it('invokes RolesGuard.canActivate', async () => {
      mockOdooSyncService.getSyncStatus.mockResolvedValueOnce(syncStatus);

      await request(app.getHttpServer()).get('/odoo/sync/status');

      expect(mockRolesGuard.canActivate).toHaveBeenCalled();
    });

    it('returns 403 when JwtAuthGuard denies access', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValueOnce(false);

      const res = await request(app.getHttpServer()).get('/odoo/sync/status');

      expect(res.status).toBe(403);
    });
  });
});
