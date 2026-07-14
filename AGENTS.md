# 🚨 MANDATORY — READ FIRST — DO NOT SKIP

**AGENTS.md** is the **binding legal operating manual** for every AI agent interacting with the HEXA Vision codebase.

**You MUST read this entire file — from beginning to end — before performing ANY action.**

By proceeding past this point, you acknowledge and agree to comply with all rules, policies, and standards defined in this document. Any violation is a breach of protocol.

Failure to read this file before writing, modifying, or reviewing code is a **critical protocol violation**.

---

# HEXA Studio — AI Agent Instructions

## Mandatory Startup Procedure

Before performing ANY task, read these documents in order:

1. `HEXA-Vision-Playbook/00-GOVERNANCE/PROJECT_CONSTITUTION.md`
2. `HEXA-Vision-Playbook/00-GOVERNANCE/PROJECT_OVERVIEW.md`
3. `HEXA-Vision-Playbook/01-ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
4. `HEXA-Vision-Playbook/02-ROADMAP/PROJECT_ROADMAP.md`
5. `HEXA-Vision-Playbook/02-ROADMAP/CURRENT_SPRINT.md`
6. `HEXA-Vision-Playbook/02-ROADMAP/OPEN_TASKS.md`
7. `HEXA-Vision-Playbook/06-STANDARDS/CODING_STANDARDS.md`
8. `HEXA-Vision-Playbook/06-STANDARDS/SECURITY_STANDARDS.md`
9. `HEXA-Vision-Playbook/04-AGENTS/AI_AGENT_GUIDE.md`

After reading them:
- Summarize your understanding of the project.
- Identify the current project phase and sprint.
- List any risks or blockers you identified.
- Wait for the user's assignment.

## Rules

- **Never start coding before understanding the project.**
- **Never change architecture without documenting the decision.**
- **Never delete code without approval.**
- **Always update documentation when making changes.**
- **Always follow Coding Standards and Quality Gates.**
- **Prefer long-term maintainability over short-term speed.**
- **If documentation conflicts, stop and ask for clarification.**

## Technical Implementation Guide (Agent Quickstart)

### Monorepo Structure
- **Apps**: `apps/frontend` (Next.js 15, source in `src/`), `apps/backend` (NestJS), `apps/cms` (Strapi 5).
- **Packages**: `packages/types`, `packages/ui`, `packages/utils` (shared source, consumed via workspaces).
- **Orchestration**: Turbo (`turbo.json`) handles task dependencies.

### Developer Commands & Gotchas
- **Setup**: Ignore `npm run setup` (stale README). Use `bash .setup.sh`.
- **Installation**: Use `npm install --legacy-peer-deps` to avoid dependency conflicts (verified in `ci.yml`).
- **Node Version**: Ambiguous (20 vs 22). Use **Node 20** for best alignment with authoritative CI (`ci.yml`).
- **Frontend Build/Typecheck**: Must set `SKIP_ENV_VALIDATION=true` and provide `NEXT_PUBLIC_*` env vars, otherwise they will fail.
- **Quality Gate Sequence**: `npm run lint` $\rightarrow$ `npm run typecheck` $\rightarrow$ `npm run test`.
- **Single-Package Tasks**: Use `--workspace` (e.g., `npm run test --workspace=apps/backend`).
- **E2E Tests**: Run via `npm run test:e2e --workspace=apps/frontend`. Config is located at `e2e/playwright.config.ts`.
- **CMS**: Strapi 5. No lint/typecheck scripts defined; skipped by global turbo tasks.

### Infrastructure & Deployment
- **Local Dev**: `docker compose up -d` (uses `docker-compose.yml` with Nginx proxy).
- **Production**: Uses Traefik + Cloudflared (defined in `docker-compose.prod.yml`).
- **Deploy Scripts**: `deploy.py` is a raw SSH helper; `cd.yml` is the primary production pipeline.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS 4 |
| 3D Engine | Three.js, React Three Fiber, @react-three/drei |
| Animation | GSAP, Framer Motion |
| Backend | NestJS, REST (Swagger), JWT |
| CMS | Strapi 5 (Headless) |
| Databases | PostgreSQL 16, Redis 7 |
| Storage | MinIO (S3 Compatible) |
| Proxy | Traefik v3 |
| Edge | Cloudflare (CDN/WAF) |
| Monitoring | Prometheus, Grafana, Loki, Promtail |
| State | Zustand (Client), TanStack Query (Server) |
| Observability | Sentry |

## GitHub Organization

```
HEXA-Studio/
├── hexa-platform      ← Single Source of Truth (monorepo)
├── hexa-website
├── hexa-api
├── hexa-odoo
├── hexa-ai
├── hexa-devops
├── hexa-mobile        (Future)
├── hexa-design-system (Optional)
└── hexa-docs          (Optional)
```

## Creative Excellence Mode

When working on the Frontend, agents must operate in **Creative Excellence Mode**. This means:
- **Role Shift:** You are no longer just an engineer; you are an elite multidisciplinary design team (Creative Director, UX Director, Motion Expert, etc.).
- **Objective:** Redesign for a premium, world-class digital experience. Every interaction must feel handcrafted and cinematic.
- **Standard:** Any UI/UX element must score at least **9.5/10** on the Luxury and Performance scale.
- **Mandate:** Challenge every design decision. If a solution is "average," redesign it.
- **Framework:** Follow the guidelines in `HEXA-Vision-Playbook/07-DESIGN/UX_STRATEGY.md` and `HEXA-Vision-Playbook/06-STANDARDS/MOTION_SYSTEM.md`.

## Playbook Structure

All documentation lives inside `HEXA-Vision-Playbook/` and is organized by category:
- `00-GOVERNANCE/`: Constitution, Overview, and Vision.
- `01-ARCHITECTURE/`: System design and technical blueprints.
- `02-ROADMAP/`: Milestones, Sprint status, and Backlog.
- `03-BUSINESS/`: Workflows and Client journeys.
- `04-AGENTS/`: Specific AI Agent guides.
- `06-STANDARDS/`: Coding, UI/UX, and Security standards.
- `07-DESIGN/`: Design system and Motion guidelines.
- `08-API/`: API documentation and endpoints.
- `09-ODOO/`: Odoo ERP integration.
- `13-DEVOPS/`: Deployment and Infrastructure.
- `15-QUALITY/`: Testing and QA gates.
