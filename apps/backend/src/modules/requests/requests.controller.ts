import { Controller, Post, Get, Body, Patch, Param, Query, DefaultValuePipe, ParseIntPipe, UseGuards, VERSION_NEUTRAL, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RequestsService, ProjectRequest } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Request } from 'express';
import type { User } from '@hexastudio/types';

@ApiTags('Requests')
@Controller({ path: 'requests', version: ['1', VERSION_NEUTRAL] })
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project request' })
  async create(@Body() data: Partial<ProjectRequest>): Promise<ProjectRequest> {
    return this.requestsService.createRequest(data);
  }

  @Get('client/:clientId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get requests by client ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByClient(
    @Req() request: Request & { user?: User },
    @Param('clientId') clientId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const user = request.user;
    if (!user) throw new UnauthorizedException('Authentication required');

    // IDOR guard: regular users may only query their own requests (matched by their
    // email in the CRM lead source); staff may query by an explicit client filter.
    const isStaff = user.role === 'admin' || user.role === 'editor';
    const effectiveClientId = isStaff ? clientId : user.email;

    const { data, total } = await this.requestsService.getRequestsByClient(effectiveClientId, page, limit);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all requests (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update request status' })
  async updateStatus(@Param('id') id: string, @Body('status') status: ProjectRequest['status']): Promise<ProjectRequest> {
    return this.requestsService.updateRequestStatus(id, status);
  }
}
