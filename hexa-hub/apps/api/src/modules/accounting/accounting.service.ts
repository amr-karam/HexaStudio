import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface AccountTreeNode {
  id: number;
  name: string;
  code: string;
  type: string;
  reconcile: boolean;
  parentId: number | null;
  children: AccountTreeNode[];
}

export interface TrialBalanceItem {
  accountId: number;
  accountName: string;
  accountCode: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface ProfitAndLossReport {
  revenue: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
  expenses: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
  grossProfit: number;
  netIncome: number;
}

export interface BalanceSheetReport {
  assets: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
  liabilities: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
  equity: { accounts: { id: number; name: string; code: string; amount: number }[]; total: number };
}

// ─── Service ───────────────────────────────────────────────────────────────

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);

  constructor(private readonly odoo: OdooService) {}

  // ─── Chart of Accounts ─────────────────────────────────────────────────

  async getChartOfAccounts(): Promise<AccountTreeNode[]> {
    const accounts = await this.odoo.getAccountTree();
    return this.buildTree(accounts as Record<string, unknown>[]);
  }

  private buildTree(accounts: Record<string, unknown>[]): AccountTreeNode[] {
    const map = new Map<number, AccountTreeNode>();
    const roots: AccountTreeNode[] = [];

    // First pass: create all nodes
    for (const acc of accounts) {
      const node: AccountTreeNode = {
        id: acc.id as number,
        name: acc.name as string,
        code: (acc.code as string) || '',
        type: (acc.user_type_id as [number, string])?.[1] || 'unknown',
        reconcile: (acc.reconcile as boolean) || false,
        parentId: (acc.parent_id as [number, string])?.[0] || null,
        children: [],
      };
      map.set(node.id, node);
    }

    // Second pass: build hierarchy
    for (const [, node] of map) {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async getAccountTree(): Promise<Record<string, AccountTreeNode[]>> {
    const accounts = await this.odoo.getAccountTree();
    const groups: Record<string, AccountTreeNode[]> = {
      assets: [],
      liabilities: [],
      equity: [],
      income: [],
      expenses: [],
    };

    const map = new Map<number, AccountTreeNode>();

    for (const acc of accounts as Record<string, unknown>[]) {
      const internalGroup = this.getInternalGroup(acc);
      if (!internalGroup) continue;

      const node: AccountTreeNode = {
        id: acc.id as number,
        name: acc.name as string,
        code: (acc.code as string) || '',
        type: (acc.user_type_id as [number, string])?.[1] || 'unknown',
        reconcile: (acc.reconcile as boolean) || false,
        parentId: (acc.parent_id as [number, string])?.[0] || null,
        children: [],
      };
      map.set(node.id, node);

      if (!node.parentId || !map.has(node.parentId)) {
        groups[internalGroup].push(node);
      }
    }

    // Attach children
    for (const [, node] of map) {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      }
    }

    return groups;
  }

  private getInternalGroup(acc: Record<string, unknown>): string | null {
    const type = acc.user_type_id as [number, string] | undefined;
    if (!type) return null;
    const typeName = type[1]?.toLowerCase() || '';
    if (typeName.includes('asset')) return 'assets';
    if (typeName.includes('liability')) return 'liabilities';
    if (typeName.includes('equity')) return 'equity';
    if (typeName.includes('income') || typeName.includes('revenue') || typeName.includes('gain')) return 'income';
    if (typeName.includes('expense') || typeName.includes('cost') || typeName.includes('loss') || typeName.includes('depreciation')) return 'expenses';
    return null;
  }

  async getAccount(id: number) {
    return this.odoo.getAccount(id);
  }

  // ─── Journals ──────────────────────────────────────────────────────────

  async getJournals() {
    return this.odoo.getJournals([], ['id', 'name', 'code', 'type', 'company_id', 'currency_id', 'default_account_id']);
  }

  // ─── Taxes ─────────────────────────────────────────────────────────────

  async getTaxes() {
    return this.odoo.getTaxes([], ['id', 'name', 'amount', 'amount_type', 'type_tax_use', 'tax_group_id', 'description']);
  }

  // ─── Fiscal Positions ─────────────────────────────────────────────────

  async getFiscalPositions() {
    return this.odoo.getFiscalPositions([], ['id', 'name', 'auto_apply', 'vat_required', 'note']);
  }

  // ─── Journal Entries ───────────────────────────────────────────────────

  async getJournalEntries(query: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    state?: string;
    journalId?: number;
  }) {
    const domain: unknown[] = [];

    if (query.dateFrom) domain.push(['date', '>=', query.dateFrom]);
    if (query.dateTo) domain.push(['date', '<=', query.dateTo]);
    if (query.state) domain.push(['state', '=', query.state]);
    if (query.journalId) domain.push(['journal_id', '=', query.journalId]);

    const limit = query.limit || 25;
    const offset = query.page ? (query.page - 1) * limit : 0;

    const [entries, total] = await Promise.all([
      this.odoo.getAccountMoves(
        domain,
        ['id', 'name', 'date', 'ref', 'journal_id', 'partner_id', 'state', 'amount_total', 'company_id'],
        { limit, offset, order: 'date desc' },
      ),
      this.odoo.searchCount('account.move', domain),
    ]);

    return { data: entries, meta: { total, page: query.page || 1, limit } };
  }

  async getJournalEntry(id: number) {
    const entry = await this.odoo.read('account.move', [id], [
      'id', 'name', 'date', 'ref', 'journal_id', 'partner_id', 'state', 'amount_total', 'narration', 'company_id',
    ]);
    if (!entry?.[0]) return null;

    const lines = await this.odoo.getAccountMoveLines(
      [['move_id', '=', id]],
      ['id', 'move_id', 'account_id', 'name', 'debit', 'credit', 'balance', 'partner_id', 'date', 'journal_id'],
    );

    return { ...(entry[0] as object), lines };
  }

  // ─── Financial Reports ─────────────────────────────────────────────────

  async getTrialBalance(dateFrom?: string, dateTo?: string): Promise<TrialBalanceItem[]> {
    // Get all account move lines in the date range
    const domain: unknown[] = [];
    if (dateFrom) domain.push(['date', '>=', dateFrom]);
    if (dateTo) domain.push(['date', '<=', dateTo]);

    const lines = await this.odoo.getAccountMoveLines(
      domain,
      ['id', 'account_id', 'debit', 'credit', 'balance', 'date'],
    ) as Record<string, unknown>[];

    // Aggregate by account
    const balances = new Map<number, { debit: number; credit: number }>();
    for (const line of lines) {
      const accountId = (line.account_id as [number, string])?.[0];
      if (!accountId) continue;
      const existing = balances.get(accountId) || { debit: 0, credit: 0 };
      existing.debit += (line.debit as number) || 0;
      existing.credit += (line.credit as number) || 0;
      balances.set(accountId, existing);
    }

    // Enrich with account names
    const accounts = await this.odoo.getAccounts([], ['id', 'name', 'code']);
    const accountMap = new Map<number, { name: string; code: string }>();
    for (const acc of accounts as Record<string, unknown>[]) {
      accountMap.set(acc.id as number, { name: acc.name as string, code: (acc.code as string) || '' });
    }

    // Build trial balance items
    const items: TrialBalanceItem[] = [];
    for (const [accountId, { debit, credit }] of balances) {
      const acc = accountMap.get(accountId);
      items.push({
        accountId,
        accountName: acc?.name || `Account #${accountId}`,
        accountCode: acc?.code || '',
        debit: Math.round(debit * 100) / 100,
        credit: Math.round(credit * 100) / 100,
        balance: Math.round((debit - credit) * 100) / 100,
      });
    }

    return items.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  }

  async getProfitAndLoss(dateFrom?: string, dateTo?: string): Promise<ProfitAndLossReport> {
    const trialBalance = await this.getTrialBalance(dateFrom, dateTo);
    const allAccounts = await this.odoo.getAccounts([], ['id', 'name', 'code', 'user_type_id']);

    // Build account type map
    const typeMap = new Map<number, string>();
    for (const acc of allAccounts as Record<string, unknown>[]) {
      const typeName = ((acc.user_type_id as [number, string])?.[1] || '').toLowerCase();
      typeMap.set(acc.id as number, typeName);
    }

    const incomeItems = trialBalance.filter((item) => {
      const t = typeMap.get(item.accountId) || '';
      return t.includes('income') || t.includes('revenue') || t.includes('gain');
    });

    const expenseItems = trialBalance.filter((item) => {
      const t = typeMap.get(item.accountId) || '';
      return t.includes('expense') || t.includes('cost') || t.includes('loss') || t.includes('depreciation');
    });

    const totalIncome = incomeItems.reduce((sum, item) => sum + Math.abs(item.balance), 0);
    const totalExpenses = expenseItems.reduce((sum, item) => sum + Math.abs(item.balance), 0);
    const netIncome = totalIncome - totalExpenses;

    return {
      revenue: {
        accounts: incomeItems.map((item) => ({
          id: item.accountId,
          name: item.accountName,
          code: item.accountCode,
          amount: Math.abs(item.balance),
        })),
        total: Math.round(totalIncome * 100) / 100,
      },
      expenses: {
        accounts: expenseItems.map((item) => ({
          id: item.accountId,
          name: item.accountName,
          code: item.accountCode,
          amount: Math.abs(item.balance),
        })),
        total: Math.round(totalExpenses * 100) / 100,
      },
      grossProfit: Math.round(totalIncome * 100) / 100,
      netIncome: Math.round(netIncome * 100) / 100,
    };
  }

  async getBalanceSheet(date?: string): Promise<BalanceSheetReport> {
    const dateTo = date || new Date().toISOString().split('T')[0];
    const trialBalance = await this.getTrialBalance(undefined, dateTo);
    const allAccounts = await this.odoo.getAccounts([], ['id', 'name', 'code', 'user_type_id']);

    // Build account type map
    const typeMap = new Map<number, string>();
    for (const acc of allAccounts as Record<string, unknown>[]) {
      const typeName = ((acc.user_type_id as [number, string])?.[1] || '').toLowerCase();
      typeMap.set(acc.id as number, typeName);
    }

    const assetItems = trialBalance.filter((item) => {
      const t = typeMap.get(item.accountId) || '';
      return t.includes('asset');
    });

    const liabilityItems = trialBalance.filter((item) => {
      const t = typeMap.get(item.accountId) || '';
      return t.includes('liability');
    });

    const equityItems = trialBalance.filter((item) => {
      const t = typeMap.get(item.accountId) || '';
      return t.includes('equity');
    });

    return {
      assets: {
        accounts: assetItems.map((item) => ({
          id: item.accountId,
          name: item.accountName,
          code: item.accountCode,
          amount: item.balance,
        })),
        total: Math.round(assetItems.reduce((sum, item) => sum + item.balance, 0) * 100) / 100,
      },
      liabilities: {
        accounts: liabilityItems.map((item) => ({
          id: item.accountId,
          name: item.accountName,
          code: item.accountCode,
          amount: Math.abs(item.balance),
        })),
        total: Math.round(liabilityItems.reduce((sum, item) => sum + Math.abs(item.balance), 0) * 100) / 100,
      },
      equity: {
        accounts: equityItems.map((item) => ({
          id: item.accountId,
          name: item.accountName,
          code: item.accountCode,
          amount: Math.abs(item.balance),
        })),
        total: Math.round(equityItems.reduce((sum, item) => sum + Math.abs(item.balance), 0) * 100) / 100,
      },
    };
  }

  // ─── Account Groups & Types ───────────────────────────────────────────

  async getAccountGroups() {
    return this.odoo.getAccountGroups([], ['id', 'name', 'code_prefix_start', 'code_prefix_end', 'company_id']);
  }

  async getAccountTypes() {
    return this.odoo.getAccountTypes();
  }
}
