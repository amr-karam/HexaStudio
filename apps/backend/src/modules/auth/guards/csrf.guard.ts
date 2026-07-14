import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

/**
 * Double-submit cookie CSRF guard.
 * - On login/register the controller sets a `csrf_token` cookie with a random token.
 * - State-changing requests must echo that token in the `X-CSRF-Token` header.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      cookies: Record<string, string | undefined>;
    }>();

    const cookieToken = req.cookies?.[CSRF_COOKIE];
    const headerToken = req.headers[CSRF_HEADER];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException('CSRF token mismatch');
    }

    return true;
  }
}

/** Generate a cryptographically random CSRF token (hex, 32 bytes). */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export const CSRF_COOKIE_NAME = CSRF_COOKIE;
export const CSRF_HEADER_NAME = CSRF_HEADER;
