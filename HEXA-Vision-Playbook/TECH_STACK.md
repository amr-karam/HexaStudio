# Technology Stack

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Stack Overview

```
┌────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE                            │
│              (CDN, WAF, DNS, SSL)                          │
├────────────────────────────────────────────────────────────┤
│                    TRAEFIK v3                              │
│              (Reverse Proxy, Load Balancer)                 │
├──────────┬──────────────────────────────────┬──────────────┤
│          │          DOCKER SWARM            │              │
│          ├──────────┬──────────┬────────────┤              │
│  Frontend│  Backend │   CMS    │   Odoo     │   Services  │
│  Next.js │  NestJS  │  Strapi  │   ERP      │   (Redis,   │
│  (Node)  │  (Node)  │  (Node)  │  (Python)  │   MinIO,    │
│          │          │          │            │   PG)       │
├──────────┴──────────┴──────────┴────────────┴──────────────┤
│                    MONITORING STACK                         │
│          Prometheus + Grafana + Loki + Promtail             │
└────────────────────────────────────────────────────────────┘
```

---

## Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15 (App Router) | React framework with SSR/SSG/ISR |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **TailwindCSS** | 4 | Utility-first styling |
| **Three.js** | Latest | 3D rendering engine |
| **React Three Fiber** | Latest | Declarative Three.js for React |
| **@react-three/drei** | Latest | R3F utilities and helpers |
| **GSAP** | Latest | Complex timeline-based animations |
| **Framer Motion** | Latest | UI transitions and layout animations |
| **Zustand** | Latest | Client-side state management |
| **TanStack Query** | Latest | Server state / data fetching |
| **Sentry** | Latest | Error tracking and performance monitoring |

### Why this stack?

| Decision | Rationale |
|----------|-----------|
| Next.js 15 App Router | Best SSR/SSG/ISR support for SEO and performance |
| TailwindCSS 4 | JIT compiler produces minimal CSS; utility-first is fast |
| R3F + drei | Declarative 3D integrates naturally with React component model |
| GSAP + Framer Motion | GSAP for complex 3D timelines; Framer for simple UI animations |
| Zustand | Lightweight, TypeScript-friendly, no boilerplate |
| TanStack Query | Caching, deduplication, and background refetch out of the box |

---

## Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | Latest | Node.js framework with decorators and DI |
| **TypeScript** | 5.x | Type-safe server-side code |
| **Passport** | Latest | Authentication strategies |
| **JWT** | Latest | Token-based auth |
| **class-validator** | Latest | DTO validation |
| **Helmet** | Latest | HTTP header security |
| **@nestjs/throttler** | Latest | Rate limiting |
| **Swagger** | Latest | API documentation |

### Why NestJS?

- Modular architecture (controllers, services, modules)
- Decorator-based validation (class-validator)
- Built-in Swagger support
- Exception filters for consistent error responses
- Guards/interceptors for cross-cutting concerns
- TypeScript-first design

---

## CMS

| Technology | Version | Purpose |
|------------|---------|---------|
| **Strapi** | 5 | Headless CMS |
| **PostgreSQL** | 16 | Primary database |
| **MinIO** | Latest | S3-compatible media storage |

### Content Types

- Portfolio Projects
- Blog Posts
- Services
- Categories
- SEO Metadata
- Media Assets

---

## Business Platform (Odoo)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Odoo** | 17 (Community) | ERP, CRM, Project Management |
| **PostgreSQL** | 16 | Odoo database |
| **MinIO** | Latest | Document storage (via Odoo S3 module) |

### Odoo Modules

- CRM
- Sales
- Project
- Documents
- Contacts
- Invoicing
- Custom HEXA modules

---

## Infrastructure

| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | Latest | Container runtime |
| **Docker Compose** | Latest | Local orchestration |
| **Traefik** | v3 | Reverse proxy, SSL termination, load balancing |
| **PostgreSQL** | 16 | Relational database |
| **Redis** | 7 | Cache, session store, job queue |
| **MinIO** | Latest | S3-compatible storage |
| **Cloudflare** | — | CDN, WAF, DNS |

---

## Monitoring & Observability

| Technology | Purpose |
|------------|---------|
| **Prometheus** | Metrics collection |
| **Grafana** | Visualization and dashboards |
| **Loki** | Log aggregation |
| **Promtail** | Log shipping |
| **Sentry** | Error tracking |
| **Uptime Kuma** | Uptime monitoring |

---

## CI/CD

| Technology | Purpose |
|------------|---------|
| **GitHub Actions** | Pipeline automation |
| **GitHub Container Registry** | Docker image storage |
| **SSH Deploy** | Deployment mechanism |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Playwright** | E2E testing |
| **Vitest** | Unit/integration testing |
| **Husky** | Git hooks |
| **lint-staged** | Pre-commit linting |

---

## Version Strategy

| Category | Policy |
|----------|--------|
| Node.js | 20 LTS |
| npm | 10+ |
| Docker images | Alpine variants where available |
| Dependencies | Monthly review. Renovate bot for automated PRs. |
| Lock file | `package-lock.json` committed |
