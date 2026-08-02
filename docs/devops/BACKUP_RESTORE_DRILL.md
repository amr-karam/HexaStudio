# Backup Restore Drill Procedure

## Overview
Monthly drill to verify backup integrity and recovery capability. RTO: <1 hour, RPO: <15 minutes.

## Drill Schedule
- **Frequency**: Monthly (first Monday of month, 02:00 UTC)
- **Duration**: ~45 minutes
- **Owner**: DevOps Lead
- **Reviewer**: Backend Lead

## Pre-Drill Checklist

- [ ] Schedule in team calendar
- [ ] Notify team via `#deployments` Slack
- [ ] Verify backup storage accessible (S3 + local)
- [ ] Confirm test environment available (staging server)
- [ ] Document current production state (DB size, MinIO usage)

## Drill Types

### Type A: PostgreSQL Point-in-Time Recovery (Monthly)
**Objective**: Restore `hexa_frontend` database to specific timestamp

#### Steps
```bash
# 1. Identify backup to restore
aws s3 ls s3://hexa-backups/postgres/ --recursive | grep hexa_frontend | tail -5

# 2. Download latest backup
BACKUP_FILE="hexa_frontend_20260701_020000.dump.gpg"
aws s3 cp s3://hexa-backups/postgres/$BACKUP_FILE /tmp/

# 3. Decrypt
gpg --decrypt --batch --passphrase "$BACKUP_ENCRYPTION_KEY" \
  --output /tmp/hexa_frontend.dump \
  /tmp/$BACKUP_FILE

# 4. Create test database
docker exec postgres psql -U hexastudio -c "CREATE DATABASE hexa_frontend_restore;"

# 5. Restore
docker exec -i postgres pg_restore \
  -U hexastudio \
  -d hexa_frontend_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  /tmp/hexa_frontend.dump

# 6. Verify data integrity
docker exec postgres psql -U hexastudio -d hexa_frontend_restore -c "
  SELECT count(*) as projects FROM projects;
  SELECT count(*) as users FROM users;
  SELECT max(created_at) as latest_project FROM projects;
"

# 7. Cleanup
docker exec postgres psql -U hexastudio -c "DROP DATABASE hexa_frontend_restore;"
rm /tmp/hexa_frontend.dump /tmp/$BACKUP_FILE
```

**Success Criteria**:
- [ ] Restore completes without errors
- [ ] Row counts match production (±1%)
- [ ] Latest data timestamp within RPO (15 min)
- [ ] Restore time < 30 minutes

### Type B: MinIO Data Restore (Monthly)
**Objective**: Restore MinIO bucket to verify asset recovery

#### Steps
```bash
# 1. Identify backup
aws s3 ls s3://hexa-backups/minio/ --recursive | tail -3

# 2. Restore to test bucket
BACKUP_PATH="minio/20260701_020000"
docker exec minio mc mirror --overwrite \
  s3/hexa-backups/$BACKUP_PATH \
  local/hexa-studio-test

# 3. Verify asset count and integrity
docker exec minio mc stat local/hexa-studio-test/projects/hero-image.webp
docker exec minio mc stat local/hexa-studio-test/projects/model.glb

# 4. Compare object counts
PROD_COUNT=$(docker exec minio mc ls local/hexa-studio --recursive | wc -l)
TEST_COUNT=$(docker exec minio mc ls local/hexa-studio-test --recursive | wc -l)
echo "Prod: $PROD_COUNT, Test: $TEST_COUNT"

# 5. Cleanup
docker exec minio mc rm --recursive --force local/hexa-studio-test
```

**Success Criteria**:
- [ ] Object counts match (±1%)
- [ ] Sample assets accessible and valid
- [ ] Restore time < 15 minutes

### Type C: Full Stack Recovery (Quarterly)
**Objective**: Simulate complete server failure and recovery

#### Prerequisites
- Staging server with same specs as production
- DNS access to point test domain
- All backup files accessible

#### Steps
```bash
# 1. Provision test server (or use staging)
# 2. Deploy infrastructure
git clone ssh://git@19.16.1.100:2222/hexa/hexa-studio.git /opt/hexa-test
cd /opt/hexa-test

# 3. Restore databases
./scripts/restore-db.sh hexa_frontend /backups/latest/hexa_frontend.dump.gpg
./scripts/restore-db.sh hexa_cms /backups/latest/hexa_cms.dump.gpg

# 3. Restore MinIO
docker exec minio mc mirror /backups/minio/latest local/hexa-studio

# 4. Configure environment
cp .env.example .env
# Update with restored passwords

# 5. Start services
docker compose -f docker-compose.prod.yml up -d

# 6. Wait for health checks
timeout 300 bash -c 'until curl -sf https://test.hexastudio.net/api/health; do sleep 5; done'

# 7. Run smoke tests
npm run test:e2e -- --config=e2e/playwright.smoke.config.ts

# 8. Verify data
curl https://test.hexastudio.net/api/projects | jq '.data | length'
curl https://test.hexastudio.net/api/health

# 9. Cleanup
docker compose -f docker-compose.prod.yml down -v
```

**Success Criteria**:
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
- Backup file: `hexa_frontend_20260701_020000.dump.gpg`
- Restore time: XX minutes
- Row count match: ✅/❌ (Prod: X, Restored: Y)
- Data freshness: XX minutes old (RPO: 15 min)
- Errors: None / List errors

### MinIO Restore
- Backup path: `minio/20260701_020000`
- Restore time: XX minutes
- Object count match: ✅/❌ (Prod: X, Restored: Y)
- Sample verification: ✅/❌

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
- [ ] Update RUNBOOK.md with new timings

## Sign-off
DevOps Lead: _________________ Date: _______
Backend Lead: _________________ Date: _______
```

## Automation

### GitHub Action for Automated Verification (Weekly)
```yaml
# .github/workflows/backup-verify.yml
name: Backup Verification
on:
  schedule:
    - cron: '0 3 * * 0'  # Weekly Sunday 03:00 UTC
  workflow_dispatch:

jobs:
  verify-backups:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Verify PostgreSQL backup
        run: |
          aws s3 cp s3://hexa-backups/postgres/latest.dump.gpg /tmp/
          gpg --decrypt --batch --passphrase ${{ secrets.BACKUP_KEY }} \
            -o /tmp/test.dump /tmp/latest.dump.gpg
          # Quick schema verification
          pg_restore --list /tmp/test.dump | head -20
          
      - name: Verify MinIO backup
        run: |
          aws s3 ls s3://hexa-backups/minio/ --recursive | tail -1
          
      - name: Report status
        if: always()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -d "{\"text\":\"Backup verification ${{ job.status }}\"}"
```

## Emergency Contacts
- **DevOps Lead**: @devops-lead (Slack/Phone)
- **Backend Lead**: @backend-lead (Slack/Phone)  
- **AWS Support**: Business tier
- **Hetzner Support**: 24/7

## Related Documents
- `BACKUP.md` - Backup procedures
- `DISASTER_RECOVERY.md` - Full DR plan
- `INFRASTRUCTURE.md` - Server specs
- `DEPLOYMENT.md` - Deployment process