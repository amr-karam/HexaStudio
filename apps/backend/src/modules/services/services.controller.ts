import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service, ServiceResponse } from '@hexastudio/types';

@Controller({ path: 'services', version: VERSION_NEUTRAL })
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ServiceResponse> {
    return this.servicesService.getAllServices(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<Service> {
    return this.servicesService.getServiceBySlug(slug);
  }
}
