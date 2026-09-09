# CI/CD Pipeline Specifications

**Version:** 2.0.0 | **Scope:** Continuous Integration & Delivery | **Standard:** Automated Quality Gates
**Last Updated:** 2026-09-04 | **Authority:** GitLab CE (self-hosted)

> **HISTORICAL NOTE:** This document was previously titled "GitHub Actions CI/CD Pipeline Specifications." HEXA Studio migrated from GitHub Actions to **GitLab CE CI/CD** (self-hosted at `19.16.1.100`, port 8929). This document now documents the GitLab CI/CD pipeline. The legacy GitHub Actions workflows have been removed (`.github/workflows/` directory deleted).

---

## 1. OVERVIEW & PIPELINE OBJECTIVES

HEXA Vision enforces continuous integration via **GitLab CI/CD** (`.gitlab-ci.yml`). Every Push to `main`/`develop` and every Merge Request must pass automated quality gates before code can be merged or deployed.

The GitLab CE self-hosted instance at `gitlab.hexastudio.net` is the **single source of truth** for CI/CD. The pipeline runs on a self-hosted Docker executor runner (`hexa-docker-runner`, id 1) with 4 parallel job slots and 8 GB memory cap per job.

---

## 2. PIPELINE STAGES (`.gitlab-ci.yml`)

The GitLab CI/CD pipeline is structured into 5 sequential stages:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      GITLAB CI/CD PIPELINE                            │
│                                                                         │
│  ┌───────────────────────┐                                              │
│  │     STAGE 1:          │                                              │
│  │   QUALITY GATE        │                                              │
│  │  (Typecheck, Lint,    │                                              │
│  │   Test, Security,     │                                              │
│  │   SBOM)               │                                              │
│  └───────────┬───────────┘                                              │
│              │                                                          │
│  ┌───────────▼───────────┐                                              │
│  │     STAGE 2:          │                                              │
│  │      BUILD            │                                              │
│  │  (All workspaces)     │                                              │
│  └───────────┬───────────┘                                              │
│              │                                                          │
│  ┌───────────▼───────────┐                                              │
│  │     STAGE 3:          │                                              │
│  │   CONTAINER IMAGE     │                                              │
│  │  (Buildx → GitLab     │                                              │
│  │   Container Registry) │                                              │
│  └───────────┬───────────┘                                              │
│              │                                                          │
│  ┌───────────▼───────────┐                                              │
│  │     STAGE 4:          │                                              │
│  │    VALIDATE           │                                              │
│  │  (E2E, Visual Reg,    │                                              │
│  │   Lighthouse, Bundle, │                                              │
│  │   Container Scan)     │                                              │
│  └───────────┬───────────┘                                              │
│              │                                                          │
│  ┌───────────▼───────────┐                                              │
│  │     STAGE 5:          │                                              │
│  │     DEPLOY            │                                              │
│  │  (Staging auto,       │                                              │
│  │   Production manual)  │                                              │
│  └───────────────────────┘                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. STAGE 1: QUALITY GATE

### Jobs

| Job | Script | Timeout | Required |
|-----|--------|---------|----------|
| `typecheck` | `npm run typecheck` (packages/types, packages/utils, apps/frontend, apps/backend) | 10 min | ✅ Required |
| `lint` | `npm run lint --workspace=apps/backend` + `--workspace=apps/frontend` | 10 min | ✅ Required |
| `test` | `npm run test --workspace=apps/backend` + `--workspace=apps/frontend` | 15 min | ✅ Required |
| `security-scan` | `npm audit --audit-level=high` (non-blocking), Snyk scan (if token configured) | 10 min | ⚠️ Non-blocking |
| `sbom` | CycloneDX SBOM generation via `@cyclonedx/cyclonedx-npm` | 5 min | ⚠️ Non-blocking (main/develop only) |

### Design Token Gate

```bash
node scripts/check-design-tokens.mjs  # 0 violations (without --allow-inline-style-hex)
```

This gate enforces that all UI-facing components use canonical design tokens (`sl-void`, `sl-gold`, `--color-*`). The `--allow-inline-style-hex` suppression flag was removed after the `fix/ui-design-tokens` branch made the gate pass natively.

---

## 4. STAGE 2: BUILD

