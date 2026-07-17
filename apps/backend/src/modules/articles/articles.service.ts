import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Article, ArticleResponse, Category, RichTextBlock } from '@hexastudio/types';
import { getEnv } from '../../config/env';

interface StrapiRelation {
  data?: { id: number; attributes?: Record<string, unknown> };
  id?: number;
  name?: string;
  slug?: string;
}

function mapCategory(relation: StrapiRelation | undefined): Category | undefined {
  if (!relation) return undefined;
  if (relation.id && relation.name) {
    return { id: String(relation.id), name: relation.name, slug: relation.slug ?? '' };
  }
  if (relation.data) {
    return {
      id: String(relation.data.id),
      name: (relation.data.attributes?.name as string) ?? '',
      slug: (relation.data.attributes?.slug as string) ?? '',
    };
  }
  return undefined;
}

function mapMedia(relation: StrapiRelation | undefined): string | undefined {
  if (!relation) return undefined;
  if (typeof relation === 'string') return relation;
  if ('url' in relation) return relation.url as string;
  if (relation.data?.attributes?.url) return relation.data.attributes.url as string;
  return undefined;
}

@Injectable()
export class ArticlesService {
  constructor(private readonly httpService: HttpService) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  async getAllArticles(page = 1, limit = 20, locale?: string): Promise<ArticleResponse> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/articles`, {
        params: {
          'populate': '*',
          'filters[isPublished][$eq]': true,
          'sort': 'createdAt:desc',
          'pagination[page]': safePage,
          'pagination[pageSize]': safeLimit,
          ...(locale ? { locale } : {}),
        },
      }),
    );

    const data = response.data;
    const total = data.meta?.pagination?.total ?? data.data.length;
    return {
      total,
      articles: data.data.map((item: Record<string, unknown>) => this.mapArticle(item)),
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  }

  async getArticleBySlug(slug: string, locale?: string): Promise<Article> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/articles`, {
        params: {
          'populate': '*',
          'filters[slug][$eq]': slug,
          ...(locale ? { locale } : {}),
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
    const attrs = (item.attributes ?? item) as Record<string, unknown>;
    return {
      id: String(item.id),
      title: attrs.title as string,
      slug: attrs.slug as string,
      excerpt: attrs.excerpt as string,
      content: (attrs.content as RichTextBlock[]) ?? [],
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
