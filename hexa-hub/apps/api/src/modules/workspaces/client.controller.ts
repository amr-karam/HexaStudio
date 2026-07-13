import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('client')
@UseGuards(JwtAuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('workspaces')
  async getWorkspaces(req: any) {
    return this.clientService.getWorkspaces(req.user.id);
  }

  @Get('workspaces/:id')
  async getWorkspace(@Param('id') id: string, req: any) {
    return this.clientService.getWorkspace(req.user.id, id);
  }
}
