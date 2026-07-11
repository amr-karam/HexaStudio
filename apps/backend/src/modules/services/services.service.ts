import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Service, ServiceResponse } from '@hexastudio/types';
import { getEnv } from '../../config/env';
import { StrapiRelation, getAttributes, getTotal, mapMedia } from '../../common/strapi.util';

@Injectable()
export class ServicesService {
  constructor(private readonly httpService: HttpService) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  async getAllServices(): Promise<ServiceResponse> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/services`, {
        params: {
          'populate': '*',
          'filters[isPublished][$eq]': true,
          'sort': 'order:asc',
        },
      }),
    );

    const data = response.data;
    return {
      total: getTotal(data),
      services: data.data.map((item: Record<string, unknown>) => this.mapService(item)),
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
    const attrs = getAttributes(item);
    return {
      id: String(item.id),
      title: attrs.title as string,
      slug: attrs.slug as string,
      description: attrs.description as string,
      icon: mapMedia(attrs.icon as StrapiRelation) ?? 'settings',
      features: (attrs.features as string[]) ?? [],
      order: (attrs.order as number) ?? 0,
      isPublished: (attrs.isPublished as boolean) ?? true,
      createdAt: (attrs.createdAt as string) ?? new Date().toISOString(),
      updatedAt: (attrs.updatedAt as string) ?? new Date().toISOString(),
    };
  }
}