| Job | Script | Artifacts | Timeout |
|-----|--------|-----------|---------|
| `build` | `npm run build` for packages/types, packages/utils, apps/frontend, apps/backend | `.next/`, `dist/`, `packages/*/dist/` | 20 min |

**Environment:** `NODE_ENV=production`, `NEXT_PUBLIC_*` placeholder variables set.

---

## 5. STAGE 3: CONTAINER IMAGE

Three parallel image build jobs using Docker Buildx with DinD:

| Job | Dependencies | Tags | Timeout |
|-----|-------------|------|---------|
| `build-image-backend` | `build` | `:$SHA`, `:$BRANCH`, `:latest` | 15 min |
| `build-image-frontend` | `build` | `:$SHA`, `:$BRANCH`, `:latest` | 15 min |
| `build-image-cms` | `build` | `:$SHA`, `:$BRANCH`, `:latest` | 15 min |

**Registry:** GitLab Container Registry (`registry.gitlab.hexastudio.net`)
**Build args (frontend):** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CMS_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STRAPI_API_URL`

---

## 6. STAGE 4: VALIDATE

| Job | Needs | Script | Timeout | Rules |
|-----|-------|--------|---------|-------|
| `e2e` | `build` | Playwright with Chromium | 20 min | main, develop, MR |
| `visual-regression` | `build` | Playwright visual regression with snapshot update | 15 min | main, develop only |
| `lighthouse` | `build` | `@lhci/cli autorun` | 15 min | main, develop |
| `bundle-analysis` | `build` | `npm run analyze` + `check-bundle-budgets.mjs` | 10 min | main, MR |
| `container-scan` | `build-image-*` | Trivy scan for HIGH/CRITICAL | 10 min | main, develop, MR |

**Bundle Budgets:** First-load JS per route < 200KB, Total initial < 500KB, Single chunk < 500KB

---

## 7. STAGE 5: DEPLOY

| Job | When | Script | Environment |
|-----|------|--------|-------------|
| `deploy-production` | **manual** (approval required) | SSH → `git reset --hard gitlab/main` → `deploy-zero-downtime.sh` → health checks | Production (`hexastudio.net`) |
| `deploy-staging` | `on_success` (auto) | SSH → `git pull` → `docker compose pull` → `up -d` → prune | Staging (`staging.hexastudio.net`) |

**Blue/Green Deployment:** Production uses the `SOT` (Source of Truth) environment suffix for zero-downtime slot switching via `scripts/deploy-zero-downtime.sh`. Current live slot: `blue`.

---

## 8. SECRETS & ENVIRONMENT VARIABLES

GitLab CI/CD variables required for pipeline execution and deployment:

| Variable | Type | Masked | Scope | Purpose |
|----------|------|--------|-------|---------|
| `SSH_PRIVATE_KEY` | File | Yes | Production | SSH deploy key (production) |
| `PROD_SERVER_IP` | Variable | Yes | Production | Production server (`19.16.1.100`) |
| `PROD_SERVER_USER` | Variable | Yes | Production | SSH user (`root`) |
| `STAGING_SSH_KEY` | File | Yes | Staging | SSH deploy key (staging) |
| `STAGING_SERVER_IP` | Variable | Yes | Staging | Staging server address |
| `STABILITY_SECRET` | Variable | Yes | All | Draft preview mode verification |

---

## 9. LOCAL PIPELINE EMULATION

Developers can run the full CI sequence locally before pushing:

```bash
# Run complete Quality Gate sequence locally
npm run lint && npm run typecheck && npm run test && npm run build

# Design token gate (no suppression flag needed)
node scripts/check-design-tokens.mjs

# Font preload gate
node scripts/check-font-preloads.mjs
```

---

## 10. RELATED DOCUMENTATION

- [CI_CD_GOVERNANCE.md](CI_CD_GOVERNANCE.md) — Full GitLab CI/CD governance specification
- [GITLAB_MIGRATION.md](GITLAB_MIGRATION.md) — Migration memory and runbook
- [GITLAB_OPERATIONS.md](GITLAB_OPERATIONS.md) — Operational runbook for self-hosted GitLab
- [QUALITY_GATES.md](../quality/QUALITY_GATES.md) — Quality gate controller and scoring
