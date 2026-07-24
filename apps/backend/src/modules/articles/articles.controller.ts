import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import type { Article, ArticleResponse } from '@hexastudio/types';

@ApiTags('Articles')
@Controller({ path: 'articles', version: ['1', VERSION_NEUTRAL] })
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all articles with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'locale', required: false, type: String })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ): Promise<ArticleResponse> {
    return this.articlesService.getAllArticles(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      locale,
    );
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get article by slug' })
  async findOne(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ): Promise<Article> {
    return this.articlesService.getArticleBySlug(slug, locale);
  }
}
