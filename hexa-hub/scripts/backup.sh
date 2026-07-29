#!/bin/bash
# ─── HEXA Hub — Database & Storage Backup Script ───────────────────────────
# Creates timestamped backups of PostgreSQL, MinIO objects, and Redis data.
# Designed to run as a cron job in production (recommended: daily at 2 AM).
#
# Usage:
#   chmod +x scripts/backup.sh
#   ./scripts/backup.sh                           # local backup
#   ./scripts/backup.sh --remote s3://hexa-backups # upload to S3-compatible
#
# Retention: keeps last 7 daily backups locally (configurable via RETENTION_DAYS)
# ───────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_ROOT="${BACKUP_ROOT:-/backups}"
BACKUP_DIR="${BACKUP_ROOT}/${TIMESTAMP}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
REMOTE_TARGET="${1:-}"

# Docker container names
PG_CONTAINER="${PG_CONTAINER:-hub-postgres}"
REDIS_CONTAINER="${REDIS_CONTAINER:-hub-redis}"
MINIO_CONTAINER="${MINIO_CONTAINER:-hub-minio}"

# PostgreSQL config
PG_USER="${PG_USER:-hub_user}"
PG_DB="${PG_DB:-hub_db}"
PG_HOST="${PG_HOST:-localhost}"
PG_PORT="${PG_PORT:-5432}"

# Redis config
REDIS_DIR="${REDIS_DIR:-/data}"

# MinIO config (aliases must be pre-configured via `mc alias set`)
MINIO_ALIAS="${MINIO_ALIAS:-hub-minio}"

# Webhook URL for failure notifications (optional)
NOTIFY_WEBHOOK="${NOTIFY_WEBHOOK:-}"

# ── Functions ─────────────────────────────────────────────────────────────

log_info() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]  $*"
}

log_error() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*" >&2
}

notify_failure() {
  local message="$1"
  log_error "$message"
  if [ -n "$NOTIFY_WEBHOOK" ]; then
    curl -s -X POST "$NOTIFY_WEBHOOK" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"HEXA Hub backup failed: $message\",\"timestamp\":\"$TIMESTAMP\"}" \
      > /dev/null 2>&1 || true
  fi
}

cleanup_old_backups() {
  log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."
  find "$BACKUP_ROOT" -maxdepth 1 -type d -mtime "+${RETENTION_DAYS}" \
    -exec rm -rf {} \; 2>/dev/null || true
  log_info "Cleanup complete."
}

# ── Main Backup Process ───────────────────────────────────────────────────

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "HEXA Hub Backup — Started at $TIMESTAMP"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

mkdir -p "$BACKUP_DIR"

# ── 1. PostgreSQL Dump ────────────────────────────────────────────────────

log_info "[1/3] Backing up PostgreSQL database '$PG_DB'..."

if docker exec "$PG_CONTAINER" pg_isready -U "$PG_USER" -d "$PG_DB" > /dev/null 2>&1; then
  docker exec "$PG_CONTAINER" pg_dump \
    -U "$PG_USER" \
    -d "$PG_DB" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    > "$BACKUP_DIR/db.sql" 2>&1

  if [ $? -eq 0 ]; then
    # Compress the dump
    gzip -9 "$BACKUP_DIR/db.sql"
    db_size=$(du -h "$BACKUP_DIR/db.sql.gz" | cut -f1)
    log_info "  PostgreSQL dump complete (${db_size})."
  else
    notify_failure "PostgreSQL dump failed. See $BACKUP_DIR/db.sql for details."
    exit 1
  fi
else
  notify_failure "PostgreSQL container '$PG_CONTAINER' is not healthy."
  exit 1
fi

# ── 2. MinIO Object Storage Sync ──────────────────────────────────────────

log_info "[2/3] Syncing MinIO buckets..."

