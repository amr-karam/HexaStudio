import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { RedisService } from '../storage/redis.service';
import type { User } from '@hexastudio/types';

const PUSH_TOKEN_PREFIX = 'mobile:push-token:';

@Injectable()
export class MobileApiService {
  constructor(
    private authService: AuthService,
    private redis: RedisService,
  ) {}

  async register(body: { email: string; username: string; password: string }) {
    return this.authService.register(body.email, body.username, body.password);
  }

  async login(body: { identifier: string; password: string }) {
    return this.authService.login(body.identifier, body.password);
  }

  async registerPushToken(
    user: User,
    token: string,
    platform: 'ios' | 'android' | 'web' | undefined,
  ): Promise<{ success: boolean }> {
    const key = `${PUSH_TOKEN_PREFIX}${user.id}`;
    await this.redis.sadd(key, JSON.stringify({ token, platform: platform ?? 'unknown', updatedAt: Date.now() }));
    await this.redis.expire(key, 60 * 60 * 24 * 365); // 1 year
    return { success: true };
  }

  async getPushTokens(userId: string): Promise<Array<{ token: string; platform: string; updatedAt: number }>> {
    const raw = await this.redis.smembers(`${PUSH_TOKEN_PREFIX}${userId}`);
    return raw
      .map((item) => {
        try {
          return JSON.parse(item) as { token: string; platform: string; updatedAt: number };
        } catch {
          return null;
        }
      })
      .filter((item): item is { token: string; platform: string; updatedAt: number } => item !== null);
  }
}