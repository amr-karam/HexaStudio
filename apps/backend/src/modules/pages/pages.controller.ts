import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PagesService } from './pages.service';
import type { Page, PageResponse, EditorialHero } from '@hexastudio/types';

@ApiTags('Pages')
@Controller({ path: 'pages', version: ['1', VERSION_NEUTRAL] })
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'List all pages (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'locale', required: false, type: String, description: 'Locale code (default: en)' })
  @ApiResponse({ status: 200, description: 'List of pages' })
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

  @Get('editorial-hero')
  @ApiOperation({ summary: 'Get the editorial hero configured for a page (by slug)' })
  @ApiQuery({ name: 'slug', required: true, type: String, description: 'Page slug, e.g. "blog"' })
  @ApiResponse({ status: 200, description: 'Editorial hero, or null when none configured' })
  async editorialHero(@Query('slug') slug: string): Promise<EditorialHero | null> {
    return this.pagesService.getEditorialHero(slug);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a page by slug' })
  @ApiQuery({ name: 'locale', required: false, type: String, description: 'Locale code (default: en)' })
  @ApiResponse({ status: 200, description: 'Page found' })
  async findOne(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ): Promise<Page> {
    return this.pagesService.getPageBySlug(slug, locale);
  }
}
