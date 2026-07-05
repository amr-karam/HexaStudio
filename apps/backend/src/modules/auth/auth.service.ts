import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { User, AuthResponse } from '@hexastudio/types';
import { getEnv } from '../../config/env';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.cmsUrl}/api/auth/local/register`, {
        email,
        username,
        password,
      }),
    );

    const data = response.data;
    const user = this.mapUser(data.user);

    const jwt = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '7d' },
    );

    return { jwt, user };
  }

  async login(identifier: string, password: string): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.cmsUrl}/api/auth/local`, {
        identifier,
        password,
      }),
    );

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
