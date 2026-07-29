import { Test, TestingModule } from '@nestjs/testing';
import { CrmService } from './crm.service';
import { OdooService } from '../odoo/odoo.service';

describe('CrmService', () => {
  let service: CrmService;
  let odooService: jest.Mocked<OdooService>;

  const mockLeads = [
    {
      id: 1,
      name: 'Lead A',
      stage_id: [1, 'New'] as [number, string],
      planned_revenue: 50000,
      x_hexa_source: 'website',
      create_date: '2026-07-01',
    },
    {
      id: 2,
      name: 'Lead B',
      stage_id: [2, 'Contacted'] as [number, string],
      planned_revenue: 75000,
      x_hexa_source: 'referral',
      create_date: '2026-07-05',
    },
    {
      id: 3,
      name: 'Lead C',
      stage_id: [3, 'Won'] as [number, string],
      planned_revenue: 120000,
      x_hexa_source: 'website',
      create_date: '2026-07-10',
    },
    {
      id: 4,
      name: 'Lead D',
      stage_id: [3, 'Won'] as [number, string],
      planned_revenue: 80000,
      x_hexa_source: 'direct',
      create_date: '2026-07-12',
    },
    {
      id: 5,
      name: 'Lead E',
      stage_id: [1, 'New'] as [number, string],
      planned_revenue: 30000,
      x_hexa_source: 'social',
      create_date: '2026-07-15',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrmService,
        {
          provide: OdooService,
          useValue: {
            getLeads: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CrmService>(CrmService);
    odooService = module.get(OdooService);
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return aggregated stats with leads_by_stage and leads_by_source', async () => {
      odooService.getLeads.mockResolvedValue(mockLeads);

      const stats = await service.getStats();

      expect(stats).toEqual({
        total_leads: 5,
        total_revenue: 355000,
        conversion_rate: 40,
        average_deal_size: 100000,
        leads_by_stage: {
          New: 2,
          Contacted: 1,
          Won: 2,
        },
        leads_by_source: {
          website: 2,
          referral: 1,
          direct: 1,
          social: 1,
        },
      });
    });

    it('should handle empty leads gracefully', async () => {
      odooService.getLeads.mockResolvedValue([]);

      const stats = await service.getStats();

      expect(stats).toEqual({
        total_leads: 0,
        total_revenue: 0,
        conversion_rate: 0,
        average_deal_size: 0,
        leads_by_stage: {},
        leads_by_source: {},
      });
    });

    it('should handle leads with missing stage or source', async () => {
      const leadsWithMissing = [
        {
          id: 1,
          name: 'Lead No Stage',
          stage_id: null,
          planned_revenue: 10000,
          x_hexa_source: null,
          create_date: '2026-07-01',
        },
      ];

      odooService.getLeads.mockResolvedValue(leadsWithMissing);

      const stats = await service.getStats();

      expect(stats.leads_by_stage).toEqual({ unknown: 1 });
      expect(stats.leads_by_source).toEqual({ unknown: 1 });
      expect(stats.conversion_rate).toBe(0);
    });
  });
});