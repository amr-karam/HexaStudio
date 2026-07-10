import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';

@ApiTags('Accounting')
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('chart-of-accounts')
  @ApiOperation({ summary: 'Get chart of accounts' })
  async getChartOfAccounts() {
    return this.accountingService.getChartOfAccounts();
  }

  @Get('journals')
  @ApiOperation({ summary: 'Get all journals' })
  async getJournals() {
    return this.accountingService.getJournals();
  }

  @Get('taxes')
  @ApiOperation({ summary: 'Get all taxes' })
  async getTaxes() {
    return this.accountingService.getTaxes();
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get invoices' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getInvoices(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.accountingService.getInvoices(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('journal-entries')
  @ApiOperation({ summary: 'Get journal entries' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getJournalEntries(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.accountingService.getJournalEntries(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get accounting dashboard summary' })
  async getDashboard() {
    return this.accountingService.getDashboard();
  }
}
