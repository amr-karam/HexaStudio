import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import type { User } from '@hexastudio/types';
import { getEnv } from '../../../config/env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    const env = getEnv();
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // First try cookie, then fall back to Bearer header
        (request: Request) => request?.cookies?.auth_token,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<User> {
    try {
      return await this.authService.validateToken(payload.sub);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
