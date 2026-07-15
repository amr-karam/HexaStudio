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

  if [ -n "${MINIO_SK}" ] && command -v curl >/dev/null 2>&1; then
    for f in "${BACKUP_DIR}"/*"${TIMESTAMP}".dump; do
      [ -f "$f" ] || continue
      filename=$(basename "$f")
      echo "[$(date)] Uploading ${filename} to MinIO..."
      curl -s -X PUT "http://${MINIO_ENDPOINT}/${MINIO_BUCKET}/${filename}" \
        -H "Host: ${MINIO_ENDPOINT}" \
        --upload-file "$f" || echo "[$(date)] MinIO upload failed for ${filename}"
    done
  fi

  echo "[$(date)] Backup cycle complete. Sleeping 24h..."
  sleep 86400
done
