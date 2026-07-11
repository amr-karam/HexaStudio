import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Article, ArticleResponse } from '@hexastudio/types';
import { getEnv } from '../../config/env';
import {
  StrapiRelation,
  getAttributes,
  getTotal,
  mapCategory,
  mapMedia,
} from '../../common/strapi.util';

@Injectable()
export class ArticlesService {
  constructor(private readonly httpService: HttpService) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  async getAllArticles(): Promise<ArticleResponse> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/articles`, {
        params: {
          'populate': '*',
          'filters[isPublished][$eq]': true,
          'sort': 'createdAt:desc',
        },
      }),
    );

    const data = response.data;
    return {
      total: getTotal(data),
      articles: data.data.map((item: Record<string, unknown>) => this.mapArticle(item)),
    };
  }

  async getArticleBySlug(slug: string): Promise<Article> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/articles`, {
        params: {
          'populate': '*',
          'filters[slug][$eq]': slug,
        },
      }),
    );

    const items = response.data.data;
    if (!items || items.length === 0) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    return this.mapArticle(items[0]);
  }

  private mapArticle(item: Record<string, unknown>): Article {
    const attrs = getAttributes(item);
    return {
      id: String(item.id),
      title: attrs.title as string,
      slug: attrs.slug as string,
      excerpt: attrs.excerpt as string,
      content: (attrs.content as unknown[]) ?? [],
      coverImage: mapMedia(attrs.coverImage as StrapiRelation) ?? '',
      category: mapCategory(attrs.category as StrapiRelation),
      author: attrs.author as string,
      readTime: (attrs.readTime as number) ?? 5,
      tags: (attrs.tags as string[]) ?? [],
      seoTitle: attrs.seoTitle as string | undefined,
      seoDescription: attrs.seoDescription as string | undefined,
      isPublished: (attrs.isPublished as boolean) ?? true,
      createdAt: (attrs.createdAt as string) ?? new Date().toISOString(),
      updatedAt: (attrs.updatedAt as string) ?? new Date().toISOString(),
    };
  }
}
