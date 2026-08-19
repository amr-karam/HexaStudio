import { Controller, Get, Post, Body, UseGuards, ParseIntPipe, Query, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { PortalService } from './portal.service';
import { PortalCopilotService } from './portal-copilot.service';
import type { CopilotQuery } from './portal-copilot.service';

@Controller('portal/odoo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PortalController {
  constructor(
    private readonly portalService: PortalService,
    private readonly portalCopilotService: PortalCopilotService,
  ) {}

  @Get('projects')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getClientProjects(@Query('partner_id') partnerId: string) {
    return this.portalService.getClientProjects(parseInt(partnerId));
  }

  @Get('projects/:id/milestones')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getClientMilestones(@Param('id', ParseIntPipe) id: number) {
    return this.portalService.getClientMilestones(id);
  }

  @Get('invoices')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getClientInvoices(@Query('partner_id') partnerId: string) {
    return this.portalService.getClientInvoices(parseInt(partnerId));
  }

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getClientSummary(@Query('partner_id') partnerId: string) {
    return this.portalService.getClientSummary(parseInt(partnerId));
  }

  @Post('copilot/multimodal-query')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async processMultimodalQuery(@Body() body: CopilotQuery) {
    return this.portalCopilotService.processMultimodalQuery(body);
  }

  @Post('copilot/analyze-model')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async analyzeModel(@Body() body: { fileBase64: string; fileName: string }) {
    return this.portalCopilotService.analyzeModel(body.fileBase64, body.fileName);
  }

  @Post('copilot/transcribe-audio')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async transcribeAudio(@Body() body: { audioBase64: string }) {
    return this.portalCopilotService.transcribeAudio(body.audioBase64);
  }
}
