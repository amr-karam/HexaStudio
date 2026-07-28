import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SalesService } from './sales.service';

@Controller('odoo')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ─── Quotations ─────────────────────────────────────────────────────

  @Get('quotations')
  async getQuotations(
    @Query('state') state?: string,
    @Query('partner_id') partner_id?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.salesService.getQuotations({
      state,
      partner_id: partner_id ? parseInt(partner_id) : undefined,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 25,
    });
  }

  @Get('quotations/:id')
  async getQuotation(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.salesService.getQuotation(id) };
  }

  @Post('quotations')
  async createQuotation(@Body() body: Record<string, unknown>) {
    return { data: await this.salesService.createQuotation(body) };
  }

  @Patch('quotations/:id')
  async updateQuotation(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return { data: await this.salesService.updateQuotation(id, body) };
  }

  @Post('quotations/:id/send')
  async sendQuotation(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.salesService.sendQuotation(id) };
  }

  @Post('quotations/:id/accept')
  async acceptQuotation(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.salesService.acceptQuotation(id) };
  }

  @Post('quotations/:id/cancel')
  async cancelQuotation(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.salesService.cancelQuotation(id) };
  }

  @Get('quotations/:id/lines')
  async getQuotationLines(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.getQuotationLines(id);
  }

  // ─── Sales Orders ───────────────────────────────────────────────────

  @Get('sales/orders')
  async getSalesOrders(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.salesService.getSalesOrders({
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 25,
    });
  }

  // ─── Invoices ───────────────────────────────────────────────────────

  @Get('invoices')
  async getInvoices(
    @Query('state') state?: string,
    @Query('partner_id') partner_id?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.salesService.getInvoices({
      state,
      partner_id: partner_id ? parseInt(partner_id) : undefined,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 25,
    });
  }

  @Get('invoices/:id')
  async getInvoice(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.salesService.getInvoice(id) };
  }

  // ─── Stats ──────────────────────────────────────────────────────────

  @Get('sales/stats')
  async getStats() {
    return { data: await this.salesService.getStats() };
  }
}
