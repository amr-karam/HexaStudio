# Disaster Recovery Plan

**Last Updated:** 2026-07-08

---

## Recovery Objectives

| Metric | Target |
|--------|--------|
| RTO (Recovery Time Objective) | < 1 hour |
| RPO (Recovery Point Objective) | < 15 minutes |
| Maximum downtime tolerated | 4 hours |

---

## Recovery Scenarios

### Scenario 1: Application Crash

**Impact:** One or more application services are down.

**Symptoms:**
- Health check returns non-200
- Error rate spike in Sentry
- Users report errors

**Recovery Steps:**
```bash
# 1. Check service status
docker compose ps

# 2. Restart crashed service
docker compose restart <service>

# 3. Check logs for root cause
docker compose logs --tail=100 <service>

# 4. If restart doesn't work, rollback
docker compose up -d <service>:<previous-tag>
```

**RTO:** < 5 minutes

---

### Scenario 2: Server Failure

**Impact:** Entire server is unreachable.

**Recovery Steps:**
```bash
# 1. Provision new server from snapshot
# 2. Update DNS to point to new server IP
# 3. SSH into new server
# 4. Git pull latest code
# 5. Restore latest database backup
./scripts/restore.sh --latest
# 6. Start all services
docker compose -f docker-compose.prod.yml up -d
# 7. Verify health
curl https://hexastudio.net/api/health
```

**RTO:** < 30 minutes

---

### Scenario 3: Database Corruption

**Impact:** Data integrity issues, application errors related to data.

**Recovery Steps:**
```bash
# 1. Stop affected services
docker compose stop backend cms odoo

# 2. Identify backup to restore
ls -la /backups/

# 3. Restore specific database
docker exec -i postgres psql -U hexa -d hexa_frontend < /backups/20260708_120000/frontend.sql

# 4. Verify data integrity
docker exec postgres psql -U hexa -d hexa_frontend -c "SELECT count(*) FROM users;"

# 5. Restart services
docker compose start backend cms odoo
```

**RTO:** < 1 hour

---

### Scenario 4: Full Region Outage

**Impact:** Cloud provider region unavailable. DNS failover required.

**Recovery Steps:**
```bash
# 1. Activate secondary region infrastructure
# 2. Point DNS load balancer to secondary region
# 3. Restore latest cross-region backups
# 4. Start services in secondary region
# 5. Monitor traffic shift
# 6. Verify end-to-end functionality
```

**RTO:** < 4 hours

---

## Backup Verification

| Test | Frequency | Action |
|------|-----------|--------|
| Automated backup run | Every 6 hours | Verify backup files exist |
| Backup integrity check | Daily | Restore to test environment |
| Full DR drill | Monthly | Simulate complete recovery |
| RTO/RPO validation | Quarterly | Measure actual recovery time |

---

## Post-Recovery Checklist

- [ ] All services healthy
- [ ] Data integrity verified
- [ ] User data intact
- [ ] No data loss (within RPO)
- [ ] DNS propagated correctly
- [ ] SSL certificates valid
- [ ] Monitoring re-enabled
- [ ] Incident report filed
- [ ] Root cause identified
- [ ] Prevention measures implemented
