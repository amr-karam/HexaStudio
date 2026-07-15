#!/bin/sh
set -e

BACKUP_DIR="${BACKUP_DIR:-/backups}"
PG_HOST="${POSTGRES_HOST:-postgres}"
PG_USER="${POSTGRES_USER:-hexastudio}"
PG_PASS="${POSTGRES_PASSWORD}"
MINIO_ENDPOINT="${MINIO_ENDPOINT:-minio:9000}"
MINIO_AK="${MINIO_ACCESS_KEY:-hexastudio}"
MINIO_SK="${MINIO_SECRET_KEY}"
MINIO_BUCKET="${MINIO_BUCKET:-backups}"

# Real application databases (POSTGRES_DB is just the default, not an app DB)
DBS="hexastudio_api hexastudio_cms hexastudio_odoo"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# ---------------------------------------------------------------------------
# Ensure 'mc' (MinIO client) is available for authenticated offsite upload.
# The postgres image does not ship it; download the static binary once.
# ---------------------------------------------------------------------------
if ! command -v mc >/dev/null 2>&1; then
  echo "[$(date)] Downloading minio-client..."
  wget -q https://dl.min.io/client/mc/release/linux-amd64/mc -O /usr/local/bin/mc && chmod +x /usr/local/bin/mc \
    || echo "[$(date)] WARN: could not download minio-client"
fi
if command -v mc >/dev/null 2>&1 && [ -n "${MINIO_SK}" ]; then
  mc alias set hexabackup "http://${MINIO_ENDPOINT}" "${MINIO_AK}" "${MINIO_SK}" >/dev/null 2>&1 || true
  mc mb --ignore-existing "hexabackup/${MINIO_BUCKET}" >/dev/null 2>&1 || true
fi

while true; do
  echo "[$(date)] Starting backup cycle..."

  mkdir -p "${BACKUP_DIR}"

  for db in ${DBS}; do
    out="${BACKUP_DIR}/${db}_${TIMESTAMP}.dump"
    echo "[$(date)] Dumping ${db}..."
    PGPASSWORD="${PG_PASS}" pg_dump -h "${PG_HOST}" -U "${PG_USER}" -d "${db}" -Fc -f "${out}"
    if [ ! -s "${out}" ]; then
      echo "[$(date)] WARNING: ${db} dump is empty, removing."
      rm -f "${out}"
    fi
  done

  echo "[$(date)] Pruning backups older than 30 days..."
  find "${BACKUP_DIR}" -name "*.dump" -mtime +30 -delete

  if command -v mc >/dev/null 2>&1 && [ -n "${MINIO_SK}" ]; then
    for f in "${BACKUP_DIR}"/*"${TIMESTAMP}".dump; do
      [ -f "$f" ] || continue
      filename=$(basename "$f")
      echo "[$(date)] Uploading ${filename} to MinIO..."
      mc cp "$f" "hexabackup/${MINIO_BUCKET}/${filename}" || echo "[$(date)] MinIO upload failed for ${filename}"
    done
  fi

  echo "[$(date)] Backup cycle complete. Sleeping 24h..."
  sleep 86400
done
