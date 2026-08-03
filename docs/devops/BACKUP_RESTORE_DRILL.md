# Backup Restore Drill Procedure

## Overview

Monthly drill to verify backup integrity and recovery capability against the **current**
implementation (`docker/backup/backup.sh` sleep-loop + `docker/backup/verify-backup.sh`).
**RTO: < 1 hour, RPO: 24 hours** (daily dump loop).

## Drill Schedule

- **Frequency**: Monthly (first Monday of month, 02:00 UTC)
- **Duration**: ~45 minutes
- **Owner**: DevOps Lead
- **Reviewer**: Backend Lead

## Pre-Drill Checklist

- [ ] Schedule in team calendar
- [ ] Notify team via `#deployments` Slack
- [ ] Confirm `backup` service is running: `docker compose -f docker-compose.prod.yml ps backup`
- [ ] Run the manual verification (see below) to confirm dumps are intact
- [ ] Note current production DB sizes: `docker compose exec postgres psql -U hexastudio -d hexastudio_api -c "\l+"`
- [ ] Confirm the internal MinIO `backups` bucket is reachable

## Verification (run first)

```bash
docker compose -f docker-compose.prod.yml --profile verify run --rm backup-verify
```

Exit `0` = the latest `hexastudio_api` and `hexastudio_cms` dumps pass `pg_restore --list`
and are within the 25h age window. Exit `1` = missing or corrupt dump — **do not proceed**
with the restore drill until this is resolved.

## Drill Types

### Type A: PostgreSQL Restore (Monthly)

**Objective:** Restore `hexastudio_api` from the latest dump into a throwaway database
and confirm data integrity.

#### Steps

```bash
# 1. Identify the latest dump
docker run --rm -v hexastudio_backup_data:/backups postgres:16-alpine ls -lt /backups/hexastudio_api_*.dump

# 2. Create a throwaway test database
docker compose exec -T postgres psql -U "${POSTGRES_USER:-hexastudio}" -c "DROP DATABASE IF EXISTS hexastudio_drill_verify;"
docker compose exec -T postgres psql -U "${POSTGRES_USER:-hexastudio}" -c "CREATE DATABASE hexastudio_drill_verify;"

# 3. Restore into it
docker run --rm \
  --network hexastudio_internal \
  -v hexastudio_backup_data:/backups:ro \
  -e PGPASSWORD="${POSTGRES_PASSWORD}" \
  postgres:16-alpine \
  pg_restore -h postgres -U "${POSTGRES_USER:-hexastudio}" \
    -d hexastudio_drill_verify \
    --no-owner --no-privileges \
    /backups/hexastudio_api_<YYYYmmdd-HHMMSS>.dump

# 4. Verify row counts against a known table
docker compose exec -T postgres psql -U "${POSTGRES_USER:-hexastudio}" -d hexastudio_drill_verify -c "
  SELECT count(*) AS projects FROM projects;
  SELECT count(*) AS users FROM users;
  SELECT max(created_at) AS latest_project FROM projects;
"

# 5. Cleanup
docker compose exec -T postgres psql -U "${POSTGRES_USER:-hexastudio}" -c "DROP DATABASE hexastudio_drill_verify;"
```

> Replace `projects`/`users` with tables that actually exist in `hexastudio_api`
> (adjust to the current schema if these names differ).

**Success Criteria:**

- [ ] Restore completes without errors
- [ ] Row counts match production (±1%)
- [ ] Latest data timestamp within RPO (24 hours)
- [ ] Restore time < 30 minutes

### Type B: Offsite Download Drill (Monthly)

**Objective:** Prove the MinIO `backups` bucket copy is downloadable and readable.

> There is **no** MinIO object-store mirror job, so this drill validates the offsite
> **DB dump** copy instead of an `mc mirror` of buckets.

#### Steps

```bash
# 1. List dumps in MinIO
docker run --rm \
  --network hexastudio_internal \
  -e MINIO_ROOT_USER="${MINIO_ROOT_USER:-hexastudio}" \
  -e MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD}" \
  minio/mc:latest \
  sh -c 'mc alias set hexabackup http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" && mc ls hexabackup/backups/ | sort -k5,6 | tail -5'

# 2. Download the latest dump to the local backup volume
docker run --rm \
  --network hexastudio_internal \
  -v hexastudio_backup_data:/out \
  -e MINIO_ROOT_USER="${MINIO_ROOT_USER:-hexastudio}" \
  -e MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD}" \
  minio/mc:latest \
  sh -c 'mc alias set hexabackup http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" && mc cp "hexabackup/backups/hexastudio_api_<YYYYmmdd-HHMMSS>.dump" /out/'

# 3. Verify integrity with pg_restore --list
docker run --rm -v hexastudio_backup_data:/backups:ro postgres:16-alpine \
  pg_restore --list /backups/hexastudio_api_<YYYYmmdd-HHMMSS>.dump | head -20

# 4. Cleanup the downloaded copy
docker run --rm -v hexastudio_backup_data:/backups postgres:16-alpine \
  sh -c 'rm -f /backups/hexastudio_api_<YYYYmmdd-HHMMSS>.dump'
```

