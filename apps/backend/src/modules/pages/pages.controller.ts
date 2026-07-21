import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PagesService } from './pages.service';
import type { Page, PageResponse } from '@hexastudio/types';

@ApiTags('Pages')
@Controller({ path: 'pages', version: VERSION_NEUTRAL })
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'List all pages (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'locale', required: false, type: String, description: 'Locale code (default: en)' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ): Promise<PageResponse> {
    return this.pagesService.getAllPages(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      locale,
    );
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a page by slug' })
  @ApiQuery({ name: 'locale', required: false, type: String, description: 'Locale code (default: en)' })
  async findOne(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ): Promise<Page> {
    return this.pagesService.getPageBySlug(slug, locale);
  }
}
