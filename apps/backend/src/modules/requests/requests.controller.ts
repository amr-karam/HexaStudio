import { Controller, Post, Get, Body, Patch, Param, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { RequestsService, ProjectRequest } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller({ path: 'requests', version: VERSION_NEUTRAL })
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() data: Partial<ProjectRequest>): Promise<ProjectRequest> {
    return this.requestsService.createRequest(data);
  }

  @Get('client/:clientId')
  @UseGuards(JwtAuthGuard)
  async findByClient(@Param('clientId') clientId: string): Promise<ProjectRequest[]> {
    return this.requestsService.getRequestsByClient(clientId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  async findAllAdmin(): Promise<ProjectRequest[]> {
    return this.requestsService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Body('status') status: ProjectRequest['status']): Promise<ProjectRequest> {
    return this.requestsService.updateRequestStatus(id, status);
  }
}