**Success Criteria:**

- [ ] Latest dump downloadable from MinIO
- [ ] `pg_restore --list` succeeds on the downloaded file
- [ ] File size matches the local copy
- [ ] Download + verify time < 15 minutes

### Type C: Full Stack Recovery (Quarterly)

**Objective:** Simulate complete server failure and recovery.

#### Prerequisites

- Staging server with same specs as production
- DNS access to point test domain
- Access to the `backup_data` volume or MinIO `backups` bucket

#### Steps

```bash
# 1. Provision test server (or use staging)
# 2. Deploy infrastructure
git clone git@gitlab.hexastudio.net:hexa/hexa-studio.git /opt/hexa-test
cd /opt/hexa-test
cp .env.example .env   # fill real secrets from the password manager

# 3. Restore databases from the latest dumps (one per DB)
docker run --rm \
  --network hexastudio_internal \
  -v hexastudio_backup_data:/backups:ro \
  -e PGPASSWORD="${POSTGRES_PASSWORD}" \
  postgres:16-alpine \
  pg_restore -h postgres -U hexastudio -d hexastudio_api \
    --clean --if-exists --no-owner --no-privileges \
    /backups/hexastudio_api_<YYYYmmdd-HHMMSS>.dump
# ... repeat for hexastudio_cms, hexastudio_odoo, hexastudio_db

# 4. Start services
docker compose -f docker-compose.prod.yml up -d

# 5. Wait for health checks
timeout 300 bash -c 'until curl -sf https://test.hexastudio.net/api/health; do sleep 5; done'

# 6. Run smoke tests
npm run test:e2e -- --config=e2e/playwright.smoke.config.ts

# 7. Verify data
curl https://test.hexastudio.net/api/projects | jq '.data | length'
curl https://test.hexastudio.net/api/health

# 8. Cleanup
docker compose -f docker-compose.prod.yml down -v
```

**Success Criteria:**

- [ ] Full stack operational in < 1 hour
- [ ] All health checks pass
- [ ] E2E smoke tests pass
- [ ] Data integrity verified

## Drill Report Template

```markdown
# Backup Restore Drill Report - YYYY-MM-DD

## Drill Type: A / B / C
## Start Time: HH:MM UTC
## End Time: HH:MM UTC
## Duration: XX minutes

## Participants
- DevOps Lead: @name
- Backend Lead: @name
- Observer: @name

## Results

### PostgreSQL Restore
- Backup file: `hexastudio_api_YYYYmmdd-HHMMSS.dump`
- Restore time: XX minutes
- Row count match: ✅/❌ (Prod: X, Restored: Y)
- Data freshness: XX hours old (RPO: 24h)
- Errors: None / List errors

### Offsite Download (MinIO backups bucket)
- Backup file: `hexastudio_api_YYYYmmdd-HHMMSS.dump`
- Download + verify time: XX minutes
- `pg_restore --list`: ✅/❌

### Full Stack (if Type C)
- Provision time: XX minutes
- Deploy time: XX minutes
- Health checks: ✅/❌
- E2E tests: X passed, Y failed

## Issues Found
| Issue | Severity | Action Item | Owner |
|-------|----------|-------------|-------|
| Backup file 10% larger than expected | Low | Investigate compression | @devops |
| Restore took 45min (target 30) | Medium | Optimize pg_restore parallel jobs | @backend |

## Action Items
- [ ] Fix backup size anomaly
- [ ] Increase pg_restore parallel jobs to 4
- [ ] Update this runbook with new timings

## Sign-off
DevOps Lead: _________________ Date: _______
Backend Lead: _________________ Date: _______
```

## Automation

### Scheduled daily verification (no manual intervention)

```bash
docker compose -f docker-compose.prod.yml --profile scheduled up -d backup-verify-scheduled
```

`backup-verify-scheduled` runs `verify-backup.sh` every 24 hours and stays alive. Check results:

```bash
docker compose -f docker-compose.prod.yml logs --tail=50 backup-verify-scheduled
```

> There is no cloud (GitHub Actions) verification job because the dumps live on the
> production server / internal MinIO, not in S3. The scheduled container is the
> verification mechanism. Recommended follow-up: a Loki alert on the
> `[verify-loop] Verification FAILED` log line.

## Emergency Contacts

- **DevOps Lead**: @devops-lead (Slack/Phone)
- **Backend Lead**: @backend-lead (Slack/Phone)
- **Hetzner Support**: 24/7

## Related Documents

- `BACKUP.md` - Backup procedures
- `DISASTER_RECOVERY.md` - Full DR plan
- `INFRASTRUCTURE.md` - Server specs
- `DEPLOYMENT.md` - Deployment process
