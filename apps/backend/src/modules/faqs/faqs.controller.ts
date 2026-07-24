import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FAQsService } from './faqs.service';
import type { FAQ, FAQResponse } from '@hexastudio/types';

@ApiTags('FAQs')
@Controller({ path: 'faqs', version: ['1', VERSION_NEUTRAL] })
export class FAQsController {
  constructor(private readonly faqsService: FAQsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all FAQs with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'locale', required: false, type: String })
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
  @ApiOperation({ summary: 'Get FAQs by category' })
  async findByCategory(
    @Param('category') category: string,
    @Query('locale') locale?: string,
  ): Promise<FAQ[]> {
    return this.faqsService.getFAQsByCategory(category, locale);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get FAQ by ID' })
  async findOne(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ): Promise<FAQ> {
    return this.faqsService.getFAQById(id, locale);
  }
}
