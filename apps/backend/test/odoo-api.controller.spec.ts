import './setup';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { OdooApiController } from '../src/modules/odoo/odoo-api.controller';
import { OdooApiService } from '../src/modules/odoo/odoo-api.service';
import { OdooSyncService } from '../src/modules/odoo/odoo-sync.service';
import { OdooDocumentService } from '../src/modules/odoo/odoo-document.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';

// ---------------------------------------------------------------------------
// Mock Services
// ---------------------------------------------------------------------------

const mockOdooApiService = {
  getCrmPipeline: vi.fn(),
  getLeads: vi.fn(),
  getLeadDetail: vi.fn(),
  createLead: vi.fn(),
  updateLead: vi.fn(),
  archiveLead: vi.fn(),
  getContacts: vi.fn(),
  getContactDetail: vi.fn(),
  createPartner: vi.fn(),
  updatePartner: vi.fn(),
  getProjects: vi.fn(),
  getProjectDetail: vi.fn(),
  updateProject: vi.fn(),
  getProjectMilestones: vi.fn(),
  createMilestone: vi.fn(),
  updateMilestone: vi.fn(),
  getSalesOrders: vi.fn(),
  getInvoices: vi.fn(),
  getHealth: vi.fn(),
};

const mockOdooSyncService = {
  getState: vi.fn(),
  pullAll: vi.fn(),
  handleWebhook: vi.fn(),
  flushPendingLeads: vi.fn(),
};

const mockOdooDocumentService = {
  uploadAndLink: vi.fn(),
  getProjectDocuments: vi.fn(),
  getSignedUrl: vi.fn(),
};

// ---------------------------------------------------------------------------
// Mock Guards — always pass
// ---------------------------------------------------------------------------

const mockJwtAuthGuard = { canActivate: vi.fn(() => true) };
const mockRolesGuard = { canActivate: vi.fn(() => true) };

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const pipelineSummary = {
  stages: [
    { id: 1, name: 'New', leadCount: 2, expectedRevenue: 30_000 },
    { id: 2, name: 'Qualified', leadCount: 1, expectedRevenue: 50_000 },
  ],
  totalLeads: 3,
  totalExpectedRevenue: 80_000,
  weightedRevenue: 80_000,
};

const leadsList = [
  { id: 1, name: 'Lead A', partner_name: 'Company A', email_from: 'a@test.com', expected_revenue: 10_000 },
  { id: 2, name: 'Lead B', partner_name: 'Company B', email_from: 'b@test.com', expected_revenue: 20_000 },
];

const contactsList = [
  { id: 1, name: 'Contact A', email: 'a@test.com', phone: '+123' },
  { id: 2, name: 'Contact B', email: 'b@test.com', phone: '+456' },
];

const projectsList = [
  { id: 1, name: 'Project Alpha', partner_id: [10, 'Client A'] },
  { id: 2, name: 'Project Beta', partner_id: [20, 'Client B'] },
];

const milestonesList = [
  { id: 1, name: 'Kick-off', completed: true, x_hexa_order: 0 },
  { id: 2, name: 'Review', completed: false, x_hexa_order: 1 },
];

const syncState = {
  lastSync: 1_700_000_000_000,
  counts: { leads: 10, projects: 3, invoices: 5 },
};

const healthStatus = { odoo: 'ok', circuit: 'CLOSED' };

