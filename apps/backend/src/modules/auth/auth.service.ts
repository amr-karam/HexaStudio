import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import type { User } from '@hexastudio/types';
import { RedisService } from '../storage/redis.service';
import { getEnv } from '../../config/env';
import { UsersService } from '../users/users.service';

const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days
const BLACKLIST_TTL = 15 * 60; // 15 minutes (matches access token TTL)

const REFRESH_TOKEN_PREFIX = 'refresh_token:';
const FAMILY_PREFIX = 'refresh_token_family:';
const USER_TOKENS_PREFIX = 'user_tokens:';

interface TokenData {
  userId: string;
  familyId?: string;
}

interface FamilyData {
  activeToken: string;
  userId: string;
  createdAt: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
    private readonly usersService: UsersService,
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
    const user = await this.applyRoleOverride(this.mapUser(data.user));
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
    const user = await this.applyRoleOverride(this.mapUser(data.user));
    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken, user };
  }

  async refreshTokens(refreshToken: string) {
    const stored = await this.redis.get<TokenData>(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);
    if (!stored) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { userId, familyId } = stored;

    // Always delete the old token immediately
    await this.redis.del(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);

    if (familyId) {
      // ── Token with family tracking ── do reuse detection ──
      const family = await this.redis.get<FamilyData>(`${FAMILY_PREFIX}${familyId}`);

      if (!family) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      if (family.activeToken !== refreshToken) {
        // ⚠️ TOKEN REUSE DETECTED — the active token in this family was already rotated.
        // This means someone else already used a newer token, proving the current one was stolen.
        await this.redis.del(`${FAMILY_PREFIX}${familyId}`);
        await this.redis.srem(`${USER_TOKENS_PREFIX}${userId}`, familyId);

        this.logger.warn(
          `[SECURITY] Refresh token reuse detected — user=${userId} family=${familyId}. Entire token family revoked.`,
        );

        throw new UnauthorizedException('Token has been revoked');
      }

      // Normal rotation — same family, new token
      const newToken = randomUUID();

      // Update family with new active token
      await this.redis.set(
        `${FAMILY_PREFIX}${familyId}`,
        { activeToken: newToken, userId, createdAt: family.createdAt },
        REFRESH_TOKEN_TTL,
      );

      // Store new token → family mapping
      await this.redis.set(
        `${REFRESH_TOKEN_PREFIX}${newToken}`,
        { userId, familyId },
        REFRESH_TOKEN_TTL,
      );

      // Refresh user_tokens TTL
      await this.redis.expire(`${USER_TOKENS_PREFIX}${userId}`, REFRESH_TOKEN_TTL);

      const user = await this.fetchUser(userId);
      const accessToken = this.signAccessToken(user);

      return { accessToken, refreshToken: newToken, user };
    }

    // ── Legacy token (no familyId) ── backward-compatible path ──
    // On first rotation after deploy, migrate to family tracking
    const user = await this.fetchUser(userId);
    const accessToken = this.signAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken: newRefreshToken, user };
  }

  async validateUser(userId: string, jti?: string): Promise<User> {
    if (jti) {
      const blacklisted = await this.redis.get(`blacklist:${jti}`);
      if (blacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }
    return this.fetchUser(userId);
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
        this.httpService.get(`${this.cmsUrl}/api/users/me?populate=role`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      return this.applyRoleOverride(this.mapUser(response.data));
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async logout(accessToken: string, refreshToken?: string) {
    if (refreshToken) {
      await this.revokeRefreshToken(refreshToken);
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
      const response = await firstValueFrom(
        this.httpService.post(`${this.cmsUrl}/api/auth/reset-password`, {
          code,
          password,
          passwordConfirmation,
        }),
      );

      // Revoke all existing refresh tokens after password change
      const userId = String(response.data.user?.id ?? response.data.id ?? '');
      if (userId) {
        await this.revokeAllUserTokens(userId);
        this.logger.log(`All tokens revoked for user ${userId} after password reset`);
      }

      return { success: true };
    } catch {
      throw new BadRequestException('Failed to reset password');
    }
  }

  /**
   * Change password for an authenticated user.
   * Revokes all existing refresh tokens and issues new ones.
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.cmsUrl}/api/auth/change-password`,
          {
            currentPassword,
            password: newPassword,
            passwordConfirmation: newPassword,
          },
          {
            headers: { Authorization: `Bearer ${this.jwtService.sign({ sub: userId })}` },
          },
        ),
      );

      // Revoke all existing tokens
      await this.revokeAllUserTokens(userId);

      // Issue new tokens
      const user = this.mapUser(response.data.user ?? response.data);
      const accessToken = this.signAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user.id);

      this.logger.log(`Password changed and new tokens issued for user ${userId}`);

      return { accessToken, refreshToken, user };
    } catch {
      throw new BadRequestException('Failed to change password');
    }
  }

  /**
   * Revoke ALL refresh tokens for a user.
   * Used on password change / reset to force re-login everywhere.
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    const familyIds = await this.redis.smembers(`${USER_TOKENS_PREFIX}${userId}`);

    for (const familyId of familyIds) {
      const family = await this.redis.get<FamilyData>(`${FAMILY_PREFIX}${familyId}`);
      if (family?.activeToken) {
        await this.redis.del(`${REFRESH_TOKEN_PREFIX}${family.activeToken}`);
      }
      await this.redis.del(`${FAMILY_PREFIX}${familyId}`);
    }

    await this.redis.del(`${USER_TOKENS_PREFIX}${userId}`);

    this.logger.log(`Revoked ${familyIds.length} token families for user ${userId}`);
  }

  /**
   * Revoke a single refresh token and clean up its family reference.
   * Used during explicit logout to ensure the entire family is cleaned.
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const stored = await this.redis.get<TokenData>(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);

    if (stored?.familyId) {
      const { familyId, userId } = stored;

      // Remove familyId from user's token set
      await this.redis.srem(`${USER_TOKENS_PREFIX}${userId}`, familyId);

      // Delete the family data
      await this.redis.del(`${FAMILY_PREFIX}${familyId}`);

      this.logger.log(`Revoked token family ${familyId} for user ${userId} (explicit logout)`);
    }

    // Always delete the token itself
    await this.redis.del(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);
  }

  // ── Private helpers ──

  private signAccessToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role, jti: randomUUID() },
      { expiresIn: '15m' },
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = randomUUID();
    const familyId = randomUUID();

    // Store token → { userId, familyId }
    await this.redis.set(
      `${REFRESH_TOKEN_PREFIX}${token}`,
      { userId, familyId },
      REFRESH_TOKEN_TTL,
    );

    // Store family → { activeToken, userId, createdAt }
    await this.redis.set(
      `${FAMILY_PREFIX}${familyId}`,
      { activeToken: token, userId, createdAt: Date.now() },
      REFRESH_TOKEN_TTL,
    );

    // Track this family under the user so we can revoke all on password change
    await this.redis.sadd(`${USER_TOKENS_PREFIX}${userId}`, familyId);
    await this.redis.expire(`${USER_TOKENS_PREFIX}${userId}`, REFRESH_TOKEN_TTL);

    return token;
  }

  private async applyRoleOverride(cmsUser: User): Promise<User> {
    const localUser = await this.usersService.findByEmail(cmsUser.email);
    if (localUser) {
      return { ...cmsUser, role: localUser.role as User['role'] };
    }
    return cmsUser;
  }

  private async fetchUser(userId: string): Promise<User> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/users/${userId}?populate=role`, {
        headers: { Authorization: `Bearer ${this.jwtService.sign({ sub: userId })}` },
      }),
    );
    return this.applyRoleOverride(this.mapUser(response.data));
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
