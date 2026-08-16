import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT guard variant that allows anonymous access.
 *
 * Unlike {@link JwtAuthGuard}, it does NOT throw 401 when the request carries
 * no (or an invalid) token — it simply returns `null` as the user. Handlers
 * use it for "who am I" style endpoints (e.g. `GET /users/me`) where
 * "unauthenticated" is a valid answer (logged-out visitor) rather than an
 * error. This keeps browsers free of noisy 401 console errors on public pages.
 *
 * NOTE: never use this guard for endpoints that must require authentication;
 * it silently degrades to anonymous.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | null,
  ): TUser | null {
    return user ?? null;
  }
}
