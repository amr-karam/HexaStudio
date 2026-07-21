import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Page, PageResponse, RichTextBlock } from '@hexastudio/types';
import { getEnv } from '../../config/env';

interface StrapiMedia {
  url?: string;
  alternativeText?: string;
  data?: {
    id: number;
    attributes?: {
      url: string;
      alternativeText?: string;
    };
  };
}

function mapMedia(relation: StrapiMedia | undefined): { url: string; alternativeText?: string } | undefined {
  if (!relation) return undefined;
  if (relation.url) {
    return { url: relation.url, alternativeText: relation.alternativeText };
  }
  if (relation.data?.attributes?.url) {
    return {
      url: relation.data.attributes.url,
      alternativeText: relation.data.attributes.alternativeText,
    };
  }
  return undefined;
}

@Injectable()
export class PagesService {
  constructor(private readonly httpService: HttpService) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  async getAllPages(page = 1, limit = 20, locale?: string): Promise<PageResponse> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.cmsUrl}/api/pages`, {
          params: {
            populate: '*',
            sort: 'createdAt:desc',
            'pagination[page]': safePage,
            'pagination[pageSize]': safeLimit,
            ...(locale ? { locale } : {}),
          },
        }),
      );

      const data = response.data;
      const total = data.meta?.pagination?.total ?? data.data.length;
      return {
        pages: data.data.map((item: Record<string, unknown>) => this.mapPage(item)),
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit) || 1,
      };
    } catch {
      return { pages: [], total: 0, page: safePage, limit: safeLimit, totalPages: 0 };
    }
  }

  async getPageBySlug(slug: string, locale?: string): Promise<Page> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.cmsUrl}/api/pages`, {
          params: {
            populate: '*',
            'filters[slug][$eq]': slug,
            ...(locale ? { locale } : {}),
          },
        }),
      );

      const items = response.data.data;
      if (!items || items.length === 0) {
        throw new NotFoundException(`Page with slug "${slug}" not found`);
      }

      return this.mapPage(items[0]);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }
  }

  private mapPage(item: Record<string, unknown>): Page {
    const attrs = (item.attributes ?? item) as Record<string, unknown>;
    return {
      id: item.id as number,
      slug: attrs.slug as string,
      title: attrs.title as string,
      content: (attrs.content as RichTextBlock[]) ?? [],
      excerpt: attrs.excerpt as string | undefined,
      featuredImage: mapMedia(attrs.featuredImage as StrapiMedia),
      seoTitle: attrs.seoTitle as string | undefined,
      seoDescription: attrs.seoDescription as string | undefined,
    };
  }
}
