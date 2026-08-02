# Backup & Restore Procedures

**Last Updated:** 2026-07-08

---

## Backup Schedule

| Data | Frequency | Retention | Type | Location |
|------|-----------|-----------|------|----------|
| PostgreSQL (all DBs) | Every 6 hours | 30 days | pg_dump (full) | Local + S3 |
| PostgreSQL (WAL) | Continuous | 7 days | WAL archiving | Local |
| MinIO buckets | Daily | 7 days | mc mirror | Local + S3 |
| Docker volumes (config) | Per deploy | 10 versions | Git | GitHub |
| SSL certificates | Auto-renewal | — | Traefik ACME | Docker volume |
| Environment config | Per change | 10 versions | Encrypted | Password manager |

## Database Backup Script

```bash
#!/bin/bash
# scripts/backup-db.sh
set -euo pipefail

BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
S3_BUCKET="s3://hexa-backups/postgres"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"

mkdir -p "$BACKUP_DIR"

# Backup each database
for DB in hexa_frontend hexa_cms hexa_odoo; do
  echo "Backing up $DB..."

  docker exec postgres pg_dump \
    -U hexa \
    --format=custom \
    --compress=9 \
    --file="/tmp/${DB}_${TIMESTAMP}.dump" \
    "$DB"

  # Encrypt
  gpg --symmetric --batch --passphrase "$ENCRYPTION_KEY" \
    --output "${BACKUP_DIR}/${DB}_${TIMESTAMP}.dump.gpg" \
    "/tmp/${DB}_${TIMESTAMP}.dump"

  rm "/tmp/${DB}_${TIMESTAMP}.dump"
done

# Upload to S3
rclone copy "$BACKUP_DIR" "$S3_BUCKET/$TIMESTAMP" --progress

# Clean old backups
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup complete: $TIMESTAMP"
```

## MinIO Backup Script

```bash
#!/bin/bash
# scripts/backup-minio.sh
set -euo pipefail

BACKUP_DIR="/backups/minio"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

# Mirror MinIO to local
docker exec minio mc mirror \
  --overwrite \
  local/hexa-studio \
  "/backups/minio/$TIMESTAMP"

# Upload to S3
rclone copy "$BACKUP_DIR/$TIMESTAMP" "s3://hexa-backups/minio/$TIMESTAMP"

# Clean old backups
find "$BACKUP_DIR" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;

echo "MinIO backup complete: $TIMESTAMP"
```

## Restore Procedures

### Restore PostgreSQL Database

```bash
#!/bin/bash
# scripts/restore-db.sh
set -euo pipefail

DB="${1:?Database name required}"
BACKUP_FILE="${2:?Backup file required}"

# Decrypt
gpg --decrypt --batch --passphrase "$BACKUP_ENCRYPTION_KEY" \
  --output "/tmp/restore.dump" \
  "$BACKUP_FILE"

# Restore
docker exec -i postgres pg_restore \
  -U hexa \
  -d "$DB" \
  --clean \
  --if-exists \
  "/tmp/restore.dump"

rm "/tmp/restore.dump"
echo "Database $DB restored from $BACKUP_FILE"
```

### Restore MinIO Data

```bash
#!/bin/bash
# scripts/restore-minio.sh
set -euo pipefail

BACKUP_PATH="${1:?Backup path required}"

# Restore from backup
docker exec minio mc mirror \
  --overwrite \
  "/backups/minio/$BACKUP_PATH" \
  local/hexa-studio

echo "MinIO restored from $BACKUP_PATH"
```

## Verification

| Test | Frequency | Action |
|------|-----------|--------|
| Backup integrity | Daily | Verify backup files exist and non-empty |
| Database restore test | Weekly | Restore to test environment |
| Full DR drill | Monthly | Simulate complete recovery from backups |
| Encryption verification | Weekly | Decrypt a backup file successfully |

## Recovery Time Objectives

| Scenario | RTO | RPO |
|----------|-----|-----|
| Database corruption | < 1 hour | < 15 min |
| MinIO data loss | < 2 hours | < 1 day |
| Full server failure | < 4 hours | < 1 hour |
| Accidental deletion | < 1 hour | < 6 hours |
