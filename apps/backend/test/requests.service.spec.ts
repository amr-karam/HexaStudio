import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RequestsService } from '../src/modules/requests/requests.service';
import { OdooService } from '../src/modules/odoo/odoo.service';

describe('RequestsService', () => {
  let service: RequestsService;
  let odooService: OdooService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: OdooService,
          useValue: {
            create: vi.fn(),
            searchRead: vi.fn(),
            write: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
    odooService = module.get<OdooService>(OdooService);
  });

  describe('createRequest', () => {
    it('creates a CRM lead and returns a request object', async () => {
      vi.mocked(odooService.create).mockResolvedValueOnce(42);

      const result = await service.createRequest({
        title: 'New 3D Model Request',
        description: 'Need 3D renderings',
        priority: 'high',
        clientId: 'client@example.com',
        projectId: 'proj-123',
      });

      expect(result.id).toBe('REQ-42');
      expect(result.title).toBe('New 3D Model Request');
      expect(result.priority).toBe('high');
      expect(result.status).toBe('pending');
      expect(odooService.create).toHaveBeenCalledWith(
        'crm.lead',
        expect.objectContaining({ name: '[Request] New 3D Model Request', priority: '3' }),
      );
    });

    it('handles low priority correctly', async () => {
      vi.mocked(odooService.create).mockResolvedValueOnce(10);
      const result = await service.createRequest({ title: 'Low prio', priority: 'low' });
      expect(result.priority).toBe('low');
      expect(odooService.create).toHaveBeenCalledWith('crm.lead', expect.objectContaining({ priority: '1' }));
    });

    it('defaults to medium priority when none specified', async () => {
      vi.mocked(odooService.create).mockResolvedValueOnce(5);
      const result = await service.createRequest({ title: 'No priority request' });
      expect(result.priority).toBe('medium');
      expect(odooService.create).toHaveBeenCalledWith('crm.lead', expect.objectContaining({ priority: '2' }));
    });
  });

  describe('getRequestsByClient', () => {
    it('returns requests for a client email', async () => {
      const mockLeads = [
        { id: 10, name: '[Request] Design Update', partner_name: 'Client Co', description: 'Update needed', priority: '3', stage_id: [1, 'New'], create_date: '2026-01-01' },
        { id: 11, name: '[Request] Minor Fix', partner_name: 'Client Co', description: '', priority: '1', stage_id: [1, 'New'], create_date: '2026-01-15' },
      ];
      vi.mocked(odooService.searchRead).mockResolvedValueOnce(mockLeads);

      const result = await service.getRequestsByClient('client@example.com');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('REQ-10');
      expect(result[0].title).toBe('Design Update');
      expect(result[0].priority).toBe('high');
      expect(result[1].priority).toBe('low');
    });
  });

  describe('updateRequestStatus', () => {
    it('updates lead stage in Odoo and returns updated request', async () => {
      vi.mocked(odooService.write).mockResolvedValueOnce(true as any);

      const result = await service.updateRequestStatus('REQ-42', 'reviewed');
      expect(result.id).toBe('REQ-42');
      expect(result.status).toBe('reviewed');
      expect(odooService.write).toHaveBeenCalledWith('crm.lead', [42], expect.objectContaining({ stage_id: 2 }));
    });

    it('throws NotFoundException for invalid ID format', async () => {
      await expect(service.updateRequestStatus('INVALID-ID', 'completed')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns all requests from Odoo', async () => {
      const mockLeads = [
        { id: 1, name: '[Request] Task A', partner_name: 'Client A', description: '', priority: '2', stage_id: [1, 'New'], create_date: '2026-01-01' },
      ];
      vi.mocked(odooService.searchRead).mockResolvedValueOnce(mockLeads);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Task A');
      expect(result[0].priority).toBe('medium');
    });
  });
});
