# Data Flow Architecture

**Last Updated:** 2026-07-08

---

## Primary Data Flows

### Content Publishing Flow

```
Strapi CMS
  │
  ├── Webhook: content.publish
  │
  ▼
NestJS API
  │
  ├── Validate content
  ├── Transform data (add computed fields)
  ├── Cache invalidation (Redis)
  ├── Trigger Next.js ISR
  │
  ▼
Next.js
  │
  ├── Re-generate pages (ISR)
  ├── CDN cache purge (Cloudflare)
  │
  ▼
Client Browser
```

### User Authentication Flow

```
Client Browser
  │
  ├── POST /api/auth/login
  │     { email, password }
  │
  ▼
Traefik → NestJS API
  │
  ├── Validate credentials
  ├── Generate JWT (15min TTL)
  ├── Generate Refresh Token (7 day TTL)
  ├── Return tokens (HTTP-only cookie)
  │
  ▼
Client Browser stores tokens
  │
  ├── Attach JWT to subsequent requests
  ├── Auto-refresh on expiry
```

### Business Data Synchronization

```
NestJS API
  │
  ├── Website Contact Form → Odoo CRM Opportunity
  ├── Odoo Project → Website Project Page
  ├── Odoo Client → Website Portal User
  │
  ▼
Odoo ERP
  │
  ├── CRM: Opportunities → Sales Pipeline
  ├── Projects: Milestones → Timeline
  ├── Documents: Files → MinIO
```

---

## Caching Strategy

```
Cache Level 1: Browser Cache
  ├── Static assets: Cache-Control: public, max-age=31536000, immutable
  ├── API responses: Cache-Control: no-cache (stale while revalidate)

Cache Level 2: Cloudflare CDN
  ├── HTML pages: 60s TTL (or until ISR purge)
  ├── Static assets: 1 year TTL
  ├── Images: 30 day TTL (optimized by Cloudflare)
  └── API: Not cached at CDN level

Cache Level 3: Redis
  ├── API responses: 30s-300s TTL (depends on endpoint)
  ├── Session data: Session duration
  ├── User permissions: 5 minutes
  └── Content metadata: Until content update

Cache Level 4: TanStack Query (Client)
  ├── staleTime: 30s
  ├── gcTime: 5 minutes
  └── Refetch on focus: true
```

## Error Handling Flow

```
Client Request
  │
  ▼
NestJS API
  │
  ├── ValidationPipe → 400 Bad Request
  ├── AuthGuard → 401 Unauthorized
  ├── RolesGuard → 403 Forbidden
  ├── ThrottlerGuard → 429 Too Many Requests
  │
  ▼
Global ExceptionFilter
  │
  ├── Format error: { status, message, code, details, timestamp }
  ├── Log to console (structured JSON)
  ├── Send to Sentry (if server error)
  │
  ▼
Client receives structured error response
```
