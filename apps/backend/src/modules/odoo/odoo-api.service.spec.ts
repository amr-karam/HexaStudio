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
  searchCount: vi.fn(),
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

  describe('getInvoiceLines', () => {
    it('should query account.move.line for a given invoice id', async () => {
      const lines = [{ id: 10, name: 'Render Service', quantity: 1, price_unit: 5000, price_total: 5000 }];
      mockOdooService.execute.mockResolvedValueOnce(lines);

      const result = await service.getInvoiceLines(42);
      expect(result).toEqual(lines);
      expect(mockOdooService.execute).toHaveBeenCalledWith(
        'account.move.line',
        'search_read',
        [
          [['move_id', '=', 42], ['display_type', 'not in', ['line_section', 'line_note']]],
          ['name', 'product_id', 'quantity', 'price_unit', 'price_subtotal', 'price_total', 'tax_ids', 'account_id'],
          0,
          100,
          'id asc',
        ],
      );
    });
  });

  describe('getHelpdeskTeams and getHelpdeskTeamDetail', () => {
    it('should return helpdesk teams enriched with ticket counts', async () => {
      const teams = [{ id: 1, name: 'Architecture Support' }];
      mockOdooService.execute.mockResolvedValueOnce(teams);
      mockOdooService.searchCount = vi.fn().mockResolvedValueOnce(5);

      const result = await service.getHelpdeskTeams();
      expect(result).toHaveLength(1);
      expect(result[0].ticketCount).toBe(5);
    });

    it('should return team detail with recent tickets', async () => {
      const team = [{ id: 1, name: 'Architecture Support' }];
      const tickets = [{ id: 101, name: 'Fix 3D render glitch' }];
      mockOdooService.execute
        .mockResolvedValueOnce(team)
        .mockResolvedValueOnce(tickets);

      const result = await service.getHelpdeskTeamDetail(1);
      expect(result.id).toBe(1);
      expect(result.recentTickets).toEqual(tickets);
    });
  });

  describe('getKnowledgeCategories', () => {
    it('should return knowledge categories with article counts', async () => {
      const categories = [{ id: 1, name: 'Brand Guidelines' }];
      mockOdooService.execute.mockResolvedValueOnce(categories);
      mockOdooService.searchCount = vi.fn().mockResolvedValueOnce(12);

      const result = await service.getKnowledgeCategories();
      expect(result).toHaveLength(1);
      expect(result[0].articleCount).toBe(12);
    });
  });

  describe('getMailNotifications', () => {
    it('should fetch notifications with partner filtering', async () => {
      const notifications = [{ id: 1, is_read: false, notification_type: 'email' }];
      mockOdooService.execute.mockResolvedValueOnce(notifications);

      const result = await service.getMailNotifications(7, 10, 0);
      expect(result).toEqual(notifications);
      expect(mockOdooService.execute).toHaveBeenCalledWith(
        'mail.notification',
        'search_read',
        [
          [['res_partner_id', '=', 7]],
          ['mail_message_id', 'res_partner_id', 'notification_type', 'notification_status', 'is_read', 'failure_type'],
          0,
          10,
          'id desc',
        ],
      );
    });
  });

  describe('getAccountJournals and getBankStatements', () => {
    it('should fetch active account journals', async () => {
      const journals = [{ id: 1, name: 'Customer Invoices', code: 'INV', type: 'sale' }];
      mockOdooService.execute.mockResolvedValueOnce(journals);

      const result = await service.getAccountJournals();
      expect(result).toEqual(journals);
      expect(mockOdooService.execute).toHaveBeenCalledWith(
        'account.journal',
        'search_read',
        [[['active', '=', true]], ['name', 'code', 'type', 'currency_id', 'company_id', 'active'], 0, 50, 'name asc'],
      );
    });

    it('should fetch bank statements', async () => {
      const statements = [{ id: 1, name: 'BNK1/2026/08', balance_end_real: 250000 }];
      mockOdooService.execute.mockResolvedValueOnce(statements);

      const result = await service.getBankStatements();
      expect(result).toEqual(statements);
    });
  });

  describe('Agent Tools (ADR-0010)', () => {
    it('getExecutiveDashboardTool delegates to getExecutiveDashboard', async () => {
      mockOdooService.searchRead.mockResolvedValue([]);
      mockOdooService.execute.mockResolvedValue([]);

      const result = await service.getExecutiveDashboardTool();
      expect(result).toHaveProperty('crm');
      expect(result).toHaveProperty('finance');
    });

    it('searchLeadsTool delegates to getLeads', async () => {
      const leads = [{ id: 1, name: 'Lead 1' }];
      mockOdooService.execute.mockResolvedValueOnce(leads);

      const result = await service.searchLeadsTool({ limit: 5 });
      expect(result).toEqual(leads);
    });

    it('searchInvoicesTool delegates to getInvoices', async () => {
      const invoices = [{ id: 1, name: 'INV/001' }];
      mockOdooService.execute.mockResolvedValueOnce(invoices);

      const result = await service.searchInvoicesTool({ limit: 5 });
      expect(result).toEqual(invoices);
    });

    it('searchHelpdeskTicketsTool delegates to getHelpdeskTickets', async () => {
      const tickets = [{ id: 1, name: 'Ticket 1' }];
      mockOdooService.execute.mockResolvedValueOnce(tickets);

      const result = await service.searchHelpdeskTicketsTool({ limit: 5 });
      expect(result).toEqual(tickets);
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
