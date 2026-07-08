# Incident Response Runbook

**Last Updated:** 2026-07-08

---

## Severity Levels

| Level | Definition | Response Time | Example |
|-------|-----------|---------------|---------|
| **SEV-1** | Critical — Platform is down or data is at risk | 15 min | Site unreachable, database corruption |
| **SEV-2** | High — Major feature broken, users impacted | 1 hour | 3D viewer broken, login failures |
| **SEV-3** | Medium — Issue affecting some users | 4 hours | Styling bug on one page, slow query |
| **SEV-4** | Low — Minor issue, workaround exists | Next sprint | Cosmetic bug, minor typo |

---

## Incident Lifecycle

```
Detection → Triage → Containment → Resolution → Post-Mortem
    │          │           │            │            │
    ▼          ▼           ▼            ▼            ▼
  Alert    Assess     Isolate      Fix root      Document
  comes    severity   affected     cause &       root cause
  in                  system       verify        & prevent
```

---

## Detection

### Automated Detection
- Prometheus alerts (error rate, latency, service down)
- Uptime Kuma (service availability)
- Sentry (error rate spikes)
- Custom health check failures

### Manual Detection
- User reports via contact form, email, or chat
- Team member notices issue during normal work
- Social media monitoring

## Triage

### Initial Assessment (within 5 minutes)

1. Is the issue ongoing? Check monitoring
2. What is the severity? (SEV-1 to SEV-4)
3. Who needs to be notified?
4. Create incident ticket

### SEV-1 Triage

```bash
# 1. Announce in #ops-alerts Slack channel
"INCIDENT: SEV-1 - [brief description]"

# 2. Check monitoring dashboards
# - Grafana: system overview
# - Sentry: error feed
# - Uptime Kuma: service status

# 3. Check service health
curl https://hexastudio.net/api/health
docker compose ps

# 4. Check recent deploys
git log --oneline -5

# 5. Check logs
docker compose logs --tail=100 <service>
```

## Containment

### Service Restart

```bash
# Restart a single service
docker compose restart <service>

# Full stack restart
docker compose restart

# Check logs after restart
docker compose logs --tail=50 <service>
```

### Rollback

```bash
# Rollback to previous version
docker compose up -d <service>:<previous-tag>

# Full rollback
git checkout <previous-tag>
docker compose up -d
```

### Traffic Isolation

```bash
# Rate limit a service (via Traefik middleware)
# Enable maintenance mode
# Redirect to static maintenance page
```

## Resolution

### Steps

1. Identify root cause
2. Implement fix
3. Verify fix in staging (if possible)
4. Deploy to production
5. Verify health checks pass
6. Monitor for 30 minutes after fix

### Communication

- Update incident status every 30 minutes for SEV-1
- Post updates in #ops-alerts and #general
- Update status.hexastudio.net if public-facing
- Notify affected users when resolved

## Post-Mortem

### Schedule

- SEV-1: Post-mortem within 24 hours
- SEV-2: Post-mortem within 1 week
- SEV-3/4: Document in sprint retrospective

### Template

```markdown
# Post-Mortem: [Title]

**Incident ID:** INC-YYYYMMDD-NN
**Date:** YYYY-MM-DD
**Severity:** SEV-1
**Duration:** 45 minutes (14:00 - 14:45 UTC)

## Summary
Brief description of the incident and impact.

## Timeline
- 14:00 — Alert: Error rate spike > 5%
- 14:02 — Triage: Database connection pool exhausted
- 14:05 — Containment: Restarted backend service
- 14:25 — Root cause identified: Slow query
- 14:35 — Fix deployed: Added missing index
- 14:45 — Verified: Error rate returned to normal

## Root Cause
...

## Action Items
- [ ] Add database index on `contacts.created_at`
- [ ] Add connection pool monitoring alert
- [ ] Add slow query threshold alert
```

## Communication Template

### Slack Message

```
🚨 INCIDENT: SEV-{level} - {title}

🕐 Time: {time}
📊 Impact: {what's affected}
🔍 Status: {investigating/mitigating/resolved}
👤 Lead: @name

Updates to follow in this thread.
```

### Status Page Update

```
[INVESTIGATING] We are aware of an issue affecting {service}.
Updates will be posted here.

[RESOLVED] The issue has been resolved. All services are operational.
```
