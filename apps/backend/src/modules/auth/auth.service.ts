import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { User, AuthResponse } from '@hexastudio/types';
import { getEnv } from '../../config/env';

interface UpstreamHttpError {
  response?: { status?: number; data?: unknown };
  message?: string;
}

/**
 * Structural check for an Axios error. `instanceof AxiosError` is unreliable
 * here because the monorepo can resolve more than one copy of axios, so the
 * error thrown by the HTTP layer may not be an instance of the `AxiosError`
 * this module imported. The `isAxiosError` flag is set by axios on every error
 * it raises and is stable across copies/versions.
 */
function isUpstreamHttpError(error: unknown): error is UpstreamHttpError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { isAxiosError?: unknown }).isAxiosError === true
  );
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  /**
   * Translates an upstream CMS (Strapi) failure into a meaningful HTTP error.
   * Without this, any auth failure surfaces to the client as a generic 500,
   * hiding the real cause (e.g. invalid credentials or a duplicate account).
   */
  private toHttpException(error: unknown, fallbackMessage: string): HttpException {
    if (isUpstreamHttpError(error)) {
      const status = error.response?.status;
      const cmsMessage =
        (error.response?.data as { error?: { message?: string } } | undefined)?.error?.message;

      if (status === undefined) {
        this.logger.error(`CMS unreachable during auth: ${error.message}`);
        return new ServiceUnavailableException('Authentication service is temporarily unavailable');
      }

      if (status === 400 || status === 401 || status === 403) {
        return new BadRequestException(cmsMessage ?? fallbackMessage);
      }

      this.logger.error(
        `Unexpected CMS auth response (${status}): ${cmsMessage ?? error.message}`,
      );
      return new ServiceUnavailableException('Authentication service is temporarily unavailable');
    }

    this.logger.error(
      `Unexpected auth error: ${error instanceof Error ? error.message : String(error)}`,
    );
    return new ServiceUnavailableException(fallbackMessage);
  }

  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    let response;
    try {
      response = await firstValueFrom(
        this.httpService.post(`${this.cmsUrl}/api/auth/local/register`, {
          email,
          username,
          password,
        }),
      );
    } catch (error) {
      throw this.toHttpException(error, 'Registration failed');
    }

    const data = response.data;
    const user = this.mapUser(data.user);

    const jwt = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '7d' },
    );

    return { jwt, user };
  }

  async login(identifier: string, password: string): Promise<AuthResponse> {
    let response;
    try {
      response = await firstValueFrom(
        this.httpService.post(`${this.cmsUrl}/api/auth/local`, {
          identifier,
          password,
        }),
      );
    } catch (error) {
      if (isUpstreamHttpError(error) && error.response?.status !== undefined) {
        const status = error.response.status;
        if (status === 400 || status === 401 || status === 403) {
          throw new UnauthorizedException('Invalid credentials');
        }
      }
      throw this.toHttpException(error, 'Login failed');
    }

    const data = response.data;
    const user = this.mapUser(data.user);

    const jwt = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '7d' },
    );

    return { jwt, user };
  }

  async validateToken(token: string): Promise<User> {
    try {
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

  async refreshToken(userId: string): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${this.jwtService.sign({ sub: userId })}` },
      }),
    );

    const user = this.mapUser(response.data);

    const jwt = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '7d' },
    );

    return { jwt, user };
  }

  private mapUser(data: { id: number; email: string; username: string; role?: { type: string } }): User {
    return {
      id: String(data.id),
      email: data.email,
      username: data.username,
      role: data.role?.type === 'admin' ? 'admin' : 'user',
    };
  }
}
