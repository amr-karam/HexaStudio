# Authentication Flow

**Last Updated:** 2026-07-08

---

## Architecture

```
[Client Browser]
    │
    ├── POST /auth/login ─────────────► [Traefik] ──► [NestJS Auth]
    │                                       │              │
    │                                       │         Validate credentials
    │                                       │         Generate JWT pair
    │                                       │         Store refresh (DB)
    │                                       │              │
    │◄────────── { accessToken, refreshToken } ◄────────────┘
    │
    ├── GET /api/v1/projects ────────► [Traefik] ──► [NestJS]
    │   Authorization: Bearer <accessToken>              │
    │                                                Validate JWT
    │                                                Return data
    │◄─────────────────── Response ◄─────────────────────┘
    │
    └── POST /auth/refresh ──────────► [Traefik] ──► [NestJS]
        { refreshToken }                                │
                                                   Validate refresh
                                                   Issue new pair
```

## Token Flow Diagram

```
User Login
    │
    ▼
Server validates credentials
    │
    ├── Failed ──► Return 401
    │
    └── Success
        │
        ├── Generate Access Token (RS256, 15 min TTL)
        │   Payload: { sub: userId, roles: [...], iat, exp }
        │
        ├── Generate Refresh Token (256-bit random, 7 day TTL)
        │   Stored: hashed in database
        │
        └── Return both tokens to client
                │
                ▼
        Client stores tokens
        (HTTP-only cookie + memory for SPA)
                │
                ▼
        API calls include Access Token
                │
                ├── Valid ──► Process request
                │
                └── Expired
                    │
                    ├── Client calls /auth/refresh
                    ├── Server validates Refresh Token
                    ├── Generates new Access Token
                    └── Retries original request
```

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Token theft (XSS) | HTTP-only cookies for refresh token |
| Token theft (MITM) | TLS 1.3 required |
| Replay attacks | Short TTL (15 min) + jti claim |
| Refresh token theft | Rotation (old token invalidated on use) |
| Brute force | Rate limiting (5 attempts / 15 min) |
| Session fixation | New session ID on each login |

## Roles and Permissions

```
Roles: public, client, user, editor, admin, superadmin

public:   view projects, blog, services
client:   + view assigned projects, upload files
user:     + manage profile
editor:   + manage content (Strapi)
admin:    + manage users, view all data
superadmin: + manage roles, infrastructure access
```

## Guard Implementation

```typescript
// JWT Guard — verifies token is valid
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Roles Guard — checks user has required role
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}

// Usage
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
async remove(@Param('id') id: string) { ... }
```
