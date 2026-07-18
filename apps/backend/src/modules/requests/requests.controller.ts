import { Controller, Post, Get, Body, Patch, Param, Query, DefaultValuePipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { RequestsService, ProjectRequest } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller({ path: 'requests', version: '1' })
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() data: Partial<ProjectRequest>): Promise<ProjectRequest> {
    return this.requestsService.createRequest(data);
  }

  @Get('client/:clientId')
  @UseGuards(JwtAuthGuard)
  async findByClient(
    @Param('clientId') clientId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const { data, total } = await this.requestsService.getRequestsByClient(clientId, page, limit);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  async findAllAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const { data, total } = await this.requestsService.findAll(page, limit);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Body('status') status: ProjectRequest['status']): Promise<ProjectRequest> {
    return this.requestsService.updateRequestStatus(id, status);
  }
}
