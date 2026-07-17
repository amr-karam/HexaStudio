process.env.JWT_SECRET ??= 'test-jwt-secret-that-is-at-least-32-chars-long-for-testing';
process.env.CMS_URL ??= 'http://test-cms:1337';
process.env.REDIS_PASSWORD ??= 'test-redis-password';
process.env.MINIO_ROOT_USER ??= 'test-minio-user';
process.env.MINIO_ROOT_PASSWORD ??= 'test-minio-password-at-least-8';
process.env.ODOO_HOST ??= 'http://odoo:8069';
process.env.ODOO_DB ??= 'test_db';
process.env.ODOO_USER ??= 'test_user';
process.env.ODOO_PASSWORD ??= 'test_password';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { OdooApiService } from './odoo-api.service';
import { OdooService } from './odoo.service';

const mockOdooService = {
  searchRead: vi.fn(),
  execute: vi.fn(),
  create: vi.fn(),
  write: vi.fn(),
  ping: vi.fn(),
  getCircuitState: vi.fn().mockReturnValue('CLOSED'),
};

describe('OdooApiService', () => {
  let service: OdooApiService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OdooApiService,
        { provide: OdooService, useValue: mockOdooService },
      ],
    }).compile();

    service = module.get<OdooApiService>(OdooApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCrmPipeline', () => {
    it('should return pipeline summary from leads', async () => {
      mockOdooService.searchRead.mockResolvedValueOnce([
        { id: 1, stage_id: [1, 'New'], expected_revenue: 10000 },
        { id: 2, stage_id: [1, 'New'], expected_revenue: 20000 },
        { id: 3, stage_id: [2, 'Qualified'], expected_revenue: 50000 },
      ]);

      const result = await service.getCrmPipeline();

      expect(result.totalLeads).toBe(3);
      expect(result.stages).toHaveLength(2);
      expect(result.stages[0]).toEqual({ id: 1, name: 'New', leadCount: 2, expectedRevenue: 30000 });
      expect(result.stages[1]).toEqual({ id: 2, name: 'Qualified', leadCount: 1, expectedRevenue: 50000 });
    });

    it('should return empty pipeline when no leads', async () => {
      mockOdooService.searchRead.mockResolvedValueOnce([]);
      const result = await service.getCrmPipeline();
      expect(result.totalLeads).toBe(0);
      expect(result.stages).toHaveLength(0);
    });
  });

  describe('getLeads', () => {
    it('should return leads list', async () => {
      const leads = [
        { id: 1, name: 'Lead A', partner_name: 'Company A' },
        { id: 2, name: 'Lead B', partner_name: 'Company B' },
      ];
      mockOdooService.execute.mockResolvedValueOnce(leads);

      const result = await service.getLeads(10, 0);
      expect(result).toEqual(leads);
      expect(mockOdooService.execute).toHaveBeenCalledWith(
        'crm.lead', 'search_read',
        [expect.anything(), expect.anything(), 0, 10, 'create_date desc'],
      );
    });
  });

  describe('createLead', () => {
    it('should call odooService.create with crm.lead', async () => {
      mockOdooService.create.mockResolvedValueOnce(42);
      const data = { name: 'Test Lead', email_from: 'test@test.com' };
      const id = await service.createLead(data);
      expect(id).toBe(42);
      expect(mockOdooService.create).toHaveBeenCalledWith('crm.lead', data);
    });
  });

  describe('updateLead', () => {
    it('should call odooService.write with lead id', async () => {
      mockOdooService.write.mockResolvedValueOnce(true);
      const result = await service.updateLead(5, { stage_id: 2 });
      expect(result).toBe(true);
      expect(mockOdooService.write).toHaveBeenCalledWith('crm.lead', [5], { stage_id: 2 });
    });
  });

  describe('archiveLead', () => {
    it('should set active=false on the lead', async () => {
      mockOdooService.write.mockResolvedValueOnce(true);
      const result = await service.archiveLead(3);
      expect(result).toBe(true);
      expect(mockOdooService.write).toHaveBeenCalledWith('crm.lead', [3], { active: false });
    });
  });

  describe('getContacts', () => {
    it('should search partners with ilike when search provided', async () => {
      mockOdooService.execute.mockResolvedValueOnce([]);
      await service.getContacts(10, 0, 'hexa');
      expect(mockOdooService.execute).toHaveBeenCalledWith(
        'res.partner', 'search_read',
        [[['name', 'ilike', 'hexa']], expect.anything(), 0, 10, 'name asc'],
      );
    });

    it('should use empty domain when no search', async () => {
      mockOdooService.execute.mockResolvedValueOnce([]);
      await service.getContacts(10, 0);
      expect(mockOdooService.execute).toHaveBeenCalledWith(
        'res.partner', 'search_read',
        [[], expect.anything(), 0, 10, 'name asc'],
      );
    });
  });

  describe('getProjects', () => {
    it('should return projects list', async () => {
      const projects = [{ id: 1, name: 'Project Alpha' }];
      mockOdooService.execute.mockResolvedValueOnce(projects);
      const result = await service.getProjects();
      expect(result).toEqual(projects);
    });
  });

  describe('getHealth', () => {
    it('should return ok when ping succeeds', async () => {
      mockOdooService.ping.mockResolvedValueOnce(true);
      const result = await service.getHealth();
      expect(result).toEqual({ odoo: 'ok', circuit: 'CLOSED' });
    });

    it('should return error when ping fails', async () => {
      mockOdooService.ping.mockResolvedValueOnce(false);
      const result = await service.getHealth();
      expect(result).toEqual({ odoo: 'error', circuit: 'CLOSED' });
    });
  });
});
