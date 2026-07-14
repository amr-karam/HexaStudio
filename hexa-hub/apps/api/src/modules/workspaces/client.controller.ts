import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('client')
@UseGuards(JwtAuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('workspaces')
  async getWorkspaces(@Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    return this.clientService.getWorkspaces(userId);
  }

  @Get('workspaces/:id')
  async getWorkspace(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    return this.clientService.getWorkspace(userId, id);
  }
}
