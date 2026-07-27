# HEXA Studio — CI/CD GOVERNANCE

> Version: 1.0 | Last Updated: 2026-07-26 | Authority: DevOps Lead

## Table of Contents

1. [Pipeline Architecture](#1-pipeline-architecture)
2. [Stages](#2-stages)
3. [Job Details](#3-job-details)
4. [Branch Strategy](#4-branch-strategy)
5. [Rollback Strategy](#5-rollback-strategy)
6. [Security Scanning](#6-security-scanning)
7. [Variable Management](#7-variable-management)
8. [Artifact Retention](#8-artifact-retention)
9. [Runner Configuration](#9-runner-configuration)
10. [Compliance & Auditing](#10-compliance--auditing)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Pipeline Architecture

### ASCII Flow Diagram

```
                      ┌─────────────────────────────────────────────────────┐
                      │               GITLAB CE (self-hosted)              │
                      │              19.16.1.100:8929                      │
                      └─────────────────────┬───────────────────────────────┘
                                              │
                    Push to main/develop       │  Merge Request
                    or MR event                │
                      │                        │
                      ▼                        ▼
              ┌─────────────────────────────────────────┐
              │            WORKFLOW START                │
              │  Rules: if $CI_COMMIT_BRANCH exists OR   │
              │  $CI_PIPELINE_SOURCE == merge_request    │
              └────────────────┬────────────────────────┘
                               │
              ┌────────────────▼────────────────┐
              │     STAGE 1: QUALITY GATE       │
              │  ┌──────┐ ┌──────┐ ┌────────┐  │
              │  │type  │ │ lint │ │security│  │
              │  │check │ │      │ │ scan   │  │
              │  └──┬───┘ └──┬───┘ └───┬────┘  │
              │  ┌──┴──┐ ┌──┴──┐ ┌─────┴─────┐ │
              │  │cms  │ │test │ │ sbom      │ │
              │  │type  │ │     │ │           │ │
              │  └─────┘ └─────┘ └───────────┘ │
              │  ALL MUST PASS                  │
              └────────────────┬────────────────┘
                               │
              ┌────────────────▼────────────────┐
              │     STAGE 2: BUILD              │
              │  ┌─────────────────────────┐    │
              │  │  build (all apps)       │    │
              │  │  artifacts: .next/,     │    │
              │  │  dist/, packages/       │    │
              │  └─────────────────────────┘    │
              └────────────────┬────────────────┘
                               │
              ┌────────────────▼────────────────┐
              │     STAGE 3: CONTAINER IMAGE    │
              │  ┌──────────┐ ┌──────────┐     │
              │  │backend   │ │frontend  │     │
              │  │image     │ │image     │     │
              │  └──────────┘ └──────────┘     │
              │  ┌──────────┐                  │
              │  │cms image │                  │
              │  └──────────┘                  │
              │  Buildx + DinD → GitLab        │
              │  Container Registry            │
              └────────────────┬────────────────┘
                               │
              ┌────────────────▼────────────────┐
              │     STAGE 4: VALIDATE           │
              │  ┌──────┐ ┌──────┐ ┌─────────┐  │
              │  │ e2e  │ │visual│ │lighthouse│  │
              │  │      │ │regr. │ │          │  │
              │  └──────┘ └──────┘ └─────────┘  │
              │  ┌──────────┐ ┌──────────────┐  │
              │  │bundle    │ │container-scan │  │
              │  │analysis  │ │(Trivy)       │  │
              │  └──────────┘ └──────────────┘  │
              └────────────────┬────────────────┘
                               │
              ┌────────────────▼────────────────┐
              │     STAGE 5: DEPLOY             │
              │                                  │
              │  main branch:                    │
              │  ┌───────────────────────────┐   │
              │  │  approve-production       │   │
              │  │  (manual gate)            │   │
              │  └───────────┬───────────────┘   │
              │              ▼                   │
              │  ┌───────────────────────────┐   │
              │  │  deploy-production        │   │
              │  │  blue/green, health check │   │
              │  └───────────────────────────┘   │
              │                                  │
              │  develop branch:                 │
              │  ┌───────────────────────────┐   │
              │  │  deploy-staging           │   │
              │  │  compose pull & up        │   │
              │  └───────────────────────────┘   │
              └──────────────────────────────────┘
```

### Key Pipeline Characteristics

| Property | Value |
|----------|-------|
| **Platform** | GitLab CE (self-hosted) |
| **Runner type** | Docker executor |
| **Concurrency** | 4 parallel jobs max |
| **Cache** | npm modules (keyed on lockfile hash) |
| **Image registry** | GitLab Container Registry |
| **Node version** | 20.20.2-bookworm-slim |
| **Docker version** | 24 (DinD for image builds) |
| **Pipeline trigger** | Push to main/develop, MR events |

---

## 2. Stages

| Stage | Order | Jobs | Required | Failure Policy |
|-------|-------|------|----------|---------------|
| `quality` | 1 | `typecheck`, `cms-typecheck`, `lint`, `test`, `security-scan`, `sbom` | ALL PASS (except security-scan, sbom) | Block |
| `build` | 2 | `build` | PASS | Block |
| `image` | 3 | `build-image-backend`, `build-image-frontend`, `build-image-cms` | PASS | Block |
| `validate` | 4 | `e2e`, `visual-regression`, `lighthouse`, `bundle-analysis`, `container-scan` | PASS (some conditional) | Block |
| `deploy` | 5 | `deploy-production`, `deploy-staging` | MANUAL (production) / AUTO (staging) | Warn |

### Stage Dependency Graph

```
quality ──► build ──► image ──► validate ──► deploy
   │          │          │           │            │
   │          │          │           │            ├── deploy-production (manual)
   │          │          │           │            └── deploy-staging (auto)
   │          │          │           │
   │          │          │           └── container-scan (needs image)
   │          │          │
   │          │          └── Each build-image-* is independent, parallel
   │          │
   │          └── single build job (serial)
   │
   └── 6 parallel jobs
```

---

## 3. Job Details

### 3.1 Quality Stage

#### `typecheck`
| Property | Value |
|----------|-------|
| **Image** | `node:20.20.2-bookworm-slim` |
| **Script** | `npm run typecheck` for: packages/types, packages/ui, packages/utils, apps/frontend, apps/backend |
| **Cache** | npm modules (keyed on `package-lock.json`) |
| **Artifacts** | None |
| **Timeout** | 10 min |
| **Rules** | Always (any branch, any MR) |

#### `cms-typecheck`
| Property | Value |
|----------|-------|
| **Image** | `node:20.20.2-bookworm-slim` |
| **Script** | `npm run typecheck` (in CMS context) |
| **Cache** | CMS-specific (keyed on `apps/cms/package-lock.json`) |
| **Timeout** | 10 min |
| **Rules** | Always |

#### `lint`
| Property | Value |
|----------|-------|
| **Image** | `node:20.20.2-bookworm-slim` |
| **Script** | `npm run lint --workspace=apps/backend` + `--workspace=apps/frontend` |
| **Cache** | npm modules |
| **Timeout** | 10 min |
| **Rules** | Always |

#### `test`
| Property | Value |
|----------|-------|
| **Image** | `node:20.20.2-bookworm-slim` |
| **Script** | `npm run test --workspace=apps/backend` + `--workspace=apps/frontend` |
| **Artifacts** | JUnit reports (`apps/*/coverage/junit.xml`), expire 30 days |
| **Timeout** | 15 min |
| **Rules** | Always |

#### `security-scan`
| Property | Value |
|----------|-------|
| **Image** | `node:20.20.2-bookworm-slim` |
| **Script** | `npm audit --audit-level=high` (non-blocking), Snyk scan (if token configured) |
| **Allow failure** | `true` |
| **Artifacts** | `.snyk/` (expire 7 days) |
| **Timeout** | 10 min |
| **Rules** | Always |

#### `sbom`
| Property | Value |
|----------|-------|
| **Image** | `node:20.20.2-bookworm-slim` |
| **Script** | CycloneDX SBOM generation via `@cyclonedx/cyclonedx-npm` |
| **Artifacts** | `gl-sbom.json` (expire 30 days) |
| **Timeout** | 5 min |
| **Rules** | Only `main` and `develop` branches |

### 3.2 Build Stage

#### `build`
| Property | Value |
|----------|-------|
| **Image** | `node:20.20.2-bookworm-slim` |
| **Script** | `npm run build` for packages/types, packages/utils, apps/frontend, apps/backend |
| **Artifacts** | `apps/frontend/.next/`, `apps/backend/dist/`, `packages/types/dist/` (expire 1 day) |
| **Cache** | npm modules |
| **Timeout** | 20 min |
| **Rules** | Always |

### 3.3 Image Stage

All three image jobs run in parallel and share the same pattern:

#### `build-image-backend`
| Property | Value |
|----------|-------|
| **Image** | `docker:24` |
| **Services** | `docker:24-dind` (Docker-in-Docker) |
| **Cache** | Buildx cache pushed to registry (`$BACKEND_IMAGE:buildcache`, `mode=max`) |
| **Script** | `docker buildx build --cache-from --cache-to --tag --push` |
| **Dependencies** | `build` (needs build artifacts) |
| **Timeout** | 15 min |
| **Tags** | `:$IMAGE_TAG_SHA`, `:$IMAGE_TAG_BRANCH`, `:latest` |
| **Rules** | `main`, `develop`, MR events |

#### `build-image-frontend`
| Property | Value |
|----------|-------|
| **Image** | `docker:24` |
| **Services** | `docker:24-dind` |
| **Build args** | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CMS_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STRAPI_API_URL` |
| **Cache** | Buildx cache via registry |
| **Dependencies** | `build` |
| **Timeout** | 15 min |
| **Tags** | `:$IMAGE_TAG_SHA`, `:$IMAGE_TAG_BRANCH`, `:latest` |
| **Rules** | `main`, `develop`, MR events |

#### `build-image-cms`
| Property | Value |
|----------|-------|
| **Image** | `docker:24` |
| **Services** | `docker:24-dind` |
| **Cache** | Buildx cache via registry |
| **Dependencies** | `build` |
| **Timeout** | 15 min |
| **Tags** | `:$IMAGE_TAG_SHA`, `:$IMAGE_TAG_BRANCH`, `:latest` |
| **Rules** | `main`, `develop`, MR events |

### 3.4 Validate Stage

#### `e2e`
| Property | Value |
|----------|-------|
| **Image** | `mcr.microsoft.com/playwright:v1.49.0-noble` |
| **Needs** | `build` |
| **Script** | Install Chromium, build frontend, run `test:e2e` |
| **Artifacts** | `playwright-report/` (on failure, expire 7 days) |
| **Timeout** | 20 min |
| **Rules** | `main`, `develop`, MR events |

#### `visual-regression`
| Property | Value |
|----------|-------|
| **Image** | `mcr.microsoft.com/playwright:v1.49.0-noble` |
| **Needs** | `build` |
| **Script** | Install Chromium, build frontend, run Playwright visual regression with snapshot update |
| **Artifacts** | `playwright-report/` (on failure, expire 7 days) |
| **Timeout** | 15 min |
| **Rules** | `main`, `develop` only |

#### `lighthouse`
| Property | Value |
|----------|-------|
| **Image** | `node:20.20.2-bookworm-slim` |
| **Needs** | `build` |
| **Script** | Build standalone, run `@lhci/cli autorun` |
| **Artifacts** | `.lighthouseci/` (expire 7 days) |
| **Timeout** | 15 min |
| **Rules** | `main`, `develop` |

#### `bundle-analysis`
| Property | Value |
|----------|-------|
| **Image** | `node:20.20.2-bookworm-slim` |
| **Needs** | `build` |
| **Script** | `npm run analyze` + `node scripts/check-bundle-budgets.mjs` |
| **Budgets** | First-load JS per route < 200KB, Total initial < 500KB, Single chunk < 500KB |
| **Artifacts** | `apps/frontend/.next/analyze/` (expire 7 days) |
| **Timeout** | 10 min |
| **Rules** | `main`, MR events |
| **Failure** | Exits 1 (fails pipeline) if any budget exceeded |

#### `container-scan`
| Property | Value |
|----------|-------|
| **Image** | `aquasec/trivy:latest` |
| **Needs** | `build-image-backend`, `build-image-frontend`, `build-image-cms` |
| **Script** | Scan all 3 images for HIGH/CRITICAL vulnerabilities; output JSON + table; fail on fixable CRITICAL only |
| **Artifacts** | `trivy-*.json` (always, expire 7 days) |
| **Timeout** | 10 min |
| **Rules** | `main`, `develop`, MR events |

### 3.5 Deploy Stage

#### `deploy-production`
| Property | Value |
|----------|-------|
| **Image** | `alpine:latest` |
| **Needs** | All 3 build-image-* jobs |
| **Script** | SSH to production server → `git fetch origin main` → `git reset --hard origin/main` → `bash scripts/deploy-zero-downtime.sh` → health verification |
| **When** | `manual` (requires approval) |
| **Allow failure** | `false` (must succeed) |
| **Environment** | `production` (`https://hexastudio.net`) |
| **Timeout** | 15 min |
| **Rules** | `main` branch + push event |

#### `deploy-staging`
| Property | Value |
|----------|-------|
| **Image** | `alpine:latest` |
| **Needs** | All 3 build-image-* jobs |
| **Script** | SSH to staging server → `git pull` → `docker compose -f docker-compose.prod.yml pull` → `up -d --remove-orphans` → prune |
| **When** | `on_success` (automatic) |
| **Environment** | `staging` (`https://staging.hexastudio.net`) |
| **Timeout** | 10 min |
| **Rules** | `develop` branch + push event |

---

## 4. Branch Strategy

| Branch | Environment | Deploy Strategy | Pipeline Trigger | Approval Required |
|--------|-------------|-----------------|------------------|-------------------|
| `main` | Production | Blue/Green zero-downtime via `deploy-zero-downtime.sh` | Push | Yes (manual gate) |
| `develop` | Staging | Compose pull & up (rolling restart) | Push | No |
| `feature/*` | - | Pipeline only (no deploy) | Push + MR | No (MR may require approval) |
| `fix/*` | - | Pipeline only (no deploy) | Push + MR | No |

### Branch Protection Rules

| Branch | Protected | Allowed to Push | Allowed to Merge |
|--------|-----------|-----------------|------------------|
| `main` | Yes | Maintainer+ | Maintainer+ (with pipeline success) |
| `develop` | Yes | Developer+ | Developer+ (with pipeline success) |
| `feature/*` | No | Anyone | N/A |

### Merge Request Requirements

- Pipeline must pass before merge
- At least 1 approval required
- No discussions unresolved
- Target branch: `develop` (feature) or `main` (hotfix)

---

## 5. Rollback Strategy

### 5.1 Blue/Green Rollback (Production)

Production uses a blue/green zero-downtime deployment via `scripts/deploy-zero-downtime.sh`:

```bash
# Automatic rollback (triggered by health check failure):
# The script deploys to the inactive stack, runs health checks,
# then swaps traffic. If health checks fail, traffic stays on
# the active stack.

# Manual rollback:
docker compose up -d <service>:<previous-sha-tag>
# or
git revert HEAD
git push origin main
# Pipeline re-deploys the reverted version
```

### 5.2 Rollback Procedure

| Step | Action | Command |
|------|--------|---------|
| 1 | Identify previous stable tag | `docker images registry.hexastudio.net/hexa/hexa-studio/backend` |
| 2 | Update docker-compose.prod.yml | Set image tag to previous SHA |
| 3 | Roll back services | `docker compose -f docker-compose.prod.yml up -d` |
| 4 | Verify health | `docker ps --filter "health=healthy"` |
| 5 | Revert Git | `git revert HEAD && git push origin main` |
| 6 | Notify team | Slack #deployments |

### 5.3 Failed Deployment Scenarios

| Scenario | Detection | Action |
|----------|-----------|--------|
| Health check fails | Script exits non-zero | Traffic stays on old stack, alert sent |
| Service unhealthy after 15s | `docker ps --filter "health=healthy"` fails | Rollback triggered |
| API health endpoint unreachable | `curl -sf http://localhost:4000/api/health` fails | Rollback, alert sent |
| Database migration error | Application logs error at startup | Rollback immediately, run migration manually |

### 5.4 Image Tag Strategy for Rollback

Images are tagged with both SHA (immutable) and branch (mutable):

```bash
registry.hexastudio.net/hexa/hexa-studio/backend:
  - a1b2c3d4    # Immutable SHA tag
  - main        # Mutable branch tag
  - latest      # Mutable latest tag
```

Rollback always uses the SHA tag to ensure the exact previous build is restored.

---

## 6. Security Scanning

### 6.1 Scanning Stages

| Scan | Tool | Stage | Scope | Gate Policy |
|------|------|-------|-------|-------------|
| Dependency audit | `npm audit` | `quality` | npm packages | Non-blocking (reported) |
| SCA/SAST | Snyk | `quality` | npm + code | Non-blocking (if token configured) |
| SBOM | CycloneDX | `quality` | npm packages | Information only |
| Container scan | Trivy | `validate` | Container images | Block on fixable CRITICAL |
| Secret detection | GitLab | Pre-commit | All files | Block on commit |

### 6.2 Vulnerability Policies

| Severity | npm audit | Trivy Container | Action |
|----------|-----------|-----------------|--------|
| CRITICAL | Reported (non-blocking) | Block (if fixable) | Must fix before merge |
| HIGH | Report in pipeline output | Reported (artifacts) | Fix within 7 days |
| MEDIUM | Reported | Reported (artifacts) | Fix within 30 days |
| LOW | Ignored | Ignored | Monitor quarterly |

### 6.3 SBOM Generation

- **Tool**: `@cyclonedx/cyclonedx-npm`
- **Format**: CycloneDX JSON
- **Output**: `gl-sbom.json`
- **Trigger**: On `main` and `develop` pushes
- **Storage**: Artifact (30-day retention)
- **Purpose**: Supply chain transparency, vulnerability tracking, compliance

---

## 7. Variable Management

### 7.1 CI/CD Variables

| Variable | Type | Masked | Scope | Purpose |
|----------|------|--------|-------|---------|
| `SNYK_TOKEN` | Variable | Yes | All | Snyk authentication |
| `SSH_PRIVATE_KEY` | File | Yes | Production | SSH deploy key (production) |
| `STAGING_SSH_KEY` | File | Yes | Staging | SSH deploy key (staging) |
| `PROD_SERVER_IP` | Variable | Yes | Production | Production server address |
| `PROD_SERVER_USER` | Variable | Yes | Production | SSH user |
| `STAGING_SERVER_IP` | Variable | Yes | Staging | Staging server address |
| `STAGING_SERVER_USER` | Variable | Yes | Staging | SSH user |

### 7.2 Environment Variables for Build

These are passed as build args to the frontend Docker image:

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | `https://api.hexastudio.net` | API endpoint |
| `NEXT_PUBLIC_CMS_URL` | `https://cms.hexastudio.net` | CMS endpoint |
| `NEXT_PUBLIC_SITE_URL` | `https://hexastudio.net` | Site URL |
| `NEXT_PUBLIC_STRAPI_API_URL` | `https://cms.hexastudio.net` | Strapi API endpoint |
| `SKIP_ENV_VALIDATION` | `true` | Skip Next.js env check in CI |

### 7.3 Variable Governance

- **No plaintext secrets in code** — All secrets stored as GitLab CI/CD variables
- **Masked variables** — All passwords, tokens, and keys must be masked
- **File-type variables** — SSH keys and certificates use file type
- **Scope restriction** — Variables scoped to specific environments (production vs staging)
- **Rotation** — Secrets rotated per policy (see INFRASTRUCTURE_GOVERNANCE.md §17)

---

## 8. Artifact Retention

### 8.1 Pipeline Artifacts

| Artifact | Source Job | Retention | Purpose |
|----------|-----------|-----------|---------|
| `.next/`, `dist/` | `build` | 1 day | Build output for image stage |
| `coverage/junit.xml` | `test` | 30 days | Test reporting |
| `.snyk/` | `security-scan` | 7 days | Snyk results |
| `gl-sbom.json` | `sbom` | 30 days | SBOM export |
| `playwright-report/` | `e2e`, `visual-regression` | 7 days | Test failure analysis |
| `.lighthouseci/` | `lighthouse` | 7 days | Performance report |
| `apps/frontend/.next/analyze/` | `bundle-analysis` | 7 days | Bundle size analysis |
| `trivy-*.json` | `container-scan` | 7 days | Vulnerability report |

### 8.2 Container Image Retention

| Tag Pattern | Retention | Cleanup |
|-------------|-----------|---------|
| `:{SHA}` | 90 days | GitLab container registry cleanup policy |
| `:{branch-slug}` | 30 days | GitLab container registry cleanup policy |
| `:latest` | Active (no expiry) | Manual cleanup |
| `:buildcache` | Indefinite (overwritten) | N/A |

---

## 9. Runner Configuration

### 9.1 Runner Specs

| Property | Value |
|----------|-------|
| **Executor** | Docker |
| **Image** | `docker:24-dind` (default) |
| **Concurrency** | 4 |
| **Tags** | `docker`, `hexa-prod` |
| **Untagged jobs** | Not allowed |
| **Docker volumes** | `/certs`, `/builds`, `/cache` |

### 9.2 Runner Registration

```bash
# Prerequisites
export GITLAB_URL="http://19.16.1.100:8929"
export RUNNER_TOKEN="<registration-token>"

# Register
docker exec gitlab-runner gitlab-runner register \
  --non-interactive \
  --url "$GITLAB_URL" \
  --token "$RUNNER_TOKEN" \
  --executor docker \
  --docker-image "docker:24-dind" \
  --docker-volumes "/certs/client" \
  --tag-list "docker,hexa-prod" \
  --run-untagged=false \
  --docker-privileged=true
```

### 9.3 Runner Maintenance

| Task | Frequency | Command |
|------|-----------|---------|
| Check status | Weekly | `docker exec gitlab-runner gitlab-runner status` |
| Verify connectivity | Weekly | `docker exec gitlab-runner gitlab-runner verify` |
| View logs | As needed | `docker logs gitlab-runner --tail 50` |
| Update runner | Quarterly | Pull latest `gitlab/gitlab-runner:latest` |

---

## 10. Compliance & Auditing

### 10.1 Pipeline Compliance

| Requirement | Verification | Enforced By |
|-------------|--------------|-------------|
| All code must pass typecheck | `typecheck` job | Pipeline |
| All tests must pass | `test` job | Pipeline |
| No critical CVEs in dependencies | `npm audit` | Pipeline (reported) |
| No fixable critical CVEs in images | `container-scan` (Trivy) | Pipeline (blocking) |
| Bundles must stay within budget | `bundle-analysis` | Pipeline (blocking) |
| Production deploys must be approved | Manual `deploy-production` job | GitLab |
| Main branch protected | No direct pushes | GitLab settings |
| MR requires pipeline success | Merge check | GitLab settings |

### 10.2 Audit Trail

All pipeline executions are logged in GitLab CI/CD with:
- Committer identity
- Commit SHA and message
- Pipeline duration and outcome
- Job-level logs with timestamps
- Artifact preservation
- Deployment environment mapping

### 10.3 Change Management

| Change Type | Approval | Documentation |
|-------------|----------|---------------|
| Production deploy | Manual gate | Deploy log + Slack notification |
| CI/CD config change (.gitlab-ci.yml) | MR + approval | Changelog entry |
| Variable change | DevOps Lead | Updated in password manager |
| Runner config change | DevOps Lead | Update runbook |

---

## 11. Troubleshooting

### 11.1 Common Pipeline Failures

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| `npm ci` fails | Lockfile out of sync | `npm install --legacy-peer-deps && npm run format:lock` |
| Typecheck fails | Type error in code | Fix type errors locally, re-push |
| Test fails | Broken test or regression | Check test output in artifacts |
| Docker build fails | Build cache corruption | Clear build cache, restart pipeline |
| Container scan fails | Critical CVE in base image | Update base image, patch dependency |
| Deploy SSH fails | SSH key expired or changed | Regenerate SSH key, update variable |
| Staging deploy fails | Docker Compose syntax error | Validate compose file locally |

### 11.2 Pipeline Debug Commands

```bash
# Run pipeline locally (requires gitlab-runner)
gitlab-runner exec docker build --pre-build-script "export SKIP_ENV_VALIDATION=true"

# Check runner logs
docker logs gitlab-runner --tail 50 -f

# Verify compose file
docker compose -f docker-compose.prod.yml config

# Test SSH connection
ssh -i <key> user@server -p 22

# Check registry images
curl -X GET https://registry.hexastudio.net/v2/_catalog
```

### 11.3 Rollback Procedure (Emergency)

```bash
# 1. Connect to production server
ssh user@prod-server

# 2. Navigate to project
cd /home/hexa/hexastudio

# 3. Revert to previous Git commit
git log --oneline -10
git revert HEAD --no-edit
git push origin main

# OR manually roll back containers
docker compose -f docker-compose.prod.yml up -d backend:<previous-sha>
docker compose -f docker-compose.prod.yml up -d frontend:<previous-sha>
docker compose -f docker-compose.prod.yml up -d cms:<previous-sha>

# 4. Verify health
curl -sf http://localhost:4000/api/health

# 5. Notify team
echo "Rollback complete. Triggering incident review."
```

---

## Related Documents

- [.gitlab-ci.yml](../../.gitlab-ci.yml) — Pipeline definition (source of truth)
- [GitLab Operations](../HEXA-Vision-Playbook/13-DEVOPS/GITLAB_OPERATIONS.md) — Runner and CI/CD ops
- [Deployment Strategy](../HEXA-Vision-Playbook/13-DEVOPS/DEPLOYMENT_STRATEGY.md) — Zero-downtime details
- [Infrastructure Governance](../HEXA-Vision-Playbook/13-DEVOPS/INFRASTRUCTURE_GOVERNANCE.md) — Server and Docker policies
- [Quality Gates](../HEXA-Vision-Playbook/15-QUALITY/QUALITY_GATES.md) — Quality enforcement standards
- [Troubleshooting](../HEXA-Vision-Playbook/13-DEVOPS/TROUBLESHOOTING.md) — Operational troubleshooting
