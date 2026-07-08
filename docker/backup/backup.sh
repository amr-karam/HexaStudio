#!/bin/sh
set -e

BACKUP_DIR="${BACKUP_DIR:-/backups}"
PG_HOST="${POSTGRES_HOST:-postgres}"
PG_USER="${POSTGRES_USER:-hexastudio}"
PG_PASS="${POSTGRES_PASSWORD}"
PG_DB="${POSTGRES_DB:-hexastudio}"
MINIO_ENDPOINT="${MINIO_ENDPOINT:-minio:9000}"
MINIO_AK="${MINIO_ACCESS_KEY:-hexastudio}"
MINIO_SK="${MINIO_SECRET_KEY}"
MINIO_BUCKET="${MINIO_BUCKET:-backups}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

while true; do
  echo "[$(date)] Starting backup cycle..."

  mkdir -p "${BACKUP_DIR}"

  echo "[$(date)] Dumping ${PG_DB}..."
  export PGPASSWORD="${PG_PASS}"
  pg_dump -h "${PG_HOST}" -U "${PG_USER}" -d "${PG_DB}" -Fc \
    -f "${BACKUP_DIR}/hexastudio_api_${TIMESTAMP}.dump"

  echo "[$(date)] Dumping hexastudio_cms..."
  pg_dump -h "${PG_HOST}" -U "${PG_USER}" -d hexastudio_cms -Fc \
    -f "${BACKUP_DIR}/hexastudio_cms_${TIMESTAMP}.dump"

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
