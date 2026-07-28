import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalService } from './portal.service';

@Controller('portal/odoo')
@UseGuards(JwtAuthGuard)
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('projects')
  async getClientProjects(@Query('partner_id') partnerId: string) {
    return this.portalService.getClientProjects(parseInt(partnerId));
  }

  @Get('projects/:id/milestones')
  async getClientMilestones(@Param('id', ParseIntPipe) id: number) {
    return this.portalService.getClientMilestones(id);
  }

  @Get('invoices')
  async getClientInvoices(@Query('partner_id') partnerId: string) {
    return this.portalService.getClientInvoices(parseInt(partnerId));
  }

  @Get('summary')
  async getClientSummary(@Query('partner_id') partnerId: string) {
    return this.portalService.getClientSummary(parseInt(partnerId));
  }
}
