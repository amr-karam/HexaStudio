# ⚙️ GITHUB ACTIONS CI/CD PIPELINE SPECIFICATIONS

**Version:** 1.0.0 | **Scope:** Continuous Integration & Delivery | **Standard:** Automated Quality Gates

---

## 1. OVERVIEW & PIPELINE OBJECTIVES

HEXA Vision enforces continuous integration via GitHub Actions (`.github/workflows/ci.yml`). Every Pull Request and commit to `main`, `develop`, or `release/*` must pass automated quality gates before code can be merged or deployed.

---

## 2. WORKFLOW STAGES (`.github/workflows/ci.yml`)

The CI workflow is structured into 4 sequential jobs:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      GITHUB ACTIONS CI PIPELINE                         │
│                                                                         │
│  ┌───────────────────────┐                                              │
│  │     1. LINT & TYPE    │                                              │
│  │   (Next / Nest / CMS) │                                              │
│  └───────────┬───────────┘                                              │
│              │                                                          │
│  ┌───────────▼───────────┐                                              │
│  │     2. UNIT TESTS     │                                              │
│  │  (Vitest 176+ Specs)  │                                              │
│  └───────────┬───────────┘                                              │
│              │                                                          │
│  ┌───────────▼───────────┐                                              │
│  │     3. BUILD CHECK    │                                              │
│  │  (Next Standalone &   │                                              │
│  │   Nest Dist Bundles)  │                                              │
│  └───────────┬───────────┘                                              │
│              │                                                          │
│  ┌───────────▼───────────┐                                              │
│  │   4. LIGHTHOUSE CI    │                                              │
│  │  (Scores > 95 Target) │                                              │
│  └───────────────────────┘                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. JOB SPECIFICATIONS & ENVIRONMENT

### Job 1: `quality` (Lint & Typecheck)
- **Node Version**: 20.x (Node 20 LTS baseline)
- **Install Command**: `npm install --legacy-peer-deps`
- **Commands Executed**:
  1. `npm run lint` — ESLint strict rules across monorepo.
  2. `SKIP_ENV_VALIDATION=true npm run typecheck` — TypeScript compiler checks across all workspaces (`apps/frontend`, `apps/backend`, `apps/cms`, `packages/*`).

### Job 2: `test` (Unit & Integration Testing)
- **Commands Executed**:
  1. `npm run test` — Vitest unit tests (176 frontend + 239 backend test specs).
  2. Test coverage reports uploaded to GitHub Artifacts.

### Job 3: `build` (Production Bundle Audit)
- **Environment**: Sets `NODE_ENV=production` and `NEXT_PUBLIC_*` placeholder variables.
- **Command**: `npm run build` — Verifies Next.js Turbopack output, NestJS Nest CLI compilation, and Strapi admin bundle generation.

### Job 4: `lighthouse` (Performance Budget Audit)
- **Config**: `lighthouserc.json`.
- **Criteria**: Enforces Performance $\ge 90$, Accessibility $\ge 95$, Best Practices $\ge 95$, SEO $\ge 95$.

---

## 4. SECRETS & ENVIRONMENT VARIABLES

GitHub Repository Secrets required for pipeline execution and deployment:
- `CLOUDFLARE_ZONE_ID` — Used for automated edge cache purge on deploy.
- `CLOUDFLARE_API_TOKEN` — Purge cache authorization token.
- `PREVIEW_SECRET` — Shared secret for draft preview mode verification.
- `SSH_HOST` & `SSH_PRIVATE_KEY` — Production SSH deployment access.

---

## 5. LOCAL PIPELINE EMULATION

Developers can run the full CI sequence locally before pushing:
```bash
# Run complete Quality Gate sequence locally
npm run lint && npm run typecheck && npm run test && npm run build
```

---

## 6. RELATED DOCUMENTATION

- [QUALITY_GATES.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/15-QUALITY/QUALITY_GATES.md) — 5 Quality Gates specification.
- [GITLAB_MIGRATION.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/13-DEVOPS/GITLAB_MIGRATION.md) — Self-hosted GitLab CI fallback.
- [LIGHTHOUSE_AUDIT_2026-07-24.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/15-QUALITY/LIGHTHOUSE_AUDIT_2026-07-24.md) — Latest audit metrics.