# Check if mc (MinIO Client) is available inside the container
if docker exec "$MINIO_CONTAINER" which mc > /dev/null 2>&1; then
  MINIO_BACKUP_DIR="$BACKUP_DIR/minio"
  mkdir -p "$MINIO_BACKUP_DIR"

  # List all buckets and sync each
  buckets=$(docker exec "$MINIO_CONTAINER" mc ls "$MINIO_ALIAS" 2>/dev/null | awk '{print $NF}')

  if [ -z "$buckets" ]; then
    log_info "  No MinIO buckets found — skipping."
  else
    for bucket in $buckets; do
      bucket=${bucket%/}
      log_info "  Syncing bucket: $bucket"
      docker exec "$MINIO_CONTAINER" mc mirror \
        "$MINIO_ALIAS/$bucket" \
        "/tmp/minio-backup/$bucket" \
        --overwrite \
        > /dev/null 2>&1

      # Copy from container to host backup dir
      docker cp "$MINIO_CONTAINER:/tmp/minio-backup/$bucket" "$MINIO_BACKUP_DIR/$bucket" \
        > /dev/null 2>&1
    done

    # Clean up temp files in container
    docker exec "$MINIO_CONTAINER" rm -rf /tmp/minio-backup > /dev/null 2>&1

    minio_size=$(du -sh "$MINIO_BACKUP_DIR" | cut -f1)
    log_info "  MinIO sync complete (${minio_size})."
  fi
else
  log_info "  MinIO Client (mc) not found in container — skipping MinIO backup."
fi

# ── 3. Redis Snapshot ────────────────────────────────────────────────────

log_info "[3/3] Saving Redis snapshot..."

if docker exec "$REDIS_CONTAINER" redis-cli ping > /dev/null 2>&1; then
  # Trigger BGSAVE to persist to disk
  docker exec "$REDIS_CONTAINER" redis-cli BGSAVE > /dev/null 2>&1

  # Wait for BGSAVE to complete
  sleep 3

  # Copy RDB file from container
  rdb_file=$(docker exec "$REDIS_CONTAINER" redis-cli CONFIG GET dir | tail -1)/dump.rdb
  docker cp "$REDIS_CONTAINER:$rdb_file" "$BACKUP_DIR/redis-dump.rdb" > /dev/null 2>&1

  if [ -f "$BACKUP_DIR/redis-dump.rdb" ]; then
    redis_size=$(du -h "$BACKUP_DIR/redis-dump.rdb" | cut -f1)
    log_info "  Redis snapshot saved (${redis_size})."
  else
    log_info "  Redis snapshot file not found — skipping (may use AOF only)."
  fi
else
  log_info "  Redis container '$REDIS_CONTAINER' not reachable — skipping."
fi

# ── 4. Create Backup Manifest ─────────────────────────────────────────────

cat > "$BACKUP_DIR/manifest.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "backup_date": "$(date -Iseconds)",
  "components": {
    "postgresql": true,
    "minio": $( [ -d "$BACKUP_DIR/minio" ] && echo "true" || echo "false" ),
    "redis": $( [ -f "$BACKUP_DIR/redis-dump.rdb" ] && echo "true" || echo "false" )
  },
  "version": "1.0.0"
}
EOF

log_info "Backup manifest created."

# ── 5. Remote Upload (Optional) ───────────────────────────────────────────

if [ -n "$REMOTE_TARGET" ]; then
  log_info "Uploading backup to remote: $REMOTE_TARGET"

  if [[ "$REMOTE_TARGET" == s3://* ]]; then
    # S3-compatible upload via MinIO Client
    docker exec "$MINIO_CONTAINER" mc cp \
      --recursive \
      "$BACKUP_DIR" \
      "$REMOTE_TARGET/$TIMESTAMP/" \
      > /dev/null 2>&1 \
      && log_info "Remote upload complete." \
      || notify_failure "Remote upload to $REMOTE_TARGET failed."
  else
    # rsync to remote path
    rsync -avz --progress "$BACKUP_DIR/" "$REMOTE_TARGET/$TIMESTAMP/" \
      > /dev/null 2>&1 \
      && log_info "Remote upload complete." \
      || notify_failure "Remote upload to $REMOTE_TARGET failed."
  fi
fi

# ── 6. Cleanup ────────────────────────────────────────────────────────────

cleanup_old_backups

# ── Summary ───────────────────────────────────────────────────────────────

total_size=$(du -sh "$BACKUP_DIR" | cut -f1)

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "Backup complete: $BACKUP_DIR (${total_size})"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
