# 🚨 MANDATORY — READ FIRST — DO NOT SKIP

**AGENTS.md** is the **binding legal operating manual** for every AI agent interacting with the HEXA STUDIO codebase.

**You MUST read this entire file — from beginning to end — before performing ANY action.**

By proceeding past this point, you acknowledge and agree to comply with all rules, policies, and standards defined in this document. Any violation is a critical protocol breach.

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

---

## 2. Non-Negotiable Agent Rules

### AI Agents MUST:
1. Always inspect affected code before modifying it.
2. Maintain strict TypeScript type-safety (0 `any` types permitted).
3. Follow the 14-level **Governance Hierarchy** defined in `GOVERNANCE.md`.
4. Ensure all single-package commands use workspace flags (e.g., `npm run test --workspace=apps/frontend`).
5. Update `PROJECT_STATUS.md` and relevant documentation upon task completion.
6. Verify quality gates before declaring any task complete.

### AI Agents MUST NOT:
- Change architecture silently without creating a formal **ADR**.
- Introduce heavy third-party dependencies without explicit performance justification.
- Delete working code or comment out failing assertions.
- Disable TypeScript checks (`@ts-ignore`) or ESLint rules (`eslint-disable`).
- Commit secrets, API keys, or private SSH keys.
- Push directly to protected production branches (`main`/`master`).
- Hide errors or claim completion without verified test execution.

---

## 3. Technology Stack & Infrastructure Rules

| Layer | Technology | Infrastructure Rule |
|-------|-----------|---------------------|
| **Frontend** | Next.js 16 (App Router), TypeScript 5.8, TailwindCSS 4 | Turbopack build, Client Island dynamic imports for WebGL |
| **3D Engine** | Three.js, React Three Fiber, @react-three/drei | Gated by `useMotionPolicy`, lazy loaded, fallback static cards |
| **Backend** | NestJS 11, REST (Swagger), Socket.io, JWT | Microservices architecture, strict CORS & rate-limiting |
| **CMS** | Strapi 5 (Headless) | PostgreSQL database, webhook triggers to Next.js revalidation |
| **ERP** | Odoo 17.0 (Community/Enterprise) | JSON-RPC API client (`OdooApiService`), CRM leads & billing sync |
| **Databases** | PostgreSQL 16, Redis 7, Qdrant | Internal network only; no public port exposure permitted |
| **Storage** | MinIO (S3 Compatible) | Presigned URLs for client deliverable downloads |
| **Proxy & Ingress** | Traefik v3 (with Cloudflared Tunnel) | Single ingress proxy; Nginx is NOT used |
| **DevOps & CI/CD** | GitLab CE (Runner + Container Registry) | Primary DevOps source of truth; protected branches |

---

## 4. Quality Gate Sequence

Before completing any task, execute the exact quality gate sequence across affected workspaces:

```bash
# Frontend Gate
npm run lint --workspace=apps/frontend
npm run typecheck --workspace=apps/frontend
npm run test --workspace=apps/frontend

# Backend Gate
npm run lint --workspace=apps/backend
npm run typecheck --workspace=apps/backend
npm run test --workspace=apps/backend

# Mobile Gate
npm run lint --workspace=apps/mobile
npm run typecheck --workspace=apps/mobile
npm run test --workspace=apps/mobile
```

All 3 gates MUST pass with **0 Errors and 0 Warnings** (`--max-warnings=0`).
