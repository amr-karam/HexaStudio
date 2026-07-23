import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import type { Service, ServiceResponse } from '@hexastudio/types';

@ApiTags('Services')
@Controller({ path: 'services', version: ['1', VERSION_NEUTRAL] })
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all services with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'locale', required: false, type: String })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ): Promise<ServiceResponse> {
    return this.servicesService.getAllServices(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      locale,
    );
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get service by slug' })
  async findOne(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ): Promise<Service> {
    return this.servicesService.getServiceBySlug(slug, locale);
  }
}
