# HEXA Studio — RISK REGISTER

> Version: 1.1 | Last Updated: 2026-07-27 | Authority: Project Lead / Architecture Review Board

## Risk Rating Matrix

| Likelihood \ Impact | Minor | Moderate | High | Critical |
|--------------------|-------|----------|------|----------|
| **Almost Certain** | MEDIUM | HIGH | CRITICAL | CRITICAL |
| **Likely** | LOW | MEDIUM | HIGH | CRITICAL |
| **Possible** | LOW | MEDIUM | HIGH | HIGH |
| **Unlikely** | LOW | LOW | MEDIUM | HIGH |
| **Rare** | LOW | LOW | MEDIUM | MEDIUM |

## Risk Register

### Infrastructure Risks

| ID | Risk | Likelihood | Impact | Severity | Mitigation | Contingency | Owner | Review |
|----|------|-----------|--------|----------|------------|-------------|-------|--------|
| R-001 | **Single server failure** — Entire platform runs on one physical server; if it fails, everything is down | Rare | Critical | HIGH | Docker volumes on separate disk; regular automated backups to S3; documented DR runbook | Provision new server, restore latest backup from S3, update DNS. RTO < 30 min | DevOps Lead | Monthly |
| R-002 | **Disk full** — Logs, backups, or database growth exhaust disk space | Possible | High | HIGH | Prometheus disk alerts at 80%/90%; log rotation (max 3 files x 10 MB); monitoring retention limits; weekly disk usage review | Prune old logs and backups; extend volume; migrate data to larger disk | DevOps | Weekly |
| R-003 | **Network outage** — Server connectivity lost due to ISP or hosting provider issue | Unlikely | Critical | HIGH | Cloudflare CDN caches static assets during outage; status page at status.hexastudio.net; redundant NIC | Failover to secondary server (future); communicate via status page | DevOps Lead | Monthly |
| R-004 | **Docker daemon crash** — Docker service stops, halting all containers | Rare | Critical | MEDIUM | Docker configured for auto-restart (`restart: unless-stopped`); systemd watchdog; health checks on all services | `systemctl restart docker` then `docker compose up -d` | DevOps | Monthly |
| R-005 | **SSL certificate expiry** — Let's Encrypt auto-renewal fails, browsers block the site | Unlikely | High | MEDIUM | Traefik auto-renewal via ACME; Prometheus alert at 10 days before expiry; Cloudflare edge SSL fallback | Manual cert generation or Cloudflare origin certificate | DevOps | Weekly |

### Security Risks

| ID | Risk | Likelihood | Impact | Severity | Mitigation | Contingency | Owner | Review |
|----|------|-----------|--------|----------|------------|-------------|-------|--------|
| R-006 | **Security breach via vulnerable dependency** — Zero-day in npm package, Docker base image, or Odoo module | Possible | Critical | HIGH | Trivy container scanning in CI/CD (critical=block); npm audit every pipeline; regular `npm audit fix`; SBOM generation per build | Pin affected package version; apply patch; rollback to last known good image | DevOps Lead | Monthly |
| R-007 | **DDoS attack** — Layer 3/7 DDoS overwhelms server or saturates bandwidth | Possible | High | HIGH | Cloudflare DDoS protection (under attack mode); rate limiting via WAF and Traefik; CDN absorbs static traffic | Enable Cloudflare "I'm Under Attack" mode; scale resources; contact upstream provider | DevOps Lead | Quarterly |
| R-008 | **Unauthorized access to admin interfaces** — Credential compromise for Grafana, GitLab, or Odoo admin | Unlikely | Critical | HIGH | Cloudflare Access (Zero Trust) for monitoring endpoints; strong passwords rotated every 90 days; 2FA enforced where possible; IP whitelisting | Revoke credentials; rotate all passwords; audit access logs; investigate breach | DevOps Lead | Monthly |
| R-009 | **CI/CD secret leakage** — SSH keys or API tokens exposed in pipeline logs or artifacts | Rare | Critical | MEDIUM | All secrets as masked GitLab CI/CD variables; `.gitignore` blocks secret files; `trivy` scans for secrets; pipeline artifacts expire after 7-30 days | Rotate all exposed secrets immediately; revoke SSH keys; audit pipeline logs | DevOps | Weekly |
| R-010 | **Odoo XML-RPC exploit** — Vulnerability in Odoo RPC endpoint allows data exfiltration | Unlikely | High | MEDIUM | Odoo behind Traefik (no direct exposure); webhook signature verification (HMAC-SHA256); network isolation (internal network) | Patch Odoo; isolate Odoo further; audit access logs | Security Team | Monthly |

### Data Risks

