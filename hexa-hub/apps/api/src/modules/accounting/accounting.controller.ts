import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountingService } from './accounting.service';

@ApiTags('Accounting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // ─── Chart of Accounts ─────────────────────────────────────────────────

  @Get('chart-of-accounts')
  @ApiOperation({ summary: 'Full Chart of Accounts tree with parent-child hierarchy' })
  getChartOfAccounts() {
    return this.accountingService.getChartOfAccounts();
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Flat list of all accounts' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by account type group' })
  getAccounts(@Query('type') type?: string) {
    return this.accountingService.getAccountTree().then((tree) => {
      if (type && tree[type]) return tree[type];
      return tree;
    });
  }

  @Get('accounts/tree')
  @ApiOperation({ summary: 'Accounts organized by type groups (assets, liabilities, equity, income, expenses)' })
  getAccountTree() {
    return this.accountingService.getAccountTree();
  }

  @Get('accounts/:id')
  @ApiOperation({ summary: 'Single account detail by ID' })
  getAccount(@Param('id', ParseIntPipe) id: number) {
    return this.accountingService.getAccount(id);
  }

  // ─── Journals ──────────────────────────────────────────────────────────

  @Get('journals')
  @ApiOperation({ summary: 'All accounting journals' })
  getJournals() {
    return this.accountingService.getJournals();
  }

  // ─── Taxes ─────────────────────────────────────────────────────────────

  @Get('taxes')
  @ApiOperation({ summary: 'All tax configurations' })
  getTaxes() {
    return this.accountingService.getTaxes();
  }

  // ─── Fiscal Positions ─────────────────────────────────────────────────

  @Get('fiscal-positions')
  @ApiOperation({ summary: 'All fiscal positions' })
  getFiscalPositions() {
    return this.accountingService.getFiscalPositions();
  }

  // ─── Journal Entries ───────────────────────────────────────────────────

  @Get('journal-entries')
  @ApiOperation({ summary: 'Paginated journal entries' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'state', required: false, description: 'Entry state (draft, posted)' })
  @ApiQuery({ name: 'journalId', required: false, description: 'Filter by journal ID' })
  getJournalEntries(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('state') state?: string,
    @Query('journalId') journalId?: string,
  ) {
    return this.accountingService.getJournalEntries({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      dateFrom,
      dateTo,
      state,
      journalId: journalId ? parseInt(journalId, 10) : undefined,
    });
  }

  @Get('journal-entries/:id')
  @ApiOperation({ summary: 'Single journal entry with lines' })
  getJournalEntry(@Param('id', ParseIntPipe) id: number) {
    return this.accountingService.getJournalEntry(id);
  }

  // ─── Financial Reports ─────────────────────────────────────────────────

  @Get('reports/trial-balance')
  @ApiOperation({ summary: 'Trial balance report' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date (YYYY-MM-DD)' })
  getTrialBalance(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.accountingService.getTrialBalance(dateFrom, dateTo);
  }

  @Get('reports/profit-and-loss')
  @ApiOperation({ summary: 'Profit & Loss (Income Statement) report' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Period start (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Period end (YYYY-MM-DD)' })
  getProfitAndLoss(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.accountingService.getProfitAndLoss(dateFrom, dateTo);
  }

  @Get('reports/balance-sheet')
  @ApiOperation({ summary: 'Balance Sheet report' })
  @ApiQuery({ name: 'date', required: false, description: 'As-of date (YYYY-MM-DD), defaults to today' })
  getBalanceSheet(@Query('date') date?: string) {
    return this.accountingService.getBalanceSheet(date);
  }

  // ─── Account Groups & Types ───────────────────────────────────────────

  @Get('account-groups')
  @ApiOperation({ summary: 'All account groups' })
  getAccountGroups() {
    return this.accountingService.getAccountGroups();
  }

  @Get('account-types')
  @ApiOperation({ summary: 'All account types' })
  getAccountTypes() {
    return this.accountingService.getAccountTypes();
  }
}
