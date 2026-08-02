# HE Memory — GitLab CE Migration (FULL)

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│  Self-Hosted Stack (19.16.1.100)                             │
│                                                              │
│  ┌──────────────┐   ┌────────────────┐   ┌────────────────┐ │
│  │  GitLab CE   │──▶│ GitLab Runner  │──▶│ Build/Push     │ │
│  │  HTTP 8929   │   │  (Docker exec) │   │ Registry 5050  │ │
│  │  Registry    │   └────────────────┘   └────────────────┘ │
│  │  SSH 2222    │              │                            │
│  └──────────────┘              ▼                            │
│         │              SSH deploy to                        │
│         ▼              production stack                     │
│  ┌────────────────────────────────────┐                    │
│  │  docker-compose.prod.yml            │                    │
│  │  (14 services + Traefik)            │                    │
│  └────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

## Files by category

### Infrastructure (`/`)
- `docker-compose.gitlab.yml` — GitLab CE service
- `docker-compose.gitlab-runner.yml` — Docker executor runner
- `.env.gitlab.example` — CI/CD variable template

### CI/CD
- `.gitlab-ci.yml` — Main pipeline (5 stages)
- `.gitlab/security.yml` — Security & compliance scanning
- `lighthouserc.json` — Lighthouse assertions (GitLab-compatible: temporary-public-storage)

### Scripts
- `scripts/deploy-gitlab.sh` — Deploy GitLab CE (idempotent)
- `scripts/register-gitlab-runner.sh` — Register runner via API
- `scripts/setup-gitlab-variables.sh` — Bulk-create CI/CD variables via API
- `scripts/migrate-from-github.sh` — Mirror repo to GitLab

### Docs (updated)
- `README.md`, `CONTRIBUTING.md` — GitLab clone URLs
- `docs/devops/` — Deployment guides use GitLab URLs
- `docs/quality/` — DEPENDENCY_REPORT uses GitLab Dependency Scanning

### Docs (new)
- `docs/devops/GITLAB_MIGRATION.md` — Migration memory

### Removed
- `.github/workflows/ci.yml`
- `.github/workflows/cd.yml`
- `.github/workflows/ci-cd.yml`

## Operational runbook

### First-time deployment
```bash
# 1. On production server (19.16.1.100)
cd /opt/hexa/hexastudio
git pull origin main  # or clone fresh from GitLab after migration
cp .env.gitlab.example .env.gitlab
nano .env.gitlab  # fill in values

# 2. Deploy GitLab
bash scripts/deploy-gitlab.sh

# 3. Browse to http://19.16.1.100:8929 and change root password

# 4. Get Personal Access Token (api scope) → set GITLAB_TOKEN

# 5. Get runner registration token from project → set RUNNER_TOKEN

# 6. Register runner
bash scripts/register-gitlab-runner.sh

# 7. Bulk-set CI/CD variables
bash scripts/setup-gitlab-variables.sh

# 8. Add file-type variables in GitLab UI:
#    - SSH_PRIVATE_KEY (production)
#    - STAGING_SSH_KEY (staging)
#    - STAGING_SERVER_IP (env, staging)

# 9. Migrate repo from GitHub
bash scripts/migrate-from-github.sh

# 10. Trigger pipeline to validate
```

### Continuous operation
- Pipelines auto-trigger on push to `main` (prod) or `develop` (staging)
- MR pipelines auto-trigger on any push to an open MR
- Security scans run on every pipeline; results in Security tab
- Trivy container scans run on every built image
- Lighthouse runs on main/develop (LHCI artifacts stored in `.lighthouseci/`)

## Security model
- GitLab Container Registry credentials are auto-provided by GitLab (`$CI_REGISTRY_USER`/`$CI_REGISTRY_PASSWORD`)
- SSH deploy keys stored as masked file-type variables per environment
- Secrets are scoped per environment (production vs staging)
- Protected branches (`main`, `develop`) require Maintainer role to push directly
- Trivy container scanning fails the pipeline on high/critical CVEs
- npm audit fails the pipeline on high vulnerabilities
- Secret detection prevents committed secrets (must be added via `.gitignore` or CI/CD variables)

## What did NOT migrate
- **Pull Request reviews** — GitLab MRs work differently; need to recreate review rules
- **Branch protection rules** — Re-create in GitLab project settings
- **Webhooks** — Re-configure in GitLab for Strapi, Odoo, etc.
- **GitHub Discussions** — Not applicable to GitLab
- **GitHub Pages** — Replaced by Strapi static frontend or separate hosting
- **Snyk** — Replaced by GitLab Dependency Scanning + Container Scanning
