import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Service, ServiceResponse } from '@hexastudio/types';
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
export class ServicesService {
  constructor(private readonly httpService: HttpService) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  async getAllServices(page = 1, limit = 20): Promise<ServiceResponse> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/services`, {
        params: {
          'populate': '*',
          'filters[isPublished][$eq]': true,
          'sort': 'order:asc',
          'pagination[page]': safePage,
          'pagination[pageSize]': safeLimit,
        },
      }),
    );

    const data = response.data;
    const total = data.meta?.pagination?.total ?? data.data.length;
    return {
      total,
      services: data.data.map((item: Record<string, unknown>) => this.mapService(item)),
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  }

  async getServiceBySlug(slug: string): Promise<Service> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/services`, {
        params: {
          'populate': '*',
          'filters[slug][$eq]': slug,
        },
      }),
    );

    const items = response.data.data;
    if (!items || items.length === 0) {
      throw new NotFoundException(`Service with slug "${slug}" not found`);
    }

    return this.mapService(items[0]);
  }

  private mapService(item: Record<string, unknown>): Service {
    const attrs = (item.attributes ?? item) as Record<string, unknown>;
    return {
      id: String(item.id),
      title: attrs.title as string,
      slug: attrs.slug as string,
      description: attrs.description as string,
      icon: mapMedia(attrs.icon as StrapiMedia) ?? 'settings',
      features: (attrs.features as string[]) ?? [],
      order: (attrs.order as number) ?? 0,
      isPublished: (attrs.isPublished as boolean) ?? true,
      createdAt: (attrs.createdAt as string) ?? new Date().toISOString(),
      updatedAt: (attrs.updatedAt as string) ?? new Date().toISOString(),
    };
  }
}
