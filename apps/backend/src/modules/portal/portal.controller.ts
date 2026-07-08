import { Controller, Get, UseGuards } from '@nestjs/common';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('portal')
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