| ID | Risk | Likelihood | Impact | Severity | Mitigation | Contingency | Owner | Review |
|----|------|-----------|--------|----------|------------|-------------|-------|--------|
| R-011 | **Database corruption** — PostgreSQL data corruption due to hardware fault, bug, or failed migration | Unlikely | Critical | HIGH | Daily pg_dump with WAL archiving; backup verification weekly; point-in-time recovery capable | Restore from latest clean backup; identify and replay WAL to minimize data loss | DevOps | Monthly |
| R-012 | **MinIO data loss** — Accidental deletion or corruption of stored files (3D models, renders, documents) | Possible | High | HIGH | MinIO versioning (backup bucket); daily mc mirror to offsite; lifecycle policies for `temp/` objects; all backups encrypted | Restore from latest mc mirror backup; verify file integrity | DevOps | Weekly |
| R-013 | **Data leakage via signed URLs** — MinIO presigned URLs intercepted or shared publicly | Possible | Moderate | MEDIUM | Signed URLs expire after 1 hour; HTTPS enforced; download links tied to authenticated sessions; URL not logged in plaintext | Rotate MinIO keys; invalidate all presigned URLs; audit access logs | Backend Lead | Monthly |
| R-014 | **Redis data loss** — Cache data lost on restart due to lack of persistence | Likely | Minor | LOW | Cache data is rebuildable from origin; session data uses RDB persistence; queues use RDB persistence | Data auto-rebuilds from origin on cache miss; sessions re-authenticate | DevOps | Quarterly |
| R-015 | **Odoo data inconsistency** — Sync failure between Odoo and NestJS BFF causes stale or duplicate records | Possible | Moderate | MEDIUM | Circuit breaker pattern (stops Odoo calls at 20% failure rate); Redis fallback queue for pending syncs; idempotency keys prevent duplicates; periodic full sync (every 10 min) | Manual reconciliation via Odoo admin; clear Redis pending queue; trigger full sync | Backend Lead | Weekly |

### Operations Risks

| ID | Risk | Likelihood | Impact | Severity | Mitigation | Contingency | Owner | Review |
|----|------|-----------|--------|----------|------------|-------------|-------|--------|
| R-016 | **Deployment failure** — CI/CD pipeline deploys broken code to production | Possible | High | HIGH | Quality gate (lint, typecheck, test, security scan) blocks pipeline; staging environment validates first; health checks run post-deploy; blue/green with rollback | `docker compose rollback` to previous tag; revert Git commit; notify team | DevOps Lead | Per deploy |
| R-017 | **Configuration drift** — Server configuration diverges from documented state over time | Possible | Moderate | MEDIUM | Infrastructure as code via `docker-compose.prod.yml`; Git-tracked config files; periodic audits against documented state | Reconcile using `docker-compose.prod.yml config` vs actual; apply changes | DevOps | Quarterly |
| R-018 | **Monitoring failure** — Prometheus, Grafana, or Loki stops collecting data, creating blind spot | Possible | High | HIGH | Uptime Kuma monitors Prometheus/Grafana endpoints; alertmanager configured for self-monitoring; redundant scrape targets | Restart monitoring stack; verify data collection; investigate root cause | DevOps | Monthly |
| R-019 | **Backup failure** — pg_dump or mc mirror fails silently, no recoverable backup available | Possible | Critical | HIGH | Backup monitoring Prometheus metrics; `backup_job_failed_total` alert; backup verification weekly; email notification on failure | Investigate failure cause; retry backup; verify file existence and size | DevOps | Daily (auto) |

### Dependency Risks

| ID | Risk | Likelihood | Impact | Severity | Mitigation | Contingency | Owner | Review |
|----|------|-----------|--------|----------|------------|-------------|-------|--------|
| R-020 | **Third-party API deprecation** — Cloudflare, Sentry, or other external service changes/deprecates API | Possible | Moderate | MEDIUM | Monitor API changelogs and deprecation notices; abstract external API calls behind adapter layer; version-pin SDKs | Update adapter to new API version; test in staging; deploy | Backend Lead | Quarterly |
| R-021 | **npm registry downtime** — Unable to install dependencies during CI/CD or local dev | Unlikely | High | MEDIUM | `npm ci` uses lockfile; GitLab CI/CD caches `node_modules/`; npm cache in `.npm/`; alternative registry mirror configured | Use npm cache; switch to mirror registry; wait for restoration | DevOps | Quarterly |
| R-022 | **Docker Hub rate limiting** — Anonymous pull limits hit during CI/CD builds | Possible | Moderate | LOW | Authenticated pulls via GitLab CI (free tier); images pulled from GitLab Container Registry; Buildx cache reduces pulls | Add Docker Hub credentials to CI/CD variables; use mirror registry | DevOps | Monthly |
| R-026 | **Cross-platform optional dependency omitted from npm lockfile** — Windows-generated lockfile can omit Linux native bindings and stop GitLab tests | Possible | High | HIGH | Exact governed optional binding; npm 11.17.0; clean Linux install and load test; ADR-010 | Revert atomic CI commit or regenerate lockfile in verified Linux environment | DevOps / QA | Per Vite/Vitest upgrade |
| R-027 | **Single GitLab runner bottleneck** — Serial 30+ minute pipelines delay feedback and incident recovery | Likely | Moderate | MEDIUM | Cancel superseded pipelines; optimize cache; track queue/runtime | Add a second isolated runner and architecture-keyed caches | DevOps | Weekly |
| R-028 | **GitLab credentials exposed over plain HTTP or embedded remote URLs** — credentials can be intercepted or leaked from local configuration/transcripts | Possible | Critical | CRITICAL | Rotate exposed credentials; remove inline credentials; use SSH/credential helper; place GitLab behind TLS and restricted access | Revoke credentials, audit logs, rotate runner/project credentials, investigate unauthorized access | Security / DevOps | Immediate until closed |

