import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { PortalService } from '../src/modules/portal/portal.service';
import { OdooService } from '../src/modules/odoo/odoo.service';

describe('PortalService', () => {
  let service: PortalService;
  let odooService: OdooService;

  const mockPartner = [{ id: 42 }];

  const mockProjects = [
    {
      id: 1,
      name: 'Villa Beirut',
      x_hexa_status: 'in-progress',
      x_hexa_type: 'residential',
      date_start: '2026-05-01',
      date: '2026-07-30',
    },
  ];

  const mockMilestones = [
    { id: 1, name: 'Concept Design', date: '2026-05-12', completed: true, x_hexa_description: 'Initial concepts' },
    { id: 2, name: '3D Modeling', date: '2026-06-01', completed: false, x_hexa_description: 'Modeling phase' },
  ];

  const mockInvoices = [
    { id: 1, name: 'INV-2026-001', invoice_date: '2026-05-01', amount_total: 5000, amount_residual: 0, payment_state: 'paid', state: 'posted' },
    { id: 2, name: 'INV-2026-002', invoice_date: '2026-06-15', amount_total: 12000, amount_residual: 12000, payment_state: 'not_paid', state: 'posted' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalService,
        {
          provide: OdooService,
          useValue: { execute: vi.fn() },
        },
      ],
    }).compile();

    service = module.get<PortalService>(PortalService);
    odooService = module.get<OdooService>(OdooService);
  });

  const mockExecuteSequence = (...results: unknown[][]) => {
    let call = 0;
    vi.mocked(odooService.execute).mockImplementation(async () => {
      const res = results[call] ?? [];
      call += 1;
      return res;
    });
  };

  it('returns project title from Odoo', async () => {
    mockExecuteSequence(mockPartner, mockProjects, mockMilestones, mockInvoices);

    const result = await service.getClientProjectData('client@example.com');

    expect(result.project.title).toBe('Villa Beirut');
    expect(result.timeline).toHaveLength(2);
    expect(result.invoices).toHaveLength(2);
  });

  it('maps milestone completion to timeline status', async () => {
    mockExecuteSequence(mockPartner, mockProjects, mockMilestones, []);

    const result = await service.getClientProjectData('client@example.com');

    expect(result.timeline[0].status).toBe('completed');
    expect(result.timeline[1].status).toBe('pending');
  });

  it('maps invoice payment state correctly', async () => {
    mockExecuteSequence(mockPartner, [], mockInvoices);

    const result = await service.getClientProjectData('client@example.com');

    expect(result.invoices[0].status).toBe('paid');
    expect(result.invoices[1].status).toBe('pending');
  });

  it('returns empty project when partner not resolved', async () => {
    mockExecuteSequence([]);

    const result = await service.getClientProjectData('unknown@example.com');

    expect(result.project.title).toBe('No Project');
    expect(result.timeline).toHaveLength(0);
  });

  it('sets lead email from parameter', async () => {
    mockExecuteSequence([]);

    const result = await service.getClientProjectData('specific@client.com');

    expect(result.lead.email).toBe('specific@client.com');
  });

  it('uses default email when no clientEmail provided', async () => {
    const result = await service.getClientProjectData();

    expect(result.lead.email).toBe('client@hexastudio.net');
  });

  it('handles Odoo failure gracefully', async () => {
    vi.mocked(odooService.execute).mockRejectedValueOnce(new Error('fail'));

    const result = await service.getClientProjectData('client@example.com');

    expect(result.project.title).toBe('No Project');
    expect(result.timeline).toBeDefined();
  });
});
