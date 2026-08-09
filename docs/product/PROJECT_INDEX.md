# HEXA Studio — PROJECT INDEX

> **Version:** 1.1 | **Last Updated:** 2026-07-27 | **Domain:** [hexastudio.net](https://hexastudio.net)

> **Governance:** Project relationships and catalogs are controlled by `docs/product/ENTERPRISE_ARCHITECTURE_GOVERNANCE.md`. Significant changes require synchronized catalog, risk, health, ADR, and deployment evidence updates.

---

## Table of Contents

1. [Folder Tree](#folder-tree)
2. [Technology Stack](#technology-stack)
3. [Services (Docker)](#services-docker)
4. [Routes (Frontend)](#routes-frontend)
5. [Backend Modules](#backend-modules)
6. [API Endpoints](#api-endpoints)
7. [Odoo Models](#odoo-models)
8. [Environment Variables](#environment-variables)
9. [CI/CD Pipelines](#cicd-pipelines)
10. [Third-Party Services](#third-party-services)
11. [AI Services](#ai-services)
12. [Monitoring Stack](#monitoring-stack)
13. [Dependencies & Data Flow](#dependencies--data-flow)
14. [Quality Gates](#quality-gates)
15. [Architecture Decisions](#architecture-decisions)

---

## Folder Tree

```
hexastudio.net/                          # Monorepo root
├── apps/
│   ├── frontend/                        # Next.js 16 client application
│   │   └── src/app/                     # App Router pages
│   ├── backend/                         # NestJS BFF & API gateway
│   │   └── src/modules/                 # Domain modules (29)
│   ├── cms/                             # Strapi 5 headless CMS
│   │   ├── config/
│   │   ├── database/
│   │   └── src/
│   └── mobile/                          # React Native / Expo mobile app
│       └── src/
├── packages/
│   ├── types/                           # Shared TypeScript types & Odoo types
│   ├── ui/                              # Shared UI component library
│   └── utils/                           # Shared utilities (formatDate, slugify, etc.)
├── docker/
│   ├── backup/                          # PostgreSQL backup scripts
│   ├── grafana/                         # Grafana provisioning config
│   ├── loki/                            # Loki log config
│   ├── minio/                           # MinIO init bucket scripts
│   ├── nginx/                           # Dev reverse proxy config
│   ├── odoo/                            # Odoo entrypoint & config
│   ├── postgres/                        # Init SQL scripts
│   ├── prometheus/                      # Prometheus scrape config
│   ├── tempo/                           # Tempo tracing config
│   └── traefik/                         # Traefik v2.11 config (production)
├── docs/
│   └── ADR/                             # Architecture Decision Records (6)
├── e2e/                                 # Playwright E2E tests
├── hexa-hub/                            # Internal communication hub (separate monorepo)
├── odoo/
│   └── custom/hexa_studio/             # Odoo 17 custom addon
├── scripts/                             # DevOps & CI/CD helper scripts
├── docs/                # Full governance playbook (17 categories)
├── .gitlab-ci.yml                       # GitLab CI/CD pipeline
├── .env.example                         # Environment variable template
├── .env.gitlab.example                  # GitLab CE env template
├── docker-compose.yml                   # Development compose
├── docker-compose.prod.yml              # Production compose (19 services)
├── lighthouserc.json                    # Lighthouse CI thresholds
├── package.json                         # Monorepo root (npm workspaces + Turbo)
├── turbo.json                           # Turbo task orchestration
├── vercel.json                          # Vercel deployment config (frontend)
├── tsconfig.json                        # Root TypeScript config
└── AGENTS.md                            # AI agent operating manual
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Monorepo** | npm workspaces + Turbo | 2.10.4 |
| **Frontend** | Next.js (App Router) | 16.2.11 |
| **UI Framework** | React | 19.x |
| **Styling** | Tailwind CSS | 4.x |
| **3D Engine** | Three.js + React Three Fiber | 0.171 / 9.x |
| **3D Post-processing** | @react-three/postprocessing | 3.x |
| **3D XR** | @react-three/xr | 6.x |
| **Animation** | GSAP + Framer Motion | 3.12.5 / 11.18.2 |
| **Scroll** | Lenis | 1.3.25 |
| **Backend** | NestJS | 11.1 |
| **API Docs** | Swagger (@nestjs/swagger) | 11.x |
| **Auth** | Passport + JWT | - |
| **Validation** | class-validator + Zod | - |
| **ORM** | Prisma (via NestJS) | - |
| **CMS** | Strapi | 5.6.x |
| **CMS Plugins** | CKEditor, SEO, MeiliSearch, Config Sync, Navigation, Preview, Publisher, Redis | - |
| **Mobile** | Expo + React Native | 53 / 0.77 |
| **State (Client)** | Zustand | 5.x |
| **State (Server)** | TanStack Query | 5.x |
| **Notifications** | Sonner | 2.x |
| **i18n** | next-intl | 4.x |
| **Database** | PostgreSQL | 16 Alpine |
| **Cache** | Redis | 7 Alpine |
| **Object Storage** | MinIO | latest (S3-compatible) |
| **Vector DB** | Qdrant | latest |
| **Search** | MeiliSearch | v1.12 (dev) |
| **Reverse Proxy** | Traefik (prod) / Nginx (dev) | v2.11 / Alpine |
| **CDN / Edge** | Cloudflare CDN + WAF | - |
| **ERP** | Odoo | 17.0 (prod) / 18 (dev) |
| **AI** | Google Gemini API + OpenAI | @google/genai 2.x / openai 6.x |
| **AI Client** | Google Gen AI SDK | 2.3.0 |
| **Observability** | Sentry | 10.x |
| **Monitoring** | Prometheus + Grafana + Loki + Promtail + Node Exporter | 2.54.1 / 11.3 / 3.2.1 |
| **Tracing** | OpenTelemetry + Tempo | - |
| **CI/CD** | GitLab CI | - |

---

## Services (Docker)

### Production (`docker-compose.prod.yml`) — 19 services

| # | Service | Image | Port(s) | Network | Purpose |
|---|---------|-------|---------|---------|---------|
| 1 | **traefik** | traefik:v2.11 | 80, 443 | web | Reverse proxy, SSL termination, dashboard |
| 2 | **cloudflared** | cloudflare/cloudflared:latest | - | web, internal | Cloudflare Tunnel (no public IP) |
| 3 | **postgres** | postgres:16-alpine | - | internal | Primary relational database |
| 4 | **redis** | redis:7-alpine | - | internal | Caching, session store, rate limiting |
| 5 | **minio** | minio/minio:latest | 9000, 9001 | web, internal | S3-compatible object storage (3D models, uploads) |
| 6 | **minio-init** | minio/mc:latest | - | internal | One-time bucket initialization |
| 7 | **qdrant** | qdrant/qdrant:latest | 6333, 6334 | internal | Vector similarity search (AI embeddings) |
| 8 | **backend** | custom (Dockerfile) | 4000 | web, internal | NestJS BFF / API gateway |
| 9 | **frontend** | custom (Dockerfile) | 3000 | web | Next.js server-side rendering |
| 10 | **cms** | custom (Dockerfile) | 1337 | web, internal | Strapi 5 headless CMS |
| 11 | **odoo** | odoo:17.0 | 8069 | web, internal | Odoo ERP (CRM, Projects, Accounting) |
| 12 | **prometheus** | prom/prometheus:v2.54.1 | 9090 | web, internal | Metrics collection & alerting |
| 13 | **grafana** | grafana/grafana:11.3.0 | 3000 | web, internal | Metrics dashboards & visualization |
| 14 | **loki** | grafana/loki:3.2.1 | 3100 | internal | Log aggregation |
| 15 | **promtail** | grafana/promtail:3.2.1 | - | internal | Log shipping from Docker |
| 16 | **node-exporter** | prom/node-exporter:v1.8.2 | 9100 | internal | Host-level metrics |
| 17 | **watchtower** | containrrr/watchtower:latest | - | - | Automatic container image updates |
| 18 | **backup** | postgres:16-alpine | - | web, internal | Automated PostgreSQL dumps to MinIO |
| 19 | **backup-verify** | postgres:16-alpine (profile: verify) | - | internal | Manual backup integrity verification |

### Development (`docker-compose.yml`) — additional services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| odoo_db | postgres:16-alpine | - | Odoo-specific PostgreSQL instance |
| odoo | odoo:18 | 8069 | Odoo 18 with dev mode |
| meilisearch | getmeili/meilisearch:v1.12 | 7700 | Full-text search engine |
| nginx | nginx:alpine | 8080 | Dev reverse proxy |

### Docker Volumes

| Volume | Persists |
|--------|----------|
| postgres_data | Database files |
| redis_data | Redis AOF / RDB |
| minio_data | Object storage (3D models, uploads) |
| cms_uploads | Strapi uploaded media |
| traefik_certs | Let's Encrypt SSL certificates |
| prometheus_data | Time-series metrics |
| grafana_data | Dashboard configs & plugins |
| loki_data | Compressed log chunks |
| tempo_data | Trace data |
| odoo_data | Odoo filestore |
| qdrant_data | Vector embeddings |
| backup_data | Database dumps |

---

## Routes (Frontend)

### Public Routes

| Route | Page Component | Render Strategy | Cache | Auth |
|-------|---------------|-----------------|-------|------|
| `/` | Home | ISR (3600s) | ISR + on-demand revalidation | No |
| `/about` | About | Static | Full CDN | No |
| `/projects` | Projects | Static / ISR | Full CDN | No |
| `/projects/[slug]` | Project Detail | Dynamic / ISR | CDN + on-demand reval | No |
| `/services` | Services | Static | Full CDN | No |
| `/blog` | Blog | Static / ISR | Full CDN | No |
| `/blog/[slug]` | Article Detail | Dynamic / ISR | CDN + on-demand reval | No |
| `/contact` | Contact | Static | Full CDN | No |
| `/ai` | AI Page | Static | Full CDN | No |
| `/studio` | 3D Studio | Static | Full CDN | No |
| `/xr-viewer` | XR Viewer | Client | Minimal | No |
| `/privacy` | Privacy Policy | Static | Full CDN | No |
| `/terms` | Terms of Service | Static | Full CDN | No |

### Client Portal Routes (Authenticated)

| Route | Page Component | Purpose |
|-------|---------------|---------|
| `/portal` | Dashboard | Client portal home |
| `/portal/login` | Login | Authentication page |
| `/portal/analytics` | Analytics | Project engagement metrics |
| `/portal/approvals` | Approvals | Milestone review & approval |
| `/portal/documents` | Documents | File sharing & management |
| `/portal/finance` | Finance | Invoices & payments |
| `/portal/notifications` | Notifications | Activity feed |
| `/portal/profile` | Profile | User preferences |
| `/portal/projects` | Projects | Project list |
| `/portal/projects/[id]` | Project Detail | Single project view |
| `/portal/settings` | Settings | Account configuration |
| `/portal/support` | Support | Help & tickets |

### Admin Routes

| Route | Page Component | Purpose |
|-------|---------------|---------|
| `/dashboard/integrations` | Integrations | Third-party integrations |
| `/dashboard/odoo` | Odoo Sync | Odoo ERP sync status |
| `/dashboard/translations` | Translations | i18n management |
| `/admin/accounting` | Accounting | Financial admin |
| `/admin/requests` | Requests | Service request management |

### API Routes (Next.js)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/preview` | GET/POST | Draft CMS preview |
| `/api/revalidate` | POST | On-demand ISR revalidation |
| `/api/portal/copilot/query` | POST | AI copilot query endpoint |

---

## Backend Modules

### Auth & Security

| Module | Files | Purpose |
|--------|-------|---------|
| **auth** | controller, service, guards, strategies, decorators, dto | JWT authentication, Passport strategies, RBAC |

### AI & Intelligence

| Module | Files | Purpose |
|--------|-------|---------|
| **ai** | 14 files (gemini, embedding, token-usage, multimodal, structured-output, summary, auto-tag, lighting, llm.factory, ai-cache, ai-chat) | Gemini/OpenAI integration, embeddings, auto-tagging, lighting analysis, chat, summaries |
| **agents** | controller, service, tools | AI agent orchestration & tool execution |
| **assistants** | controller, service, services/ | AI assistants management |
| **vector** | controller, service, sync, recommendation | Qdrant vector search, semantic search, recommendations, embedding sync |

### Content Management

| Module | Files | Purpose |
|--------|-------|---------|
| **articles** | controller, service | Blog articles CRUD |
| **pages** | controller, service | CMS pages management |
| **services** | controller, service | Studio services CRUD |
| **testimonials** | controller, service | Client testimonials CRUD |
| **faqs** | controller, service | FAQ management |
| **achievements** | controller, service | Studio achievements/counters |
| **team-members** | controller, service | Team profiles CRUD |
| **translations** | controller, service | i18n translation keys |

### Client Portal

| Module | Files | Purpose |
|--------|-------|---------|
| **portal** | controller, service, gateway, copilot, types | Client portal API, WebSocket gateway, AI copilot |
| **realtime** | gateway, controller, service, event-bus, annotations, approval | Real-time events, project annotations, milestone approvals |
| **requests** | controller, service | Service requests from portal |

### CRM & Business

| Module | Files | Purpose |
|--------|-------|---------|
| **projects** | controller, service | Portfolio projects CRUD |
| **contact** | controller, service, dto | Contact form submissions |
| **accounting** | controller, service | Financial records, invoice data |
| **currency** | controller, service, types, exchange-rate-sync | Multi-currency support, auto-exchange rates |
| **email** | service | Email sending (notifications, alerts) |

### Odoo ERP Integration

| Module | Files | Purpose |
|--------|-------|---------|
| **odoo** | 15 files (api controller, webhook controller, sync service, document service, event listener, strapi sync, webhook retry) | Odoo XML-RPC bridge, bi-directional sync, webhook handling, document sync, Strapi project sync |

### Infrastructure

| Module | Files | Purpose |
|--------|-------|---------|
| **health** | controller | Health check endpoint (`/api/health`) |
| **metrics** | module | Prometheus metrics registration |
| **storage** | controller, module, minio service, redis module, redis service | MinIO object storage, Redis caching |
| **geoip** | controller, service, regions | Geographic IP lookup |
| **webhooks** | controller, service, dispatcher, listener, slack service | Outbound webhooks, Slack integration |
| **mobile** | controller, service | Mobile app API support |
| **users** | controller, service | User CRUD & management |

---

## API Endpoints

### Public Endpoints

| Method | Path | Auth | Rate Limit | Purpose |
|--------|------|------|------------|---------|
| GET | `/api/health` | No | No | Health check |
| GET | `/api/projects` | No | 100/min | List portfolio projects |
| GET | `/api/projects/:id` | No | 100/min | Single project detail |
| GET | `/api/services` | No | 100/min | List studio services |
| GET | `/api/articles` | No | 100/min | List blog articles |
| GET | `/api/articles/:id` | No | 100/min | Single article |
| GET | `/api/testimonials` | No | 100/min | Client testimonials |
| GET | `/api/faqs` | No | 100/min | FAQ list |
| GET | `/api/team-members` | No | 100/min | Team profiles |
| GET | `/api/achievements` | No | 100/min | Studio achievements |
| POST | `/api/contact` | No | 10/min | Contact form |
| POST | `/api/vector/search/public` | No | 30/min | Semantic search |

### Authenticated Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/login` | No | User login |
| POST | `/api/auth/register` | No | User registration |
| POST | `/api/auth/refresh` | No | Token refresh |
| GET | `/api/users/me` | JWT | Current user profile |
| PUT | `/api/users/me` | JWT | Update profile |
| GET | `/api/storage/upload-url` | JWT | Get signed upload URL |
| GET | `/api/storage/download-url` | JWT | Get signed download URL |
| GET | `/api/portal/dashboard` | JWT | Portal dashboard data |
| GET | `/api/portal/projects` | JWT | Portal project list |
| GET | `/api/portal/projects/:id` | JWT | Portal project detail |
| GET | `/api/portal/documents` | JWT | Document list |
| POST | `/api/portal/documents/upload` | JWT | Upload document |
| GET | `/api/portal/approvals` | JWT | Approval requests |
| POST | `/api/portal/approvals/:id/respond` | JWT | Approve/reject milestone |
| GET | `/api/portal/analytics` | JWT | Engagement analytics |
| GET | `/api/portal/notifications` | JWT | Notification feed |
| GET | `/api/portal/support` | JWT | Support tickets |
| POST | `/api/portal/copilot/query` | JWT | AI copilot |
| POST | `/api/requests` | JWT | Submit service request |
| GET | `/api/translations/:locale` | JWT | Get translations |

### Admin Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/admin/accounting` | Admin | Financial overview |
| GET | `/api/admin/requests` | Admin | Service requests |
| GET | `/api/admin/requests/:id` | Admin | Request detail |
| POST | `/api/webhooks` | Admin | Create webhook config |
| GET | `/api/webhooks` | Admin | List webhooks |
| PUT | `/api/webhooks/:id` | Admin | Update webhook |
| DELETE | `/api/webhooks/:id` | Admin | Delete webhook |
| GET | `/api/odoo/sync/status` | Admin | Odoo sync status |
| POST | `/api/odoo/sync/trigger` | Admin | Trigger manual sync |

### WebSocket

| Namespace | Auth | Purpose |
|-----------|------|---------|
| `/portal` | JWT | Client portal real-time updates |
| `/realtime` | JWT | Annotations, approvals, project changes |

---

## Odoo Models

### Custom Module: `hexa_studio` (v17.0.1.0.0)

**Dependencies:** base, crm, sale, project, account, contacts, base_automation

| Model | Extension Type | Fields Added | Sync Direction |
|-------|---------------|-------------|----------------|
| **crm.lead** | Inherit | `x_hexa_source`, `x_hexa_service`, `x_hexa_budget`, `x_hexa_referral_code`, `x_hexa_website_contact_id` | Website → Odoo |
| **project.project** | Inherit | `x_slug`, `x_hexa_type`, `x_hexa_status`, `x_hexa_client_portal_active`, `x_hexa_budget_amount` | Bi-directional |
| **res.partner** | Inherit | `x_hexa_client`, `x_hexa_source`, `x_hexa_website_user_id`, `x_hexa_project_ids` | Bi-directional |
| **documents.document** | Inherit | `x_hexa_minio_path`, `x_hexa_minio_bucket`, `x_hexa_project_id`, `x_hexa_file_size`, `x_hexa_mime_type` | Odoo → MinIO |
| **project.milestone** | Inherit | `x_hexa_client_viewable`, `x_hexa_description`, `x_hexa_order` | Bi-directional |
| **hexa_webhook** | New | Event type, target URL, secret, status | Internal |
| **hexa_webhook_log** | New | Request/response, status, timestamps | Internal |

**Data Files:**
- `ir_cron.xml` — Scheduled sync tasks
- `automated_actions.xml` — Server actions for webhook triggers
- `webhook_config.xml` — Pre-configured webhook targets

---

## Environment Variables

### Database & Cache

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_USER` | No | hexastudio | PostgreSQL username |
| `POSTGRES_PASSWORD` | **Yes** | - | PostgreSQL password |
| `POSTGRES_DB` | No | hexastudio | PostgreSQL database name |
| `REDIS_PASSWORD` | **Yes** | - | Redis auth password |

### Storage (MinIO)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MINIO_ROOT_USER` | No | hexastudio | MinIO access key |
| `MINIO_ROOT_PASSWORD` | **Yes** | - | MinIO secret key |

### Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | **Yes** | - | JWT signing secret |
| `JWT_EXPIRES_IN` | No | 7d | JWT token expiry |

### Strapi CMS

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STRAPI_APP_KEYS` | **Yes** | - | Strapi session keys |
| `STRAPI_API_TOKEN_SALT` | **Yes** | - | API token salt |
| `STRAPI_ADMIN_JWT_SECRET` | **Yes** | - | Admin JWT secret |
| `STRAPI_TRANSFER_TOKEN_SALT` | **Yes** | - | Transfer token salt |
| `STRAPI_JWT_SECRET` | **Yes** | - | Strapi JWT secret |
| `CMS_URL` | No | http://cms:1337 | CMS internal URL |
| `CLIENT_URL` | No | https://hexastudio.net | Client-facing URL |
| `PREVIEW_SECRET` | No | - | Draft preview secret |
| `REVALIDATE_SECRET` | No | - | ISR revalidation secret |

### Odoo ERP

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ODOO_HOST` | No | odoo | Odoo hostname |
| `ODOO_PORT` | No | 8069 | Odoo XML-RPC port |
| `ODOO_DB` | No | hexastudio_odoo | Odoo database name |
| `ODOO_USER` | No | admin | Odoo admin user |
| `ODOO_PASSWORD` | **Yes** | - | Odoo admin password |
| `ODOO_MASTER_PASSWORD` | **Yes** | - | Odoo master password |
| `ODOO_WEBHOOK_SECRET` | **Yes** | - | Odoo webhook signature secret |

### Cloudflare

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CLOUDFLARE_EMAIL` | **Yes** | - | Cloudflare account email |
| `CLOUDFLARE_API_KEY` | **Yes** | - | Cloudflare API key |
| `CLOUDFLARE_TUNNEL_TOKEN` | **Yes** | - | Cloudflare Tunnel token |

### Monitoring

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GRAFANA_ADMIN_USER` | No | admin | Grafana admin username |
| `GRAFANA_ADMIN_PASSWORD` | **Yes** | - | Grafana admin password |
| `GRAFANA_HOST` | No | grafana.hexastudio.net | Grafana public URL |
| `SENTRY_DSN` | No | - | Backend Sentry DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | No | - | Frontend Sentry DSN |

### Frontend (Build-time)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | http://localhost:4000 | Backend API URL |
| `NEXT_PUBLIC_CMS_URL` | No | http://localhost:1337 | CMS URL |
| `NEXT_PUBLIC_SITE_URL` | No | http://localhost:3000 | Site canonical URL |

### Backend Runtime

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | production | Environment mode |
| `BACKEND_PORT` | No | 4000 | Backend listen port |
| `CORS_ORIGINS` | No | http://localhost:3000 | Allowed CORS origins |
| `RATE_LIMIT_TTL` | No | 60 | Rate limit window (seconds) |
| `RATE_LIMIT_MAX` | No | 100 | Max requests per window |
| `VECTOR_HOST` | No | qdrant | Qdrant hostname |
| `VECTOR_PORT` | No | 6333 | Qdrant gRPC port |
| `SOT` | No | blue | Blue/green deployment tag |

### Legacy / DevOps

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HOSTINGER_API_KEY` | No | - | Hostinger DNS API key |
| `DNS_DOMAIN` | No | hexastudio.net | DNS domain |
| `SERVER_IP` | No | 19.16.1.100 | Server IP address |
| `TRAEFIK_DASHBOARD_HOST` | No | traefik.hexastudio.net | Traefik dashboard hostname |
| `STRAPI_PORT` | No | 1337 | CMS listen port |

---

## CI/CD Pipelines

### GitLab CI (`.gitlab-ci.yml`) — 5 stages, 14 jobs

| Stage | Job | Runner | Description |
|-------|-----|--------|-------------|
| **quality** | `typecheck` | Node 20 | TypeScript strict check (packages/types, ui, utils, frontend, backend) |
| | `cms-typecheck` | Node 20 | Strapi TypeScript check |
| | `lint` | Node 20 | ESLint (backend + frontend, zero warnings) |
| | `security-scan` | Node 20 | `npm audit` (high+) + optional Snyk SAST/SCA |
| | `sbom` | Node 20 | CycloneDX SBOM generation (main/develop only) |
| | `test` | Node 20 | Vitest unit tests (backend + frontend) |
| **build** | `build` | Node 20 | Turbo build (types, utils, frontend, backend) |
| **image** | `build-image-backend` | Docker 24 | Docker buildx + push to GitLab Registry |
| | `build-image-frontend` | Docker 24 | Docker buildx with NEXT_PUBLIC_* args |
| | `build-image-cms` | Docker 24 | Docker buildx + push |
| **validate** | `e2e` | Playwright 1.49 | Playwright E2E tests (chromium) |
| | `visual-regression` | Playwright 1.49 | Visual snapshot comparison |
| | `lighthouse` | Node 20 | Lighthouse CI (6 URLs, 3 runs each) |
| | `bundle-analysis` | Node 20 | Bundle size budgets (200KB first-load JS) |
| | `container-scan` | Trivy | Container image vulnerability scan (CRITICAL gate) |
| **deploy** | `deploy-production` | Alpine | SSH deploy to production (manual, main branch) |
| | `deploy-staging` | Alpine | Auto-deploy to staging (develop branch) |

### Former GitHub Actions (superseded by GitLab CI)

The `.github/workflows/` directory is empty — all pipelines migrated to GitLab.

### Lighthouse CI Thresholds (`lighthouserc.json`)

| Metric | Threshold |
|--------|-----------|
| Performance | >= 95 |
| Accessibility | >= 100 |
| Best Practices | >= 95 |
| SEO | >= 100 |
| First Contentful Paint | <= 1800ms |
| Largest Contentful Paint | <= 2500ms |
| Cumulative Layout Shift | <= 0.1 |
| Total Blocking Time | <= 300ms |
| Speed Index | <= 3000ms |
| Time to Interactive | <= 3500ms |

### Bundle Budgets

| Metric | Budget |
|--------|--------|
| First-load JS per route | 200KB max |
| Total initial bundle | 500KB max |
| Largest single chunk | 500KB max |

---

## Third-Party Services

| Service | Purpose | Integration | Status |
|---------|---------|-------------|--------|
| **Cloudflare** | CDN, WAF, DNS, DDoS protection | Traefik + cloudflared tunnel | Active |
| **Sentry** | Error tracking, performance monitoring | @sentry/nextjs + @sentry/node | Active |
| **Google Gemini API** | AI text generation, embeddings, multimodal | @google/genai SDK | Active |
| **OpenAI** | Text embeddings (text-embedding-3-small) | openai SDK | Active |
| **MeiliSearch** | Full-text search (dev) | strapi-plugin-meilisearch | Dev only |
| **Hostinger** | DNS management | scripts/update-dns.sh | Active |
| **Google Fonts** | Web font delivery (self-hosted in prod) | next/font | Active |
| **GitLab** | Source control, CI/CD, container registry | gitlab-ci.yml | Primary |
| **GitHub** | Source control (mirrored) | - | Secondary |
| **CycloneDX** | SBOM generation | @cyclonedx/cyclonedx-npm | CI |
| **Snyk** | SCA + SAST security scanning | Optional (via SNYK_TOKEN) | CI |
| **Trivy** | Container image vulnerability scanning | aquasec/trivy | CI |
| **Nodemailer** | Email delivery | @strapi/provider-email-nodemailer | CMS |
| **Slack** | Notifications & alerts | webhooks/slack.service.ts | Active |

---

## AI Services

| Service | Provider | SDK/Library | Models Used | Purpose |
|---------|----------|-------------|-------------|---------|
| **Gemini API** | Google | @google/genai 2.x | Gemini 2.5 Pro, Gemini 2.5 Flash | Text generation, summarization, structured output, multimodal analysis |
| **OpenAI** | OpenAI | openai 6.x | text-embedding-3-small (1536-dim) | Semantic search embeddings |
| **AI Chat** | Google | @google/genai | Gemini models | Portal copilot, AI assistant conversations |
| **Auto-Tagging** | Google | AI module | Gemini 2.5 Flash | Automatic tag generation for projects |
| **Lighting Analysis** | Google | AI module | Gemini multimodal | AI-driven 3D scene lighting suggestions |
| **Embeddings** | OpenAI | openai | text-embedding-3-small | Vector embeddings → Qdrant |

### AI Pipeline Architecture

```
User Query → NestJS AI Module → LLM Factory (Gemini/OpenAI router)
                                    ├── Gemini: chat, summarization, multimodal, structured output
                                    ├── OpenAI: embeddings only
                                    └── AI Cache: Redis-backed response caching
                                        ↓
                                    Qdrant (Vector DB) ← Embeddings
                                        ↓
                                    Recommendation Service → Frontend
```

---

## Monitoring Stack

| Component | Image | Port | Data Source | Purpose |
|-----------|-------|------|-------------|---------|
| **Prometheus** | prom/prometheus:v2.54.1 | 9090 | Node Exporter, NestJS metrics | Metrics collection & alerting |
| **Grafana** | grafana/grafana:11.3.0 | 3000 | Prometheus, Loki | Dashboards & visualization |
| **Loki** | grafana/loki:3.2.1 | 3100 | Promtail | Log aggregation |
| **Promtail** | grafana/promtail:3.2.1 | - | Docker logs | Log shipping |
| **Node Exporter** | prom/node-exporter:v1.8.2 | 9100 | Host OS | Host metrics (CPU, RAM, disk, network) |
| **Tempo** | grafana/tempo (config present) | - | OpenTelemetry | Distributed tracing |
| **Sentry** | SaaS | - | @sentry/nextjs, @sentry/node | Error tracking & performance |
| **Watchtower** | containrrr/watchtower | - | Docker | Automatic container updates |

### OpenTelemetry Instrumentation

| Library | Purpose |
|---------|---------|
| @opentelemetry/instrumentation-http | HTTP request tracing |
| @opentelemetry/instrumentation-express | Express route tracing |
| @opentelemetry/instrumentation-nestjs-core | NestJS controller/provider tracing |
| @opentelemetry/exporter-trace-otlp-http | OTLP export to Tempo |

---

## Dependencies & Data Flow

### Architecture Pattern: BFF (Backend-for-Frontend)

```
                    ┌──────────────────────────────────────────┐
                    │          Cloudflare CDN / WAF            │
                    └────────────────┬─────────────────────────┘
                                     │
                    ┌────────────────▼─────────────────────────┐
                    │         Traefik (Reverse Proxy)           │
                    └────────────────┬─────────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
    ┌─────────▼─────────┐  ┌────────▼─────────┐  ┌────────▼─────────┐
    │   Frontend         │  │   Backend         │  │   CMS            │
    │   (Next.js 16)     │──│   (NestJS 11)     │──│   (Strapi 5)     │
    │   Port 3000        │  │   Port 4000        │  │   Port 1337      │
    └────────────────────┘  └────────┬─────────┘  └────────────────────┘
                                     │
                    ┌────────────────┼────────────────────┐
                    │                │                     │
         ┌──────────▼──────┐  ┌─────▼──────┐  ┌──────────▼──────────┐
         │   PostgreSQL    │  │   Redis     │  │   MinIO            │
         │   (Main DB)     │  │   (Cache)   │  │   (Object Storage) │
         └─────────────────┘  └────────────┘  └─────────────────────┘
                    │
         ┌──────────┼──────────┐
         │                    │
  ┌──────▼──────┐   ┌────────▼────────┐
  │   Qdrant    │   │   Odoo ERP      │
  │  (Vector)   │   │   (17.0)        │
  └─────────────┘   └─────────────────┘
```

### Data Flow Rules

1. **Frontend** never calls Strapi directly — all CMS data flows through NestJS BFF
2. **NestJS** aggregates, filters, and transforms data into optimized View Models
3. **Shared types** in `/packages/types` enforce end-to-end type safety
4. **Odoo sync** is bi-directional: projects, contacts, and documents sync via XML-RPC
5. **Vector embeddings** are generated by OpenAI, stored in Qdrant, queried via NestJS
6. **ISR** revalidation is triggered on-demand via `/api/revalidate` after CMS updates

### Dependency Graph

```
frontend → backend → [postgres, redis, cms, odoo, qdrant]
cms      → postgres (separate database: hexastudio_cms)
odoo     → postgres (separate database: hexastudio_odoo)
backend  → minio (signed URLs)
watchtower → updates backend, frontend, cms, odoo images
backup   → postgres → minio (dump storage)
prometheus ← node-exporter, backend (/metrics)
grafana  → prometheus, loki
loki     ← promtail ← docker logs
tempo    ← backend (OpenTelemetry traces)
```

---

## Quality Gates

### Code Quality

| Gate | Tool | Standard |
|------|------|----------|
| TypeScript | `tsc --noEmit` | Strict mode, zero errors |
| Lint | ESLint | Zero warnings (`--max-warnings=0`) |
| Unit Tests | Vitest | 144+ tests (80 backend + 64 frontend) |
| E2E Tests | Playwright | Chromium-only, all critical paths |
| Visual Regression | Playwright | Snapshot comparison |
| Bundle Analysis | @next/bundle-analyzer | 200KB first-load JS budget |

### Performance Gates

| Metric | Target | Tool |
|--------|--------|------|
| Lighthouse Performance | >= 95 | Lighthouse CI |
| Lighthouse Accessibility | >= 100 | Lighthouse CI |
| Lighthouse Best Practices | >= 95 | Lighthouse CI |
| Lighthouse SEO | >= 100 | Lighthouse CI |
| LCP | < 1.2s | Lighthouse CI |
| CLS | < 0.1 | Lighthouse CI |
| TBT | < 300ms | Lighthouse CI |
| 3D Scene FPS | Stable 60 FPS | Chrome DevTools |
| 3D Model Size | < 5MB (compressed) | Manual |

### Security Gates

| Gate | Tool | Trigger |
|------|------|---------|
| Dependency Audit | npm audit | CI (allow_failure) |
| SAST | Snyk Code | CI (optional) |
| SCA | Snyk | CI (optional) |
| Container Scan | Trivy | CI (CRITICAL = fail) |
| SBOM | CycloneDX | CI (main/develop) |

---

## Architecture Decisions

| ADR | Title | Decision |
|-----|-------|----------|
| 001 | Next.js App Router | Chose App Router over Pages Router for nested layouts, streaming, RSC |
| 002 | React Three Fiber | R3F over raw Three.js for declarative 3D, React integration |
| 003 | Docker Compose | Single-host deployment with Docker Compose over Kubernetes for simplicity |
| 004 | Monorepo Structure | npm workspaces + Turbo for shared types, UI, utils across apps |
| 005 | Tailwind CSS | Utility-first CSS for rapid iteration, consistent design tokens |
| 006 | State Management | Zustand (client) + TanStack Query (server) — lightweight, performant |

*Full ADR documents at `docs/ADR/`*

---

## Related Documentation

All detailed documentation lives in `docs/`:

| Category | Path | Contents |
|----------|------|----------|
| Governance | `00-GOVERNANCE/` | Constitution, Overview, Vision, Glossary, Folder Structure |
| Architecture | `architecture/` | System Design, High/Low Level Design, Domain Model, ADRs |
| Roadmap | `02-ROADMAP/` | Milestones, Sprints, Backlog, Project Status, Changelog |
| Business | `03-BUSINESS/` | Workflows, Client Journey, Sales Funnel, KPIs |
| AI Agents | `agents/` | Agent guides, Chief Architect, DevOps, QA, Security |
| Standards | `engineering/` | Coding, TypeScript, React, Three.js, GSAP, Security, SEO |
| Design | `07-DESIGN/` | Design System, Colors, Typography, Motion, Brand Guidelines |
| API | `api/` | API Documentation, Auth, Endpoints, Webhooks |
| Odoo | `odoo/` | Odoo Architecture, CRM, Sales, Projects, Automations |
| AI | `10-AI/` | AI Architecture, Vector Search, Prompt Library, Assistants |
| Analytics | `11-ANALYTICS/` | Dashboards, BI, Reports, Forecasting, Events |
| Client Portal | `12-CLIENT-PORTAL/` | Portal docs, File management, Timeline, Invoices |
| DevOps | `devops/` | Docker, Deployment, Monitoring, Backup, Disaster Recovery |
| Quality | `15-QUALITY/` | Quality Gates, Testing (Unit, Integration, E2E, Lighthouse) |

---

*Generated from live codebase — 2026-07-26. Update this file when adding new apps, modules, routes, or services.*
