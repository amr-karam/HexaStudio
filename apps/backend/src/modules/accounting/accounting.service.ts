import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

export interface Account {
  id: number;
  code: string;
  name: string;
  account_type: string;
  reconcile: boolean;
  deprecated: boolean;
  currency_id: [number, string] | false;
}

export interface Journal {
  id: number;
  name: string;
  code: string;
  type: string;
  currency_id: [number, string] | false;
  active: boolean;
}

export interface Tax {
  id: number;
  name: string;
  amount: number;
  type_tax_use: string;
  amount_type: string;
  active: boolean;
}

export interface Invoice {
  id: number;
  name: string;
  invoice_date: string;
  invoice_origin: string;
  partner_id: [number, string];
  amount_total: number;
  amount_residual: number;
  currency_id: [number, string];
  state: string;
  move_type: string;
  payment_state: string;
}

export interface DashboardSummary {
  total_revenue: number;
  total_expenses: number;
  outstanding_receivable: number;
  outstanding_payable: number;
  invoice_count: number;
  draft_count: number;
  posted_count: number;
  paid_count: number;
  journal_count: number;
  account_count: number;
  tax_count: number;
  currency: string;
}

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);

  constructor(private readonly odooService: OdooService) {}

  async getChartOfAccounts(): Promise<Account[]> {
    try {
      const accounts = await this.odooService.searchRead(
        'account.account',
        [['deprecated', '=', false]],
        ['code', 'name', 'account_type', 'reconcile', 'deprecated', 'currency_id'],
      );
      return accounts as unknown as Account[];
    } catch (error) {
      this.logger.error(`Failed to fetch chart of accounts: ${error}`);
      return [];
    }
  }

  async getJournals(): Promise<Journal[]> {
    try {
      const journals = await this.odooService.searchRead(
        'account.journal',
        [['active', '=', true]],
        ['name', 'code', 'type', 'currency_id', 'active'],
      );
      return journals as unknown as Journal[];
    } catch (error) {
      this.logger.error(`Failed to fetch journals: ${error}`);
      return [];
    }
  }

  async getTaxes(): Promise<Tax[]> {
    try {
      const taxes = await this.odooService.searchRead(
        'account.tax',
        [['active', '=', true]],
        ['name', 'amount', 'type_tax_use', 'amount_type', 'active'],
      );
      return taxes as unknown as Tax[];
    } catch (error) {
      this.logger.error(`Failed to fetch taxes: ${error}`);
      return [];
    }
  }

  async getInvoices(limit = 50, offset = 0): Promise<Invoice[]> {
    try {
      const invoices = await this.odooService.execute<Record<string, unknown>[]>(
        'account.move',
        'search_read',
        [
          [['move_type', 'in', ['out_invoice', 'out_refund', 'in_invoice', 'in_refund']]],
          ['name', 'invoice_date', 'invoice_origin', 'partner_id', 'amount_total', 'amount_residual', 'currency_id', 'state', 'move_type', 'payment_state'],
          offset,
          limit,
          'invoice_date desc',
        ],
      );
      return invoices as unknown as Invoice[];
    } catch (error) {
      this.logger.error(`Failed to fetch invoices: ${error}`);
      return [];
    }
  }

  async getJournalEntries(limit = 50, offset = 0): Promise<Record<string, unknown>[]> {
    try {
      const entries = await this.odooService.execute<Record<string, unknown>[]>(
        'account.move',
        'search_read',
        [
          [['move_type', '=', 'entry']],
          ['name', 'date', 'ref', 'journal_id', 'state', 'amount_total'],
          offset,
          limit,
          'date desc',
        ],
      );
      return entries;
    } catch (error) {
      this.logger.error(`Failed to fetch journal entries: ${error}`);
      return [];
    }
  }

  async getDashboard(): Promise<DashboardSummary> {
    try {
      const [accounts, journals, taxes, invoices] = await Promise.all([
        this.getChartOfAccounts(),
        this.getJournals(),
        this.getTaxes(),
        this.getInvoices(1000, 0),
      ]);

      const totalRevenue = invoices
        .filter((inv) => inv.move_type === 'out_invoice' && inv.state === 'posted')
        .reduce((sum, inv) => sum + (inv.amount_total || 0), 0);

      const totalExpenses = invoices
        .filter((inv) => inv.move_type === 'in_invoice' && inv.state === 'posted')
        .reduce((sum, inv) => sum + (inv.amount_total || 0), 0);

      const outstandingReceivable = invoices
        .filter((inv) => inv.move_type === 'out_invoice' && inv.state === 'posted')
        .reduce((sum, inv) => sum + (inv.amount_residual || 0), 0);

      const outstandingPayable = invoices
        .filter((inv) => inv.move_type === 'in_invoice' && inv.state === 'posted')
        .reduce((sum, inv) => sum + (inv.amount_residual || 0), 0);

      return {
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        outstanding_receivable: outstandingReceivable,
        outstanding_payable: outstandingPayable,
        invoice_count: invoices.length,
        draft_count: invoices.filter((i) => i.state === 'draft').length,
        posted_count: invoices.filter((i) => i.state === 'posted').length,
        paid_count: invoices.filter((i) => i.payment_state === 'paid').length,
        journal_count: journals.length,
        account_count: accounts.length,
        tax_count: taxes.length,
        currency: 'LBP',
      };
    } catch (error) {
      this.logger.error(`Failed to build dashboard: ${error}`);
      return {
        total_revenue: 0,
        total_expenses: 0,
        outstanding_receivable: 0,
        outstanding_payable: 0,
        invoice_count: 0,
        draft_count: 0,
        posted_count: 0,
        paid_count: 0,
        journal_count: 0,
        account_count: 0,
        tax_count: 0,
        currency: 'LBP',
      };
    }
  }
}
