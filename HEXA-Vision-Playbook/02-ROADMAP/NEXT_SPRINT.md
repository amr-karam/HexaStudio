# Next Sprint: Production Hardening & Observability

**Sprint ID:** S-009 | **Focus:** Monitoring, Performance, Stability | **Status:** PLANNING

## 1. SPRINT OBJECTIVE

Harden the production deployment: establish real observability (alerts, dashboards, error budgets), enforce performance budgets in CI, verify disaster recovery, and resolve remaining technical debt.

## 2. HIGH-PRIORITY DELIVERABLES

### 📊 Observability
- [ ] **Grafana dashboards** — Production-grade panels: request latency, error rate, saturation, traffic (RED method)
- [ ] **Prometheus alerting rules** — CPU >80%, memory >90%, 5xx rate >1%, disk space
- [ ] **Sentry error budgets** — Configure release tracking, weekly error budget alerts
- [ ] **Loki log aggregation** — Ship Docker logs, structured querying, log-based alerts

### ⚡ Performance
- [ ] **Lighthouse CI gate** — Enforce >95 all categories in CI (currently scaffolded, not enforced)
- [ ] **Core Web Vitals monitoring** — RUM data via `web-vitals` library + analytics
- [ ] **Bundle analysis** — `@next/bundle-analyzer` CI job, set size budgets
- [ ] **Image optimization audit** — Verify all images use next/image, proper formats, lazy loading

### 🔐 Security & Recovery
- [ ] **Server password rotation** — Change root password on 19.16.1.100 (old password burned)
- [ ] **Hostinger API key rotation** — Revoke old key, update env
- [ ] **Backup restore drill** — Verify pg_restore works from latest backup
- [ ] **Dependabot remediation** — Address 23 moderate vulns (Sentry v10 evaluation)

### 📝 Documentation
- [ ] **Sync all playbook docs** — Verify architecture, deployment, API docs match reality
- [ ] **Runbook creation** — Deploy, rollback, restore, incident response procedures

## 3. SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| Alert response time | <15 min for P1 |
| Lighthouse scores | >95 all categories |
| Backup restore | Fully automated <30 min |
| Grafana dashboards | 3 panels minimum |
| Documentation | 100% synced with deployment |

## 4. DEPENDENCIES

- SSH access to 19.16.1.100 with GitHub SSH key
- Hostinger dashboard access for API key rotation
- Cloudflare API token for DNS verification

---

*"Visibility is the foundation of reliability."*
