import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Achievement, AchievementResponse } from '@hexastudio/types';
import { getEnv } from '../../config/env';

@Injectable()
export class AchievementsService {
  constructor(private readonly httpService: HttpService) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  private get cmsHeaders(): Record<string, string> | undefined {
    const token = getEnv().CMS_API_TOKEN;
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }

  async getAllAchievements(): Promise<AchievementResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.cmsUrl}/api/achievements`, {
          headers: this.cmsHeaders,
          params: {
            populate: '*',
            sort: 'order:asc',
          },
        }),
      );

      const data = response.data;
      const total = data.meta?.pagination?.total ?? data.data.length;
      return {
        achievements: data.data.map((item: Record<string, unknown>) => this.mapAchievement(item)),
        total,
      };
    } catch {
      return { achievements: [], total: 0 };
    }
  }

  private mapAchievement(item: Record<string, unknown>): Achievement {
    const attrs = (item.attributes ?? item) as Record<string, unknown>;
    return {
      id: item.id as number,
      title: attrs.title as string,
      value: attrs.value as string,
      description: attrs.description as string | undefined,
      order: (attrs.order as number) ?? 0,
    };
  }
}
