# HEXA Studio — INCIDENT RESPONSE

> **Canonical source:** This document is the canonical incident response plan for the HEXA Studio platform.
> It is the single source of truth for severity levels, the incident lifecycle, response procedures, and
> communication templates. `docs/security/SECURITY_BASELINE.md` §8 (Incident Response) links here.
>
> **Operational runbook:** For step-by-step operational procedures, see `docs/devops/incident-response.md`.
>
> **Last updated:** 2026-08-02 — content consolidated verbatim from `SECURITY_BASELINE.md` §8.

---

## 8.1 Severity Levels

| Level | Label | Definition | Response Time | Notification |
|-------|-------|-----------|---------------|-------------|
| **SEV-1** | Critical | Production down, data breach, active exploitation, data loss | 15 minutes | PagerDuty + Slack `#incidents` + Phone tree |
| **SEV-2** | High | Degraded performance, partial outage, non-critical data exposure | 1 hour | Slack `#incidents` + Email |
| **SEV-3** | Medium | Minor issue, non-critical bug, dependency vulnerability | 24 hours | GitHub/GitLab issue + Slack `#tech` |
| **SEV-4** | Low | Question, enhancement request, documentation gap | 48 hours | GitHub/GitLab issue |

## 8.2 Incident Response Lifecycle

```
DETECT ──► TRIAGE ──► CONTAIN ──► ERADICATE ──► RECOVER ──► POSTMORTEM
  │            │           │            │            │            │
  ▼            ▼           ▼            ▼            ▼            ▼
Alert      Assess      Isolate      Remove       Restore     Root cause
Sentry     severity    Rollback    Patch        Verify      doc
Prometheus Notify      Block IP     Update       Monitor     Action items
User       team        Revoke       config       health      Retro
report     Escalate    keys         Deploy       check       Follow-up
```

## 8.3 Detailed Response Procedures

### SEV-1: Production Down / Data Breach

| Step | Action | Responsible | Time |
|------|--------|-------------|------|
| 1 | **Detect**: Confirm alert from Sentry/Prometheus or user report | On-call engineer | < 5 min |
| 2 | **Assess**: Determine scope (which services, which users affected) | On-call engineer | < 5 min |
| 3 | **Notify**: Declare SEV-1 in Slack `#incidents`, notify security lead | On-call engineer | < 5 min |
| 4 | **Contain**: If security incident, rotate all affected keys/secrets immediately | Security lead | < 15 min |
| 5 | **Contain**: If deployment issue, rollback to last known-good version | DevOps | < 15 min |
| 6 | **Contain**: If DDoS/attack, enable Cloudflare "Under Attack" mode | DevOps | < 5 min |
| 7 | **Eradicate**: Apply hotfix, patch, or configuration change | Engineering | < 2 hours |
| 8 | **Recover**: Deploy fix, verify health endpoint, confirm metrics recovering | DevOps | < 30 min |
| 9 | **Monitor**: Watch error rates, latency, and user reports for 1 hour | On-call engineer | 1 hour |
| 10 | **Postmortem**: Schedule within 24 hours, write RCA, assign action items | Tech lead | < 48 hours |

### SEV-2: Degraded Performance

| Step | Action | Responsible | Time |
|------|--------|-------------|------|
| 1 | Confirm alert from Prometheus (high latency, error rate > 1%) | On-call engineer | < 10 min |
| 2 | Check Grafana dashboards for CPU/memory/connection bottlenecks | On-call engineer | < 15 min |
| 3 | Scale horizontally (increase container replicas) or vertically (increase resources) | DevOps | < 30 min |
| 4 | If database-related, check PG connection pool, slow queries | Backend engineer | < 1 hour |
| 5 | Apply optimization (query index, cache, connection pool config) | Backend engineer | < 2 hours |
| 6 | Verify recovery, update status page | On-call engineer | < 30 min |

### SEV-3: Minor Issue (e.g., dependency vulnerability)

| Step | Action | Responsible | Time |
|------|--------|-------------|------|
| 1 | File issue from Trivy/npm audit report | DevOps / Engineer | < 4 hours |
| 2 | Assess exploitability (is it reachable in our code?) | Security lead | < 24 hours |
| 3 | Apply patch (npm update, base image rebuild) | Engineer | < 1 week |
| 4 | Deploy fix in next regular release | DevOps | Next release cycle |

## 8.4 Communication Templates

**Slack `#incidents` — SEV-1 Declaration:**
```
🚨 SEV-1 INCIDENT DECLARED
Time: 2026-07-26T14:30:00Z
Service: [backend/frontend/cms]
Impact: [describe user-facing impact]
Detected by: [Sentry/Prometheus/User report]
Lead: @oncall-engineer
Status: Investigating
Slack channel: #incidents-PPP-NNN
```

**Post-Incident Review Template:**
```markdown
## PIR: [INCIDENT TITLE]
- Date: YYYY-MM-DD
- Duration: X hours Y minutes
- Severity: SEV-[1-4]
- Lead: @person

### Timeline
- HH:MM — Detected via [Sentry/Prometheus/report]
- HH:MM — Triage complete
- HH:MM — Containment action
- HH:MM — Fix deployed
- HH:MM — Verified healthy

### Root Cause
[One paragraph describing the root cause]

### Impact
- Users affected: [count]
- Downtime: [duration]
- Data loss: [none / describe]

### Action Items
- [ ] [Action] (Assignee, Due date)
- [ ] [Action] (Assignee, Due date)

### Prevention
[How will we prevent this in the future?]
```

---

> **End of INCIDENT_RESPONSE.md**