import { Controller, Get, Param } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article, ArticleResponse } from '@hexastudio/types';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async findAll(): Promise<ArticleResponse> {
    return this.articlesService.getAllArticles();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<Article> {
    return this.articlesService.getArticleBySlug(slug);
  }
}
