# 🚨 MANDATORY — READ FIRST — DO NOT SKIP

**AGENTS.md** is the **binding legal operating manual** for every AI agent interacting with the HEXA STUDIO codebase.

**You MUST read this entire file — from beginning to end — before performing ANY action.**

By proceeding past this point, you acknowledge and agree to comply with all rules, policies, and standards defined in this document. Any violation is a breach of protocol.

Failure to read this file before writing, modifying, or reviewing code is a **critical protocol violation**.

---

# HEXA STUDIO — AI Agent Operating Instructions

## 1. Mandatory Startup Procedure

Before performing ANY task, read these documents in order:

1. `GOVERNANCE.md`
2. `ARCHITECTURE.md`
3. `PRODUCT.md`
4. `DESIGN_SYSTEM.md`
5. `ENGINEERING_STANDARDS.md`
6. `SECURITY.md`
7. `PERFORMANCE.md`
8. `ACCESSIBILITY.md`
9. `PROJECT_STATUS.md`
10. Relevant `.ai/agents/` role definition file

After reading them:
- Summarize your understanding of the task and target files.
- Identify the current project phase and active sprint.
- List any architectural risks or blockers identified.
- Execute the task systematically following the **Definition of Done**.

## 2. Rules

- **Never start coding before understanding the project.**
- **Never change architecture without documenting the decision.**
- **Never delete code without approval.**
- **Always update documentation when making changes.**
- **Always follow Coding Standards and Quality Gates.**
- **Prefer long-term maintainability over short-term speed.**
- **If documentation conflicts, stop and ask for clarification.**

## 3. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.2.11, TypeScript, TailwindCSS 4 |
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

## 4. Monorepo Structure

HEXA STUDIO is a **single Turborepo monorepo** (`hexa-platform`), not a multi-repo
organization. GitLab CE (`gitlab.hexastudio.net`) is the DevOps source of truth
(GOVERNANCE.md §13). The GitHub mirror (`origin`) is read-only for disaster recovery.

```
hexa-platform/                    ← Single Source of Truth (Turborepo monorepo)
├── apps/
│   ├── frontend/                 ← Next.js 16 App Router (Client Portal & Web Showcase)
│   ├── backend/                  ← NestJS 11 BFF API Gateway & Microservices
│   ├── cms/                      ← Strapi 5 Headless CMS Engine
│   └── mobile/                   ← Expo / React Native Client Companion
├── packages/
│   ├── types/                    ← Shared TypeScript Interfaces (@hexastudio/types)
│   ├── ui/                       ← Shared Design System Components (@hexastudio/ui)
│   └── utils/                    ← Shared Helper Utilities (@hexastudio/utils)
├── docker/                       ← Traefik v3, Postgres, Redis, MinIO, Odoo configs
├── hexa-hub/                     ← OpenCode MCP Bridge (independent tool)
├── docs/                         ← Categorized documentation tree (see §6 below)
├── .ai/                          ← AI Agent Governance, Workflows, & Checklists
└── e2e/                          ← Playwright end-to-end tests
```

**Reference:** `ARCHITECTURE.md` §1 (Monorepo Topology & Packages),
`GOVERNANCE.md` §13 (GitLab CE & DevOps).

## 5. Creative Excellence Mode

When working on the Frontend, agents must operate in **Creative Excellence Mode**. This means:
- **Role Shift:** You are no longer just an engineer; you are an elite multidisciplinary design team (Creative Director, UX Director, Motion Expert, etc.).
- **Objective:** Redesign for a premium, world-class digital experience. Every interaction must feel handcrafted and cinematic.
- **Standard:** Any UI/UX element must score at least **9.5/10** on the Luxury and Performance scale.
- **Mandate:** Challenge every design decision. If a solution is "average," redesign it.
- **Framework:** Follow the guidelines in `docs/design/UX_STRATEGY.md` and `docs/engineering/MOTION_SYSTEM.md`.

## 6. Playbook Structure

All documentation lives inside `docs/`, organized by governance area (see `GOVERNANCE.md` §46 Documentation Manifest):

```
docs/
├── AGENTS.md                          ← Copy of this file
├── adr/                               ← Architecture Decision Records (001-011)
├── agents/                            ← AI agent roles, collaboration, onboarding
├── ai/                                ← AI architecture & assistants
├── analytics/                         ← BI, dashboards, metrics, reports
├── api/                               ← API docs, auth, endpoints, versioning
├── accessibility/                     ← Accessibility standards & guides
├── architecture/                      ← System/high/low-level design, service catalog
├── checklists/                        ← QA, release, deployment, security checklists
├── client-portal/                     ← Client portal features (files, invoices, timeline)
├── design/                            ← Design system, tokens, components, UX
├── devops/                            ← Docker, Traefik, monitoring, deployment, DR
├── engineering/                       ← Coding standards & engineering guides
├── git/                               ← Branching, commits, PRs, release flow
├── meeting-notes/                     ← Meeting notes
├── odoo/                              ← Odoo ERP architecture, models, integrations
├── performance/                       ← Performance standards & audits
├── product/                           ← Vision, goals, roadmap, sprints, SOPs, KPIs
├── prompts/                           ← Agent prompts
├── quality/                           ← Quality gates, testing, audits, reports
├── security/                          ← Security standards & baseline
├── seo/                               ← SEO standards & guides
├── templates/                         ← Reusable document templates
└── (root)                             ← README, CHANGELOG, audit reports
```

The canonical source of truth for the current structure is `GOVERNANCE.md` §46 and the `docs/<area>/README.md` manifests.
