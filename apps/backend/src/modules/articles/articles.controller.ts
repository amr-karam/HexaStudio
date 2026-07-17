import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import type { Article, ArticleResponse } from '@hexastudio/types';

@Controller({ path: 'articles', version: VERSION_NEUTRAL })
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
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
  async findOne(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ): Promise<Article> {
    return this.articlesService.getArticleBySlug(slug, locale);
  }
}
