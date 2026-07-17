import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import type { User } from '@hexastudio/types';
import { RedisService } from '../storage/redis.service';
import { getEnv } from '../../config/env';

const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days
const BLACKLIST_TTL = 15 * 60; // 15 minutes (matches access token TTL)

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  async register(email: string, username: string, password: string) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.cmsUrl}/api/auth/local/register`, {
        email,
        username,
        password,
      }),
    );

    const data = response.data;
    const user = this.mapUser(data.user);
    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken, user };
  }

  async login(identifier: string, password: string) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.cmsUrl}/api/auth/local`, {
        identifier,
        password,
      }),
    );

    const data = response.data;
    const user = this.mapUser(data.user);
    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken, user };
  }

  async refreshTokens(refreshToken: string) {
    const stored = await this.redis.get<{ userId: string }>(`refresh_token:${refreshToken}`);
    if (!stored) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.redis.del(`refresh_token:${refreshToken}`);

    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/users/${stored.userId}`, {
        headers: { Authorization: `Bearer ${this.jwtService.sign({ sub: stored.userId })}` },
      }),
    );

    const user = this.mapUser(response.data);
    const accessToken = this.signAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken: newRefreshToken, user };
  }

  async validateToken(token: string): Promise<User> {
    try {
      const decoded = this.jwtService.decode(token) as { jti?: string } | null;
      if (decoded?.jti) {
        const blacklisted = await this.redis.get(`blacklist:${decoded.jti}`);
        if (blacklisted) {
          throw new UnauthorizedException('Token has been revoked');
        }
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.cmsUrl}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      return this.mapUser(response.data);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async logout(accessToken: string, refreshToken?: string) {
    if (refreshToken) {
      await this.redis.del(`refresh_token:${refreshToken}`);
    }

    try {
      const decoded = this.jwtService.decode(accessToken) as { jti?: string; exp?: number } | null;
      if (decoded?.jti && decoded?.exp) {
        const remainingTtl = Math.max(1, Math.floor(decoded.exp - Date.now() / 1000));
        await this.redis.set(`blacklist:${decoded.jti}`, true, Math.min(remainingTtl, BLACKLIST_TTL));
      }
    } catch {
      // Gracefully handle decode errors
    }
  }

  async forgotPassword(email: string) {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.cmsUrl}/api/auth/forgot-password`, { email }),
      );
      return { success: true };
    } catch {
      throw new BadRequestException('Failed to send password reset email');
    }
  }

  async resetPassword(code: string, password: string, passwordConfirmation: string) {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.cmsUrl}/api/auth/reset-password`, {
          code,
          password,
          passwordConfirmation,
        }),
      );
      return { success: true };
    } catch {
      throw new BadRequestException('Failed to reset password');
    }
  }

  private signAccessToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role, jti: randomUUID() },
      { expiresIn: '15m' },
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = randomUUID();
    await this.redis.set(`refresh_token:${token}`, { userId }, REFRESH_TOKEN_TTL);
    return token;
  }

  private mapUser(data: { id: number; email: string; username: string; role?: { type: string } }): User {
    return {
      id: String(data.id),
      email: data.email,
      username: data.username,
      role: data.role?.type === 'admin' ? 'admin' : data.role?.type === 'editor' ? 'editor' : 'user',
    };
  }
}
