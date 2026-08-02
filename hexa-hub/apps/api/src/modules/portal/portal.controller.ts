import { Controller, Get, Post, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalService } from './portal.service';
import { PortalCopilotService } from './portal-copilot.service';
import type { CopilotQuery } from './portal-copilot.service';

@Controller('portal/odoo')
@UseGuards(JwtAuthGuard)
export class PortalController {
  constructor(
    private readonly portalService: PortalService,
    private readonly portalCopilotService: PortalCopilotService,
  ) {}

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

  @Post('copilot/multimodal-query')
  @UseGuards(JwtAuthGuard)
  async processMultimodalQuery(@Body() body: CopilotQuery) {
    return this.portalCopilotService.processMultimodalQuery(body);
  }

  @Post('copilot/analyze-model')
  @UseGuards(JwtAuthGuard)
  async analyzeModel(@Body() body: { fileBase64: string; fileName: string }) {
    return this.portalCopilotService.analyzeModel(body.fileBase64, body.fileName);
  }

  @Post('copilot/transcribe-audio')
  @UseGuards(JwtAuthGuard)
  async transcribeAudio(@Body() body: { audioBase64: string }) {
    return this.portalCopilotService.transcribeAudio(body.audioBase64);
  }
}
