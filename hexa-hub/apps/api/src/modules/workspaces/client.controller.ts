import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { Request } from 'express';

@Controller('client')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('workspaces')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getWorkspaces(@Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    return this.clientService.getWorkspaces(userId);
  }

  @Get('workspaces/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getWorkspace(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    return this.clientService.getWorkspace(userId, id);
  }
}
