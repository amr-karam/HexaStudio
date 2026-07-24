# GitLab CI/CD Migration — HE Memory

## Pipeline stages
1. **quality** — typecheck, cms-typecheck, lint, security-scan, test
2. **build** — packages/types, packages/utils, apps/frontend, apps/backend
3. **image** — Buildx + DinD; push to `$CI_REGISTRY_IMAGE/{backend,frontend,cms}`
4. **validate** — e2e, visual-regression, lighthouse, bundle-analysis
5. **deploy** — deploy-production (main), deploy-staging (develop)

## Rules of the migration
- Image tags: `$CI_COMMIT_SHORT_SHA` always + `$CI_COMMIT_REF_SLUG` (branch name) + `latest`
- Container Registry: `$CI_REGISTRY_IMAGE` (GitLab built-in, replaces GHCR)
- Caching: `type=registry` Buildx cache (replaces `type=gha`)
- Secrets: formerly GitHub Actions secrets → now GitLab CI/CD variables (group or project)
- SSH deploy: inlined `apk add openssh` + `ssh-agent` (no `appleboy/ssh-action`)

## Mapping GitHub → GitLab CI/CD variables
| GitHub secret | GitLab CI/CD variable | Type |
|---|---|---|
| `SNYK_TOKEN` | `SNYK_TOKEN` | Masked |
| `SSH_PRIVATE_KEY` (production) | `SSH_PRIVATE_KEY` | Masked, file |
| `PROD_SERVER_IP` | `PROD_SERVER_IP` | Masked |
| `PROD_SERVER_USER` | `PROD_SERVER_USER` | Masked |
| `STAGING_SERVER_IP` | `STAGING_SERVER_IP` | Masked |
| `STAGING_SERVER_USER` | `STAGING_SERVER_USER` | Masked |
| `STAGING_SSH_KEY` | `STAGING_SSH_KEY` | Masked, file |
| `LHCI_GITHUB_APP_TOKEN` | (not needed) | Use `LHCI_PUSH_TARGET_URL` for GitLab upload |

## Frontend build-time public env vars
Set as **group-level CI/CD variables** (not masked, so they expand at build):
- `NEXT_PUBLIC_API_URL=https://api.hexastudio.net`
- `NEXT_PUBLIC_CMS_URL=https://cms.hexastudio.net`
- `NEXT_PUBLIC_SITE_URL=https://hexastudio.net`

## GitLab Runner
- Docker executor
- `privileged=true` (for DinD)
- Mount `/var/run/docker.sock` for sibling containers
- Registered with project token (not global runner)

## Server layout
- GitLab CE: `docker-compose.gitlab.yml` → exposed on `8929` (HTTP), `5050` (registry), `2222` (SSH)
- GitLab Runner: `docker-compose.gitlab-runner.yml`
- Network: `hexa-gitlab-net` (external, shared between services)
- Deploy: `bash scripts/deploy-gitlab.sh` (idempotent)

## Migration script
`scripts/migrate-from-github.sh` does the following:
1. Creates project via GitLab API (idempotent)
2. Adds `gitlab` remote (SSH)
3. `git push --mirror gitlab` (full history + tags + branches)
4. Renames `gitlab` → `origin` (replaces GitHub URL)

## Files touched by this migration
- NEW: `.gitlab-ci.yml`
- NEW: `docker-compose.gitlab.yml`
- NEW: `docker-compose.gitlab-runner.yml`
- NEW: `scripts/deploy-gitlab.sh`
- NEW: `scripts/migrate-from-github.sh`
- NEW: `.env.gitlab.example`
- DELETE (after GitLab is validated): `.github/workflows/ci.yml`
- DELETE (after GitLab is validated): `.github/workflows/cd.yml`
- DELETE (after GitLab is validated): `.github/workflows/ci-cd.yml`
- UPDATE: Dockerfile image references (`ghcr.io/...` → `registry.gitlab.com/...`)
- UPDATE: `README.md`, `CONTRIBUTING.md`, `HEXA-Vision-Playbook/**/README.md` — clone URLs
- UPDATE: `HEXA-Vision-Playbook/13-DEVOPS/**/LOCAL_DEPLOYMENT.md`, `server-setup.md`
- UPDATE: `HEXA-Vision-Playbook/15-QUALITY/DEPENDENCY_REPORT.md` — Dependabot → GitLab Dependency Scanning
