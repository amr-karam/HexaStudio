import { Controller, Get, Param } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service, ServiceResponse } from '@hexastudio/types';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll(): Promise<ServiceResponse> {
    return this.servicesService.getAllServices();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<Service> {
    return this.servicesService.getServiceBySlug(slug);
  }
}
