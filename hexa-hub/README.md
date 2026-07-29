# HEXA Hub — Enterprise Workspace Platform

The unified collaboration platform for HEXA Studio. Built on the ODOO-FIRST architecture with a premium dark luxury design.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Next.js 15                      │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Dashboard│ │  Client  │ │   Login Page   │  │
│  │  24 pages│ │  Portal  │ │                │  │
│  └──────────┘ └──────────┘ └────────────────┘  │
│  ┌──────────────────────────────────────────┐   │
│  │  17 UI Primitives + 23 React Query Hooks │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │ REST
┌──────────────────────┴──────────────────────────┐
│                  NestJS BFF                       │
│  ┌──────────────────────────────────────────┐   │
│  │  24 Modules (17 Odoo + 7 Hub-native)     │   │
│  │  120+ Endpoints with Swagger docs         │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │ JSON-RPC
┌──────────────────────┴──────────────────────────┐
│                  Odoo ERP                         │
│  ┌──────────────────────────────────────────┐   │
│  │  CRM · Sales · Projects · Accounting     │   │
│  │  Helpdesk · Calendar · HR · Knowledge    │   │
│  │  hexa_studio custom module               │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
         │              │              │
    PostgreSQL       Redis          MinIO
```

## Quick Start

### Prerequisites
- Node.js 20
- Docker Desktop
- Odoo instance (configured in .env)

### Setup

```bash
# 1. Clone and install
cd hexa-hub
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env
# Edit .env with your Odoo credentials

# 3. Start infrastructure
docker compose up -d

# 4. Run database migrations and seed
npm run seed --workspace=apps/api

# 5. Start development servers
npm run dev
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| API Swagger | http://localhost:3000/api/docs |
| Realtime | http://localhost:3002 |
| MinIO Console | http://localhost:9001 |

### Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hexastudio.net | admin123 |
| Employee | employee@hexastudio.net | admin123 |
| Client | client@hexastudio.net | admin123 |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS 3, Framer Motion |
| UI | 17 custom primitives (dark luxury theme, gold #D4A843) |
| Backend | NestJS, JWT, Swagger |
| Real-time | Socket.IO + Redis |
| Queue | BullMQ |
| Database | PostgreSQL 16 (TypeORM) |
| Cache | Redis 7 |
| Storage | MinIO (S3-compatible) |
| ERP | Odoo 18 (JSON-RPC) |
| CI/CD | GitHub Actions |

## Quality Gates

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run test        # Jest
npm run build       # Production build
```

## Project Structure

```
hexa-hub/
├── apps/
│   ├── api/        # NestJS backend (24 modules)
│   ├── web/        # Next.js frontend (32 pages)
│   ├── realtime/   # Socket.IO server
│   └── worker/     # BullMQ background worker
├── packages/
│   └── types/      # Shared TypeScript types
├── odoo/
│   └── custom/
│       └── hexa_studio/  # Odoo custom module
├── docker-compose.yml    # 8-service dev stack
└── .github/workflows/    # CI pipeline
```
