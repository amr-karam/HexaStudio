# 🏛️ HEXA Studio — Project Overview & Guidelines

## 🌟 Vision
HEXA Studio is a world-class **3D Architecture Visualization platform** that bridges the gap between technical architectural data and high-end visual storytelling. It delivers immersive, interactive 3D experiences with premium aesthetics, backed by enterprise-grade software architecture.

---

## 🛠️ Technical Ecosystem

### Core Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Monorepo** | npm workspaces + Turbo |
| **Frontend** | Next.js 15+ (App Router), Three.js, React Three Fiber, GSAP, TailwindCSS 4 |
| **Mobile** | Expo + React Native |
| **Backend** | NestJS (BFF / API Gateway), Strapi 5 (Headless CMS) |
| **Databases** | PostgreSQL 16, Redis 7, Qdrant (Vector DB) |
| **Infrastructure** | Docker Compose, Traefik v3, MinIO (S3), Cloudflare |
| **Observability** | Sentry, Prometheus, Grafana, Loki |

### Monorepo Structure
- `apps/frontend`: Next.js client application (The Experience).
- `apps/backend`: NestJS BFF & API gateway.
- `apps/cms`: Strapi 5 headless CMS.
- `apps/mobile`: React Native / Expo mobile app.
- `packages/types`: Shared TypeScript & Odoo types.
- `packages/ui`: Shared UI component library.
- `packages/utils`: Shared utilities.
- `hexa-hub`: Internal communication hub.
- `odoo`: Odoo 17 custom addon.
- `HEXA-Vision-Playbook/`: Full governance and standards documentation.

---

## 🤖 AI Agent Operating Manual

### 1. Mandatory Protocols
- **Read First:** Start with this file and the root `AGENTS.md`.
- **Think Twice:** For non-trivial changes, propose a plan and wait for approval.
- **Gold Standard:** Adhere to `HEXA-Vision-Playbook/06-STANDARDS/CODING_STANDARDS.md`.
- **Creative Excellence:** When working on the frontend, aim for a 9.5/10 luxury and performance score.

### 2. Key Commands
| Command | Purpose |
| :--- | :--- |
| `bash .setup.sh` | Full environment preparation. |
| `npm run lint` | Run linting across the monorepo. |
| `npm run typecheck` | Run type checking across the monorepo. |
| `npm run test` | Run unit/integration tests. |
| `npm run test:e2e` | Run Playwright E2E tests (frontend). |

### 3. Developer Guidelines
- **Node Version:** Use **Node 20**.
- **Dependencies:** Use `npm install --legacy-peer-deps`.
- **Type Safety:** Zero `any` types. Use explicit interfaces from `packages/types`.
- **Atomic Changes:** One logical change per commit (when applicable).
- **Environment:** Use `SKIP_ENV_VALIDATION=true` for frontend builds/typechecks if env vars are missing.

---

*For detailed governance, refer to the [HEXA-Vision-Playbook](HEXA-Vision-Playbook/00-GOVERNANCE/PROJECT_CONSTITUTION.md).*
