import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountingService } from '../src/modules/accounting/accounting.service';
import { OdooService } from '../src/modules/odoo/odoo.service';

describe('AccountingService', () => {
  let service: AccountingService;
  let odooService: OdooService;

  const mockInvoices = [
    { id: 1, name: 'INV-001', move_type: 'out_invoice', state: 'posted', payment_state: 'paid', amount_total: 5000, amount_residual: 0, invoice_date: '2026-01-01', invoice_origin: '', partner_id: [1, 'Client A'], currency_id: [1, 'USD'] },
    { id: 2, name: 'INV-002', move_type: 'out_invoice', state: 'posted', payment_state: 'not_paid', amount_total: 3000, amount_residual: 3000, invoice_date: '2026-02-01', invoice_origin: '', partner_id: [2, 'Client B'], currency_id: [1, 'USD'] },
    { id: 3, name: 'BILL-001', move_type: 'in_invoice', state: 'posted', payment_state: 'paid', amount_total: 1200, amount_residual: 0, invoice_date: '2026-01-15', invoice_origin: '', partner_id: [3, 'Vendor A'], currency_id: [1, 'USD'] },
    { id: 4, name: 'INV-003', move_type: 'out_invoice', state: 'draft', payment_state: 'not_paid', amount_total: 800, amount_residual: 800, invoice_date: '2026-03-01', invoice_origin: '', partner_id: [1, 'Client A'], currency_id: [1, 'USD'] },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingService,
        {
          provide: OdooService,
          useValue: {
            searchRead: vi.fn(),
            execute: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountingService>(AccountingService);
    odooService = module.get<OdooService>(OdooService);
  });

  describe('getChartOfAccounts', () => {
    it('returns accounts from Odoo', async () => {
      const mockAccounts = [{ id: 1, code: '1000', name: 'Cash', account_type: 'asset_cash', reconcile: false, deprecated: false, currency_id: false }];
      vi.mocked(odooService.searchRead).mockResolvedValueOnce(mockAccounts);

      const result = await service.getChartOfAccounts();
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('1000');
    });

    it('returns empty array on error', async () => {
      vi.mocked(odooService.searchRead).mockRejectedValueOnce(new Error('Odoo error'));
      const result = await service.getChartOfAccounts();
      expect(result).toEqual([]);
    });
  });

  describe('getJournals', () => {
    it('returns journals from Odoo', async () => {
      const mockJournals = [{ id: 1, name: 'Bank', code: 'BNK', type: 'bank', currency_id: false, active: true }];
      vi.mocked(odooService.searchRead).mockResolvedValueOnce(mockJournals);

      const result = await service.getJournals();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bank');
    });

    it('returns empty array on error', async () => {
      vi.mocked(odooService.searchRead).mockRejectedValueOnce(new Error('Odoo error'));
      const result = await service.getJournals();
      expect(result).toEqual([]);
    });
  });

  describe('getTaxes', () => {
    it('returns taxes from Odoo', async () => {
      const mockTaxes = [{ id: 1, name: 'VAT 11%', amount: 11, type_tax_use: 'sale', amount_type: 'percent', active: true }];
      vi.mocked(odooService.searchRead).mockResolvedValueOnce(mockTaxes);

      const result = await service.getTaxes();
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(11);
    });

    it('returns empty array on error', async () => {
      vi.mocked(odooService.searchRead).mockRejectedValueOnce(new Error('fail'));
      const result = await service.getTaxes();
      expect(result).toEqual([]);
    });
  });

  describe('getInvoices', () => {
    it('returns invoices from Odoo', async () => {
      vi.mocked(odooService.execute).mockResolvedValueOnce(mockInvoices);
      const result = await service.getInvoices();
      expect(result).toHaveLength(4);
    });

    it('returns empty array on error', async () => {
      vi.mocked(odooService.execute).mockRejectedValueOnce(new Error('fail'));
      const result = await service.getInvoices();
      expect(result).toEqual([]);
    });
  });

  describe('getDashboard', () => {
    it('calculates total_revenue from posted out_invoices', async () => {
      // Four calls: getChartOfAccounts, getJournals, getTaxes, getInvoices(1000)
      vi.mocked(odooService.searchRead)
        .mockResolvedValueOnce([]) // accounts
        .mockResolvedValueOnce([]) // journals
        .mockResolvedValueOnce([]); // taxes
      vi.mocked(odooService.execute).mockResolvedValueOnce(mockInvoices);

      const summary = await service.getDashboard();
      // posted out_invoices: INV-001 (5000) + INV-002 (3000) = 8000
      expect(summary.total_revenue).toBe(8000);
    });

    it('calculates total_expenses from posted in_invoices', async () => {
      vi.mocked(odooService.searchRead)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      vi.mocked(odooService.execute).mockResolvedValueOnce(mockInvoices);

      const summary = await service.getDashboard();
      // posted in_invoices: BILL-001 (1200)
      expect(summary.total_expenses).toBe(1200);
    });

    it('counts draft invoices correctly', async () => {
      vi.mocked(odooService.searchRead)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      vi.mocked(odooService.execute).mockResolvedValueOnce(mockInvoices);

      const summary = await service.getDashboard();
      expect(summary.draft_count).toBe(1);
      expect(summary.posted_count).toBe(3);
    });

    it('returns zero dashboard on error', async () => {
      vi.mocked(odooService.searchRead).mockRejectedValue(new Error('fail'));
      vi.mocked(odooService.execute).mockRejectedValue(new Error('fail'));

      const summary = await service.getDashboard();
      expect(summary.total_revenue).toBe(0);
      expect(summary.invoice_count).toBe(0);
      expect(summary.currency).toBe('LBP');
    });
  });
});
