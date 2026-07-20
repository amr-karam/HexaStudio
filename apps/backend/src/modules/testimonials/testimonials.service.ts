import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Testimonial, TestimonialResponse } from '@hexastudio/types';
import { getEnv } from '../../config/env';

interface StrapiMedia {
  data?: { id: number; attributes?: { url?: string } };
  url?: string;
}

function mapMedia(relation: StrapiMedia | undefined): string | undefined {
  if (!relation) return undefined;
  if (typeof relation === 'string') return relation;
  if (relation.url) return relation.url;
  if (relation.data?.attributes?.url) return relation.data.attributes.url;
  return undefined;
}

@Injectable()
export class TestimonialsService {
  constructor(private readonly httpService: HttpService) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  async getAllTestimonials(page = 1, limit = 20): Promise<TestimonialResponse> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/testimonials`, {
        params: {
          'populate': '*',
          'sort': 'createdAt:desc',
          'pagination[page]': safePage,
          'pagination[pageSize]': safeLimit,
        },
      }),
    );

    const data = response.data;
    const total = data.meta?.pagination?.total ?? data.data.length;
    return {
      total,
      testimonials: data.data.map((item: Record<string, unknown>) => this.mapTestimonial(item)),
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  }

  async getFeaturedTestimonials(): Promise<Testimonial[]> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/testimonials`, {
        params: {
          'populate': '*',
          'filters[featured][$eq]': true,
          'sort': 'createdAt:desc',
        },
      }),
    );

    return response.data.data.map((item: Record<string, unknown>) => this.mapTestimonial(item));
  }

  async getTestimonialById(id: string): Promise<Testimonial> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/testimonials/${id}`, {
        params: { 'populate': '*' },
      }),
    );

    const item = response.data.data;
    if (!item) {
      throw new NotFoundException(`Testimonial with id "${id}" not found`);
    }

    return this.mapTestimonial(item);
  }

  private mapTestimonial(item: Record<string, unknown>): Testimonial {
    const attrs = (item.attributes ?? item) as Record<string, unknown>;
    return {
      id: String(item.id),
      clientName: (attrs.clientName ?? attrs.client_name ?? '') as string,
      clientCompany: (attrs.clientCompany ?? attrs.client_company) as string | undefined,
      clientRole: (attrs.clientRole ?? attrs.client_role ?? attrs.clientTitle ?? attrs.client_title) as string | undefined,
      content: (attrs.content ?? '') as string,
      rating: (attrs.rating as number) ?? 5,
      projectReference: attrs.projectReference as string | undefined,
      avatar: mapMedia(attrs.avatar as StrapiMedia),
      isFeatured: (attrs.featured ?? attrs.isFeatured ?? false) as boolean,
      isPublished: attrs.publishedAt != null || (attrs.isPublished as boolean) === true,
      createdAt: (attrs.createdAt ?? attrs.created_at ?? new Date().toISOString()) as string,
      updatedAt: (attrs.updatedAt ?? attrs.updated_at ?? new Date().toISOString()) as string,
    };
  }
}
