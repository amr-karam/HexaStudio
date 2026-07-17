import { Controller, Get, Param, Req, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Portal')
@Controller({ path: 'portal', version: VERSION_NEUTRAL })
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyPortalData() {
    return this.portalService.getClientProjectData();
  }

  @Get('demo')
  async getDemoPortalData() {
    return this.portalService.getClientProjectData();
  }

  // --- Client-scoped Odoo endpoints ---

  @Get('odoo/projects')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Odoo projects visible to the authenticated client' })
  async getClientProjects(@Req() req: { user: { email: string } }) {
    const partnerId = await this.portalService.resolvePartnerId(req.user.email);
    if (!partnerId) return [];
    return this.portalService.getClientProjects(partnerId);
  }

  @Get('odoo/projects/:id/milestones')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get client-viewable milestones for a project' })
  async getClientMilestones(@Req() req: { user: { email: string } }, @Param('id') id: string) {
    const partnerId = await this.portalService.resolvePartnerId(req.user.email);
    if (!partnerId) return [];
    // Verify project belongs to this client before returning milestones
    const projects = await this.portalService.getClientProjects(partnerId);
    const project = projects.find((p) => p.id === parseInt(id, 10));
    if (!project) return [];
    return project.milestones;
  }

  @Get('odoo/invoices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Odoo invoices for the authenticated client' })
  async getClientInvoices(@Req() req: { user: { email: string } }) {
    const partnerId = await this.portalService.resolvePartnerId(req.user.email);
    if (!partnerId) return [];
    return this.portalService.getClientInvoices(partnerId);
  }
}
