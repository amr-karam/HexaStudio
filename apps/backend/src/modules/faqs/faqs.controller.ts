import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { FAQsService } from './faqs.service';
import type { FAQ, FAQResponse } from '@hexastudio/types';

@Controller({ path: 'faqs', version: VERSION_NEUTRAL })
export class FAQsController {
  constructor(private readonly faqsService: FAQsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ): Promise<FAQResponse> {
    return this.faqsService.getAllFAQs(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
      locale,
    );
  }

  @Get('category/:category')
  async findByCategory(
    @Param('category') category: string,
    @Query('locale') locale?: string,
  ): Promise<FAQ[]> {
    return this.faqsService.getFAQsByCategory(category, locale);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ): Promise<FAQ> {
    return this.faqsService.getFAQById(id, locale);
  }
}
