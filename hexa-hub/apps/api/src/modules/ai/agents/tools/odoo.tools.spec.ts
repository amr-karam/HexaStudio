import { Test, TestingModule } from '@nestjs/testing';
import { OdooTools } from './odoo.tools';
import { OdooService } from '../../../odoo/odoo.service';

describe('OdooTools', () => {
  let tools: OdooTools;
  let mockOdoo: jest.Mocked<OdooService>;

  beforeEach(async () => {
    mockOdoo = {
      searchRead: jest.fn(),
      createLead: jest.fn(),
    } as unknown as jest.Mocked<OdooService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OdooTools,
        { provide: OdooService, useValue: mockOdoo },
      ],
    }).compile();

    tools = module.get<OdooTools>(OdooTools);
  });

  describe('getAllTools', () => {
    it('should return all 3 tools', () => {
      const allTools = tools.getAllTools();
      expect(allTools).toHaveLength(3);
      expect(allTools.map(t => t.definition.name)).toEqual(
        ['odoo_search_read', 'odoo_create_lead', 'odoo_financial_query'],
      );
    });
  });

  describe('searchReadTool', () => {
    it('should query Odoo and format results', async () => {
      mockOdoo.searchRead.mockResolvedValue([
        { id: 1, name: 'Opportunity A', stage_id: 'won', planned_revenue: 50000 },
        { id: 2, name: 'Opportunity B', stage_id: 'prospect', planned_revenue: 30000 },
      ]);

      const tool = tools.searchReadTool();
      const result = await tool.handler({
        model: 'crm.lead',
        domain: '[]',
        fields: '["name","stage_id","planned_revenue"]',
        limit: '10',
      });

      expect(mockOdoo.searchRead).toHaveBeenCalledWith(
        'crm.lead',
        [],
        ['name', 'stage_id', 'planned_revenue'],
        { limit: 10 },
      );
      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe('Opportunity A');
    });

    it('should handle empty results', async () => {
      mockOdoo.searchRead.mockResolvedValue([]);

      const tool = tools.searchReadTool();
      const result = await tool.handler({
        model: 'crm.lead',
      });

      expect(result).toBe('[]');
    });

    it('should use default limit when not specified', async () => {
      mockOdoo.searchRead.mockResolvedValue([]);

      const tool = tools.searchReadTool();
      await tool.handler({ model: 'res.partner' });

      expect(mockOdoo.searchRead).toHaveBeenCalledWith(
        'res.partner',
        [],
        [],
        { limit: 50 },
      );
    });

    it('should parse JSON-encoded domain and fields', async () => {
      mockOdoo.searchRead.mockResolvedValue([]);

      const tool = tools.searchReadTool();
      await tool.handler({
        model: 'account.move',
        domain: '[["move_type","=","out_invoice"]]',
        fields: '["name","amount_total"]',
      });

      const call = mockOdoo.searchRead.mock.calls[0];
      expect(call[1]).toEqual([['move_type', '=', 'out_invoice']]);
      expect(call[2]).toEqual(['name', 'amount_total']);
    });
  });

  describe('createLeadTool', () => {
    it('should create a lead with required and optional fields', async () => {
      mockOdoo.createLead.mockResolvedValue(42);

      const tool = tools.createLeadTool();
      const result = await tool.handler({
        name: 'Nebula Labs Opportunity',
        contact_name: 'John Doe',
        email_from: 'john@acme.com',
        phone: '555-1234',
        planned_revenue: '50000',
        source: 'LinkedIn',
        service: 'Web Development',
      });

      expect(mockOdoo.createLead).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Nebula Labs Opportunity',
          type: 'opportunity',
          email_from: 'john@acme.com',
          phone: '555-1234',
          contact_name: 'John Doe',
          planned_revenue: 50000,
          x_hexa_source: 'LinkedIn',
          x_hexa_service: 'Web Development',
        }),
      );

      const parsed = JSON.parse(result);
      expect(parsed.id).toBe(42);
      expect(parsed.message).toContain('Nebula Labs Opportunity');
    });

    it('should create a lead with only name (minimal fields)', async () => {
      mockOdoo.createLead.mockResolvedValue(99);

      const tool = tools.createLeadTool();
      const result = await tool.handler({
        name: 'Minimal Lead',
      });

      expect(mockOdoo.createLead).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Minimal Lead',
          type: 'opportunity',
        }),
      );
      const parsed = JSON.parse(result);
      expect(parsed.id).toBe(99);
    });

    it('should parse planned_revenue as float', async () => {
      mockOdoo.createLead.mockResolvedValue(1);

      const tool = tools.createLeadTool();
      await tool.handler({
        name: 'Test Lead',
        planned_revenue: '12500.50',
      });

      const leadData = mockOdoo.createLead.mock.calls[0][0];
      expect(leadData.planned_revenue).toBe(12500.5);
    });

    it('should parse stage_id as integer', async () => {
      mockOdoo.createLead.mockResolvedValue(1);

      const tool = tools.createLeadTool();
      await tool.handler({
        name: 'Test Lead',
        stage_id: '3',
      });

      const leadData = mockOdoo.createLead.mock.calls[0][0];
      expect(leadData.stage_id).toBe(3);
    });
  });

  describe('queryFinancialDataTool', () => {
    it('should query invoices with posted state', async () => {
      mockOdoo.searchRead.mockResolvedValue([
        { id: 1, name: 'INV-001', amount_total: 1500, state: 'posted' },
      ]);

      const tool = tools.queryFinancialDataTool();
      const result = await tool.handler({
        query_type: 'revenue',
        date_from: '2024-01-01',
        date_to: '2024-03-31',
      });

      expect(mockOdoo.searchRead).toHaveBeenCalledWith(
        'account.move',
        [
          ['move_type', '=', 'out_invoice'],
          ['state', '=', 'posted'],
          ['invoice_date', '>=', '2024-01-01'],
          ['invoice_date', '<=', '2024-03-31'],
        ],
        ['name', 'invoice_date', 'amount_total', 'partner_id', 'state', 'payment_state'],
        { limit: 50 },
      );

      const parsed = JSON.parse(result);
      expect(parsed[0].name).toBe('INV-001');
    });

    it('should use default limit when not specified', async () => {
      mockOdoo.searchRead.mockResolvedValue([]);

      const tool = tools.queryFinancialDataTool();
      await tool.handler({ query_type: 'expenses' });

      expect(mockOdoo.searchRead).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.any(Array),
        { limit: 50 },
      );
    });
  });
});
