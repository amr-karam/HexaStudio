import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyPortalData(@Param('clientId') clientId: string) {
    // In real world, clientId comes from JWT token
    return this.portalService.getClientProjectData('mock-client-id');
  }

  // For development/demo purpose, providing a public endpoint
  @Get('demo')
  async getDemoPortalData() {
    return this.portalService.getClientProjectData('demo-client-id');
  }
}
