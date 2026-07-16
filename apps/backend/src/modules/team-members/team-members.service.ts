import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TeamMember, TeamMemberResponse } from '@hexastudio/types';
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
export class TeamMembersService {
  constructor(private readonly httpService: HttpService) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  async getAllTeamMembers(page = 1, limit = 50): Promise<TeamMemberResponse> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/team-members`, {
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
      teamMembers: data.data.map((item: Record<string, unknown>) => this.mapTeamMember(item)),
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  }

  async getTeamMemberBySlug(slug: string): Promise<TeamMember> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/team-members`, {
        params: {
          'populate': '*',
          'filters[slug][$eq]': slug,
        },
      }),
    );

    const items = response.data.data;
    if (!items || items.length === 0) {
      throw new NotFoundException(`Team member with slug "${slug}" not found`);
    }

    return this.mapTeamMember(items[0]);
  }

  private mapTeamMember(item: Record<string, unknown>): TeamMember {
    const attrs = (item.attributes ?? item) as Record<string, unknown>;
    return {
      id: String(item.id),
      name: attrs.name as string,
      slug: attrs.slug as string,
      role: attrs.role as string,
      department: attrs.department as string | undefined,
      bio: attrs.bio as string | undefined,
      avatar: mapMedia(attrs.avatar as StrapiMedia),
      email: attrs.email as string | undefined,
      linkedIn: attrs.linkedIn as string | undefined,
      skills: (attrs.skills as string[]) ?? [],
      order: (attrs.order as number) ?? 0,
      isPublished: (attrs.isPublished as boolean) ?? true,
      createdAt: (attrs.createdAt as string) ?? new Date().toISOString(),
      updatedAt: (attrs.updatedAt as string) ?? new Date().toISOString(),
    };
  }
}
