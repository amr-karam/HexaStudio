import { Controller, Get, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