const uploadedDoc = {
  id: 42,
  name: 'report.pdf',
  mimeType: 'application/pdf',
  fileSize: 1024,
  filePath: 'odoo-documents/project-7/1700000000000-report.pdf',
  projectId: 7,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const projectDocs = [
  {
    id: 42,
    name: 'report.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024,
    filePath: 'odoo-documents/project-7/1700000000000-report.pdf',
    projectId: 7,
    createdAt: '2026-01-01T00:00:00.000Z',
    downloadUrl: 'http://minio/presigned/report.pdf',
  },
];

describe('OdooApiController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OdooApiController],
      providers: [
        { provide: OdooApiService, useValue: mockOdooApiService },
        { provide: OdooSyncService, useValue: mockOdooSyncService },
        { provide: OdooDocumentService, useValue: mockOdooDocumentService },
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
  // 1. GET /odoo/crm/pipeline
  // ===========================================================================
  describe('GET /odoo/crm/pipeline', () => {
    it('returns pipeline summary', async () => {
      mockOdooApiService.getCrmPipeline.mockResolvedValueOnce(pipelineSummary);

      const res = await request(app.getHttpServer()).get('/odoo/crm/pipeline');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(pipelineSummary);
      expect(mockOdooApiService.getCrmPipeline).toHaveBeenCalledOnce();
    });

    it('propagates service errors', async () => {
      mockOdooApiService.getCrmPipeline.mockRejectedValueOnce(new Error('Odoo timeout'));

      const res = await request(app.getHttpServer()).get('/odoo/crm/pipeline');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 2. GET /odoo/crm/leads
  // ===========================================================================
  describe('GET /odoo/crm/leads', () => {
    it('returns lead list with default pagination', async () => {
      mockOdooApiService.getLeads.mockResolvedValueOnce(leadsList);

      const res = await request(app.getHttpServer()).get('/odoo/crm/leads');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(leadsList);
      expect(mockOdooApiService.getLeads).toHaveBeenCalledWith(50, 0);
    });

    it('accepts custom limit and offset', async () => {
      mockOdooApiService.getLeads.mockResolvedValueOnce([leadsList[0]]);

      const res = await request(app.getHttpServer()).get('/odoo/crm/leads?limit=1&offset=1');

      expect(res.status).toBe(200);
      expect(mockOdooApiService.getLeads).toHaveBeenCalledWith(1, 1);
      expect(res.body).toHaveLength(1);
    });

    it('propagates service errors', async () => {
      mockOdooApiService.getLeads.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app.getHttpServer()).get('/odoo/crm/leads');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 3. POST /odoo/crm/leads
  // ===========================================================================
  describe('POST /odoo/crm/leads', () => {
    const leadData = { name: 'New Lead', email_from: 'lead@test.com', expected_revenue: 15_000 };

    it('creates a lead and returns id', async () => {
      mockOdooApiService.createLead.mockResolvedValueOnce(99);

      const res = await request(app.getHttpServer()).post('/odoo/crm/leads').send(leadData);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 99, success: true });
      expect(mockOdooApiService.createLead).toHaveBeenCalledWith(leadData);
    });

    it('propagates service errors', async () => {
      mockOdooApiService.createLead.mockRejectedValueOnce(new Error('Validation error'));

      const res = await request(app.getHttpServer()).post('/odoo/crm/leads').send(leadData);

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 4. PATCH /odoo/crm/leads/:id
  // ===========================================================================
  describe('PATCH /odoo/crm/leads/:id', () => {
    const updateData = { stage_id: 3, expected_revenue: 25_000 };

    it('updates a lead and returns success', async () => {
      mockOdooApiService.updateLead.mockResolvedValueOnce(true);

      const res = await request(app.getHttpServer()).patch('/odoo/crm/leads/5').send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
      expect(mockOdooApiService.updateLead).toHaveBeenCalledWith(5, updateData);
    });

    it('propagates service errors', async () => {
      mockOdooApiService.updateLead.mockRejectedValueOnce(new Error('Not found'));

      const res = await request(app.getHttpServer()).patch('/odoo/crm/leads/999').send(updateData);

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 5. DELETE /odoo/crm/leads/:id
  // ===========================================================================
  describe('DELETE /odoo/crm/leads/:id', () => {
    it('archives a lead and returns success', async () => {
      mockOdooApiService.archiveLead.mockResolvedValueOnce(true);

      const res = await request(app.getHttpServer()).delete('/odoo/crm/leads/3');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
      expect(mockOdooApiService.archiveLead).toHaveBeenCalledWith(3);
    });

    it('propagates service errors', async () => {
      mockOdooApiService.archiveLead.mockRejectedValueOnce(new Error('Already archived'));

      const res = await request(app.getHttpServer()).delete('/odoo/crm/leads/3');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 6. GET /odoo/contacts
  // ===========================================================================
  describe('GET /odoo/contacts', () => {
    it('returns contact list without search', async () => {
      mockOdooApiService.getContacts.mockResolvedValueOnce(contactsList);

      const res = await request(app.getHttpServer()).get('/odoo/contacts');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(contactsList);
      expect(mockOdooApiService.getContacts).toHaveBeenCalledWith(50, 0, undefined);
    });

    it('passes search query to service', async () => {
      mockOdooApiService.getContacts.mockResolvedValueOnce([contactsList[0]]);

      const res = await request(app.getHttpServer()).get('/odoo/contacts?search=hexa');

      expect(res.status).toBe(200);
      expect(mockOdooApiService.getContacts).toHaveBeenCalledWith(50, 0, 'hexa');
    });

    it('supports limit and offset with search', async () => {
      mockOdooApiService.getContacts.mockResolvedValueOnce([]);

      await request(app.getHttpServer()).get('/odoo/contacts?limit=5&offset=10&search=test');

      expect(mockOdooApiService.getContacts).toHaveBeenCalledWith(5, 10, 'test');
    });

    it('propagates service errors', async () => {
      mockOdooApiService.getContacts.mockRejectedValueOnce(new Error('Odoo unavailable'));

      const res = await request(app.getHttpServer()).get('/odoo/contacts');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 7. POST /odoo/contacts
  // ===========================================================================
  describe('POST /odoo/contacts', () => {
    const contactData = { name: 'New Contact', email: 'new@test.com', phone: '+789' };

    it('creates a contact and returns id', async () => {
      mockOdooApiService.createPartner.mockResolvedValueOnce(77);

      const res = await request(app.getHttpServer()).post('/odoo/contacts').send(contactData);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 77, success: true });
      expect(mockOdooApiService.createPartner).toHaveBeenCalledWith(contactData);
    });

    it('propagates service errors', async () => {
      mockOdooApiService.createPartner.mockRejectedValueOnce(new Error('Duplicate'));

      const res = await request(app.getHttpServer()).post('/odoo/contacts').send(contactData);

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 8. GET /odoo/projects
  // ===========================================================================
  describe('GET /odoo/projects', () => {
    it('returns project list with default pagination', async () => {
      mockOdooApiService.getProjects.mockResolvedValueOnce(projectsList);

      const res = await request(app.getHttpServer()).get('/odoo/projects');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(projectsList);
      expect(mockOdooApiService.getProjects).toHaveBeenCalledWith(50, 0);
    });

    it('accepts custom limit and offset', async () => {
      mockOdooApiService.getProjects.mockResolvedValueOnce([projectsList[0]]);

      await request(app.getHttpServer()).get('/odoo/projects?limit=10&offset=20');

      expect(mockOdooApiService.getProjects).toHaveBeenCalledWith(10, 20);
    });

    it('propagates service errors', async () => {
      mockOdooApiService.getProjects.mockRejectedValueOnce(new Error('Project fetch failed'));

      const res = await request(app.getHttpServer()).get('/odoo/projects');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 9. GET /odoo/projects/:id/milestones
  // ===========================================================================
  describe('GET /odoo/projects/:id/milestones', () => {
    it('returns milestones for a project', async () => {
      mockOdooApiService.getProjectMilestones.mockResolvedValueOnce(milestonesList);

      const res = await request(app.getHttpServer()).get('/odoo/projects/7/milestones');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(milestonesList);
      expect(mockOdooApiService.getProjectMilestones).toHaveBeenCalledWith(7);
    });

    it('propagates service errors', async () => {
      mockOdooApiService.getProjectMilestones.mockRejectedValueOnce(new Error('Project not found'));

      const res = await request(app.getHttpServer()).get('/odoo/projects/999/milestones');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 10. POST /odoo/projects/:id/milestones
  // ===========================================================================
  describe('POST /odoo/projects/:id/milestones', () => {
    const milestoneData = { name: 'Design Phase', x_hexa_order: 2 };

    it('creates a milestone and returns id', async () => {
      mockOdooApiService.createMilestone.mockResolvedValueOnce(55);

      const res = await request(app.getHttpServer()).post('/odoo/projects/7/milestones').send(milestoneData);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 55, success: true });
      expect(mockOdooApiService.createMilestone).toHaveBeenCalledWith(7, milestoneData);
    });

    it('propagates service errors', async () => {
      mockOdooApiService.createMilestone.mockRejectedValueOnce(new Error('Invalid project'));

      const res = await request(app.getHttpServer()).post('/odoo/projects/999/milestones').send(milestoneData);

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 11. GET /odoo/sync/state
  // ===========================================================================
  describe('GET /odoo/sync/state', () => {
    it('returns current sync state', async () => {
      mockOdooSyncService.getState.mockReturnValueOnce(syncState);

      const res = await request(app.getHttpServer()).get('/odoo/sync/state');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(syncState);
      expect(mockOdooSyncService.getState).toHaveBeenCalledOnce();
    });

    it('propagates service errors', async () => {
      mockOdooSyncService.getState.mockImplementationOnce(() => {
        throw new Error('Redis unavailable');
      });

      const res = await request(app.getHttpServer()).get('/odoo/sync/state');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 12. POST /odoo/sync/trigger
  // ===========================================================================
  describe('POST /odoo/sync/trigger', () => {
    it('triggers a manual sync and returns success', async () => {
      mockOdooSyncService.pullAll.mockResolvedValueOnce(undefined);

      const res = await request(app.getHttpServer()).post('/odoo/sync/trigger');

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ success: true });
      expect(mockOdooSyncService.pullAll).toHaveBeenCalledOnce();
    });

    it('propagates service errors', async () => {
      mockOdooSyncService.pullAll.mockRejectedValueOnce(new Error('Odoo unreachable'));

      const res = await request(app.getHttpServer()).post('/odoo/sync/trigger');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 13. GET /odoo/health
  // ===========================================================================
  describe('GET /odoo/health', () => {
    it('returns health status when Odoo is reachable', async () => {
      mockOdooApiService.getHealth.mockResolvedValueOnce(healthStatus);

      const res = await request(app.getHttpServer()).get('/odoo/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(healthStatus);
      expect(mockOdooApiService.getHealth).toHaveBeenCalledOnce();
    });

    it('returns error status when Odoo is down', async () => {
      const degraded = { odoo: 'error', circuit: 'HALF_OPEN' };
      mockOdooApiService.getHealth.mockResolvedValueOnce(degraded);

      const res = await request(app.getHttpServer()).get('/odoo/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(degraded);
    });

    it('propagates unexpected errors', async () => {
      mockOdooApiService.getHealth.mockRejectedValueOnce(new Error('Crash'));

      const res = await request(app.getHttpServer()).get('/odoo/health');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 14. POST /odoo/documents/:projectId (file upload)
  //
  // NOTE: We test the controller method directly rather than via HTTP because
  // the @FileInterceptor('file') decorator uses multer's default disk storage
  // which is unreliable in lightweight test environments.  The HTTP routing
  // and guard layers are already validated by the other spec suites above.
  // ===========================================================================
  describe('POST /odoo/documents/:projectId', () => {
    let controller: OdooApiController;

    beforeEach(() => {
      controller = new OdooApiController(
        mockOdooApiService as unknown as OdooApiService,
        mockOdooSyncService as unknown as OdooSyncService,
        mockOdooDocumentService as unknown as OdooDocumentService,
      );
    });

    it('uploads a file and returns document record', async () => {
      mockOdooDocumentService.uploadAndLink.mockResolvedValueOnce(uploadedDoc);

      const file = {
        buffer: Buffer.from('fake-pdf-content'),
        originalName: 'report.pdf',
        mimetype: 'application/pdf',
        size: 15,
      };

      const result = await controller.uploadDocument('7', file);

      expect(result).toEqual(uploadedDoc);
      expect(mockOdooDocumentService.uploadAndLink).toHaveBeenCalledOnce();
      const callArgs = mockOdooDocumentService.uploadAndLink.mock.calls[0];
      expect(callArgs[1]).toBe(7);
      expect(callArgs[0].originalName).toBe('report.pdf');
      expect(callArgs[0].mimetype).toBe('application/pdf');
      expect(callArgs[0].buffer).toBeInstanceOf(Buffer);
      expect(callArgs[0].size).toBeGreaterThan(0);
    });

    it('propagates service errors', async () => {
      mockOdooDocumentService.uploadAndLink.mockRejectedValueOnce(new Error('MinIO write error'));

      const file = {
        buffer: Buffer.from('data'),
        originalName: 'bad.pdf',
        mimetype: 'application/pdf',
        size: 4,
      };

      await expect(controller.uploadDocument('7', file)).rejects.toThrow('MinIO write error');
    });
  });

  // ===========================================================================
  // 15. GET /odoo/documents/:projectId
  // ===========================================================================
  describe('GET /odoo/documents/:projectId', () => {
    it('lists project documents with download URLs', async () => {
      mockOdooDocumentService.getProjectDocuments.mockResolvedValueOnce(projectDocs);

      const res = await request(app.getHttpServer()).get('/odoo/documents/7');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(projectDocs);
      expect(mockOdooDocumentService.getProjectDocuments).toHaveBeenCalledWith(7);
    });

    it('returns empty array when no documents', async () => {
      mockOdooDocumentService.getProjectDocuments.mockResolvedValueOnce([]);

      const res = await request(app.getHttpServer()).get('/odoo/documents/7');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('propagates service errors', async () => {
      mockOdooDocumentService.getProjectDocuments.mockRejectedValueOnce(new Error('Odoo error'));

      const res = await request(app.getHttpServer()).get('/odoo/documents/7');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // 16. GET /odoo/documents/download/:id
  // ===========================================================================
  describe('GET /odoo/documents/download/:id', () => {
    const signedUrl = 'http://minio:9000/uploads/odoo-documents/signed/report.pdf?token=abc';

    it('returns a signed download URL', async () => {
      mockOdooDocumentService.getSignedUrl.mockResolvedValueOnce(signedUrl);

      const res = await request(app.getHttpServer()).get('/odoo/documents/download/42');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ url: signedUrl });
      expect(mockOdooDocumentService.getSignedUrl).toHaveBeenCalledWith('42');
    });

    it('propagates NotFoundException from service', async () => {
      const { NotFoundException } = await import('@nestjs/common');
      mockOdooDocumentService.getSignedUrl.mockRejectedValueOnce(
        new NotFoundException('Document #999 not found'),
      );

      const res = await request(app.getHttpServer()).get('/odoo/documents/download/999');

      expect(res.status).toBe(404);
    });

    it('propagates other errors', async () => {
      mockOdooDocumentService.getSignedUrl.mockRejectedValueOnce(new Error('MinIO error'));

      const res = await request(app.getHttpServer()).get('/odoo/documents/download/42');

      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // Additional coverage — extra endpoints present on the controller
  // ===========================================================================

  describe('additional endpoints', () => {
    // GET /odoo/crm/leads/:id
    it('GET /odoo/crm/leads/:id returns lead detail', async () => {
      const detail = { id: 1, name: 'Lead A', email_from: 'a@test.com' };
      mockOdooApiService.getLeadDetail.mockResolvedValueOnce(detail);

      const res = await request(app.getHttpServer()).get('/odoo/crm/leads/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(detail);
      expect(mockOdooApiService.getLeadDetail).toHaveBeenCalledWith(1);
    });

    // GET /odoo/contacts/:id
    it('GET /odoo/contacts/:id returns contact detail', async () => {
      const contact = { id: 1, name: 'Contact A', email: 'a@test.com' };
      mockOdooApiService.getContactDetail.mockResolvedValueOnce(contact);

      const res = await request(app.getHttpServer()).get('/odoo/contacts/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(contact);
      expect(mockOdooApiService.getContactDetail).toHaveBeenCalledWith(1);
    });

    // PATCH /odoo/contacts/:id
    it('PATCH /odoo/contacts/:id updates a contact', async () => {
      mockOdooApiService.updatePartner.mockResolvedValueOnce(true);

      const res = await request(app.getHttpServer()).patch('/odoo/contacts/1').send({ email: 'new@test.com' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
      expect(mockOdooApiService.updatePartner).toHaveBeenCalledWith(1, { email: 'new@test.com' });
    });

    // GET /odoo/projects/:id
    it('GET /odoo/projects/:id returns project detail', async () => {
      const project = { id: 1, name: 'Project Alpha' };
      mockOdooApiService.getProjectDetail.mockResolvedValueOnce(project);

      const res = await request(app.getHttpServer()).get('/odoo/projects/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(project);
      expect(mockOdooApiService.getProjectDetail).toHaveBeenCalledWith(1);
    });

    // PATCH /odoo/projects/:id
    it('PATCH /odoo/projects/:id updates a project', async () => {
      mockOdooApiService.updateProject.mockResolvedValueOnce(true);

      const res = await request(app.getHttpServer()).patch('/odoo/projects/1').send({ name: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
      expect(mockOdooApiService.updateProject).toHaveBeenCalledWith(1, { name: 'Updated' });
    });

    // PATCH /odoo/milestones/:id
    it('PATCH /odoo/milestones/:id updates a milestone', async () => {
      mockOdooApiService.updateMilestone.mockResolvedValueOnce(true);

      const res = await request(app.getHttpServer()).patch('/odoo/milestones/1').send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
      expect(mockOdooApiService.updateMilestone).toHaveBeenCalledWith(1, { completed: true });
    });

    // GET /odoo/sales/orders
    it('GET /odoo/sales/orders returns sales orders', async () => {
      const orders = [{ id: 1, name: 'SO001', amount_total: 5000 }];
      mockOdooApiService.getSalesOrders.mockResolvedValueOnce(orders);

      const res = await request(app.getHttpServer()).get('/odoo/sales/orders');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(orders);
      expect(mockOdooApiService.getSalesOrders).toHaveBeenCalledWith(50, 0);
    });

    // GET /odoo/invoices
    it('GET /odoo/invoices returns invoice list', async () => {
      const invoices = [{ id: 1, name: 'INV/2026/001', amount_total: 3000 }];
      mockOdooApiService.getInvoices.mockResolvedValueOnce(invoices);

      const res = await request(app.getHttpServer()).get('/odoo/invoices');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(invoices);
      expect(mockOdooApiService.getInvoices).toHaveBeenCalledWith(50, 0);
    });
  });

  // ===========================================================================
  // Guard integration — ensure guards are actually called
  // ===========================================================================
  describe('guard integration', () => {
    it('invokes JwtAuthGuard.canActivate', async () => {
      mockOdooApiService.getCrmPipeline.mockResolvedValueOnce(pipelineSummary);

      await request(app.getHttpServer()).get('/odoo/crm/pipeline');

      expect(mockJwtAuthGuard.canActivate).toHaveBeenCalled();
    });

    it('invokes RolesGuard.canActivate', async () => {
      mockOdooApiService.getCrmPipeline.mockResolvedValueOnce(pipelineSummary);

      await request(app.getHttpServer()).get('/odoo/crm/pipeline');

      expect(mockRolesGuard.canActivate).toHaveBeenCalled();
    });

    it('returns 403 when JwtAuthGuard denies access', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValueOnce(false);

      const res = await request(app.getHttpServer()).get('/odoo/crm/pipeline');

      expect(res.status).toBe(403);
    });
  });
});
