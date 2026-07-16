import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FAQ, FAQResponse, RichTextBlock } from '@hexastudio/types';
import { getEnv } from '../../config/env';

@Injectable()
export class FAQsService {
  constructor(private readonly httpService: HttpService) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  async getAllFAQs(page = 1, limit = 50, locale?: string): Promise<FAQResponse> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/faqs`, {
        params: {
          'populate': '*',
          'filters[isPublished][$eq]': true,
          'sort': 'order:asc',
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
      faqs: data.data.map((item: Record<string, unknown>) => this.mapFAQ(item)),
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  }

  async getFAQsByCategory(category: string, locale?: string): Promise<FAQ[]> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/faqs`, {
        params: {
          'populate': '*',
          'filters[isPublished][$eq]': true,
          'filters[category][$eq]': category,
          'sort': 'order:asc',
          ...(locale ? { locale } : {}),
        },
      }),
    );

    return response.data.data.map((item: Record<string, unknown>) => this.mapFAQ(item));
  }

  async getFAQById(id: string, locale?: string): Promise<FAQ> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/faqs/${id}`, {
        params: { 'populate': '*', ...(locale ? { locale } : {}) },
      }),
    );

    const item = response.data.data;
    if (!item) {
      throw new NotFoundException(`FAQ with id "${id}" not found`);
    }

    return this.mapFAQ(item);
  }

  private mapFAQ(item: Record<string, unknown>): FAQ {
    const attrs = (item.attributes ?? item) as Record<string, unknown>;
    return {
      id: String(item.id),
      question: attrs.question as string,
      answer: (attrs.answer as RichTextBlock[]) ?? [],
      category: attrs.category as string | undefined,
      order: (attrs.order as number) ?? 0,
      isPublished: (attrs.isPublished as boolean) ?? true,
      createdAt: (attrs.createdAt as string) ?? new Date().toISOString(),
      updatedAt: (attrs.updatedAt as string) ?? new Date().toISOString(),
    };
  }
}