### Team Risks

| ID | Risk | Likelihood | Impact | Severity | Mitigation | Contingency | Owner | Review |
|----|------|-----------|--------|----------|------------|-------------|-------|--------|
| R-023 | **Single point of failure (knowledge)** — Only one person knows how to deploy, debug, or operate critical systems | Likely | High | HIGH | Document all procedures in HEXA-Vision-Playbook; cross-train DevOps tasks across team; runbooks for incident response; DR drills performed by multiple team members | Escalate to secondary; review documentation; pair on critical tasks | Project Lead | Monthly |
| R-024 | **Team member departure** — Critical knowledge lost when a key developer leaves | Possible | High | HIGH | Documentation is mandatory (ADR for architecture, runbooks for operations); code review culture ensures code is understood by >1 person; onboarding checklist | Redistribute responsibilities; review and update documentation; knowledge transfer sessions | Project Lead | Per departure |
| R-025 | **Decision paralysis / architecture bikeshedding** — Team gets stuck debating implementation details | Possible | Moderate | LOW | Constitution states "Maintainability > Speed"; explicit decision deadlines; ADR process captures decisions; Chief Architect breaks ties | Escalate to Project Lead for binding decision | Project Lead | As needed |

## Risk Response Plan

### Immediate Response (Critical Severity)
1. **Detect** — Alert triggers from Prometheus, Sentry, or Uptime Kuma
2. **Assess** — On-call engineer triages within 15 minutes
3. **Contain** — Stop the bleeding (rollback, block traffic, isolate)
4. **Resolve** — Apply fix or recovery procedure
5. **Analyze** — Root cause analysis, incident report filed
6. **Prevent** — Implement mitigation to prevent recurrence

### Escalation Path
```
Level 1: On-call Engineer (15 min response)
Level 2: DevOps Lead (30 min response)
Level 3: Project Lead / Chief Architect (1 hour response)
Level 4: Emergency meeting with stakeholders
```

## Risk Owner Responsibilities

| Owner | Responsibilities |
|-------|-----------------|
| **DevOps Lead** | Infrastructure uptime, backup integrity, CI/CD stability, security scanning |
| **Backend Lead** | Data integrity, Odoo sync, API reliability, database performance |
| **Frontend Lead** | 3D performance, bundle size, client-side errors, accessibility |
| **Security Team** | Vulnerability scanning, penetration testing, threat modeling |
| **Project Lead** | Escalation, resource allocation, risk acceptance decisions |

## Acceptance Criteria

Risks with severity **LOW** may be accepted without action.
Risks with severity **MEDIUM** must have documented mitigation.
Risks with severity **HIGH** must have mitigation and contingency.
Risks with severity **CRITICAL** must have mitigation, contingency, and be reported to Project Lead.

---

## Appendix: Historical Incidents

| Date | Incident | Root Cause | Resolution | Risk ID |
|------|----------|------------|------------|---------|
| 2026-07-13 | Production deployment broke API | Missing env var in CI/CD pipeline | Rolled back, fixed variable, re-deployed | R-016 |
| 2026-07-20 | Staging disk full | Logs consumed 100% of SSD | Added log rotation, pruned logs | R-002 |
| 2026-07-22 | Odoo sync stalled | Odoo service unreachable due to config change | Restarted Odoo, cleared pending queue | R-015 |
| 2026-07-25 | GitLab Pipeline #8 test job failed | npm lockfile omitted Linux Rolldown native binding; npm rebuild could not repair dependency graph | ADR-010 remediation: exact optional binding, npm/Node pin, clean Linux verification | R-026 |
