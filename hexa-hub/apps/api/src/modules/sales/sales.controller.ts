import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { SalesService } from './sales.service';

@Controller('odoo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ─── Quotations ─────────────────────────────────────────────────────

  @Get('quotations')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getQuotation(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.salesService.getQuotation(id) };
  }

  @Post('quotations')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async createQuotation(@Body() body: Record<string, unknown>) {
    return { data: await this.salesService.createQuotation(body) };
  }

  @Patch('quotations/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async updateQuotation(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return { data: await this.salesService.updateQuotation(id, body) };
  }

  @Post('quotations/:id/send')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async sendQuotation(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.salesService.sendQuotation(id) };
  }

  @Post('quotations/:id/accept')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async acceptQuotation(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.salesService.acceptQuotation(id) };
  }

  @Post('quotations/:id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async cancelQuotation(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.salesService.cancelQuotation(id) };
  }

  @Get('quotations/:id/lines')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getQuotationLines(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.getQuotationLines(id);
  }

  // ─── Sales Orders ───────────────────────────────────────────────────

  @Get('sales/orders')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getInvoice(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.salesService.getInvoice(id) };
  }

  // ─── Stats ──────────────────────────────────────────────────────────

  @Get('sales/stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getStats() {
    return { data: await this.salesService.getStats() };
  }
}
