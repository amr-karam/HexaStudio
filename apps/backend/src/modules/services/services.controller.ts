import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { ServicesService } from './services.service';
import type { Service, ServiceResponse } from '@hexastudio/types';

@Controller({ path: 'services', version: VERSION_NEUTRAL })
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
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
  async findOne(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ): Promise<Service> {
    return this.servicesService.getServiceBySlug(slug, locale);
  }
}
