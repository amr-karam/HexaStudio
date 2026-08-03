#!/bin/sh
# =============================================================================
# minio-backup.sh
# Mirrors the MinIO asset buckets (uploads, models, textures, videos, hdr) into
# the shared backup volume at <BACKUP_DIR>/minio/<bucket>/, closing the
# documented gap where 3D assets / client deliverables were never backed up.
#
# Runs as a sleep-loop service (24h cadence by default) so a failed cycle is
# retried on the next iteration and the container stays alive for monitoring —
# the same pattern as backup.sh / verify-loop.sh.
#
# Usage (production):
#   docker compose -f docker-compose.prod.yml up -d minio-backup
#
# Env:
#   MINIO_ENDPOINT    Internal MinIO endpoint (default: minio:9000)
#   MINIO_ACCESS_KEY  MinIO access key (default: hexastudio)
#   MINIO_SECRET_KEY  MinIO secret key — REQUIRED, fails fast when empty
#   BACKUP_DIR        Local backup root (default: /backups)
#   MIRROR_INTERVAL   Seconds between cycles (default: 86400 = 24h)
#
# Exit codes (startup / fail-fast failures):
#   0  Alias configured; entering mirror loop
#   1  MINIO_SECRET_KEY empty, 'mc' unavailable, or MinIO unreachable (FATAL)
# =============================================================================
set +e

MINIO_ENDPOINT="${MINIO_ENDPOINT:-minio:9000}"
MINIO_AK="${MINIO_ACCESS_KEY:-hexastudio}"
MINIO_SK="${MINIO_SECRET_KEY}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
MIRROR_INTERVAL="${MIRROR_INTERVAL:-86400}"

# Asset buckets holding 3D assets / client deliverables.
# NOTE: `backups` is intentionally excluded — DB dumps already live there and
# mirroring that bucket into itself would recursively copy the dumps.
ASSET_BUCKETS="uploads models textures videos hdr"

# ---------------------------------------------------------------------------
# Ensure 'mc' (MinIO client) is available. The postgres:16-alpine image does
# not ship it, so download the static binary once — same pattern as backup.sh.
# ---------------------------------------------------------------------------
if ! command -v mc >/dev/null 2>&1; then
  echo "[$(date)] Downloading minio-client..."
  wget -q https://dl.min.io/client/mc/release/linux-amd64/mc -O /usr/local/bin/mc && chmod +x /usr/local/bin/mc \
    || echo "[$(date)] WARN: could not download minio-client"
fi

# --- Fail fast on missing required config (like backup.sh's MINIO_SECRET_KEY) ---
if [ -z "${MINIO_SK}" ]; then
  echo "[$(date)] FATAL: MINIO_SECRET_KEY is empty — cannot authenticate to MinIO. " \
       "Set MINIO_SECRET_KEY (compose passes MINIO_ROOT_PASSWORD from the server .env). Exiting."
  exit 1
fi
if ! command -v mc >/dev/null 2>&1; then
  echo "[$(date)] FATAL: 'mc' client is not available and could not be downloaded. Exiting."
  exit 1
fi

echo "[$(date)] Setting MinIO alias 'hexalocal' -> http://${MINIO_ENDPOINT} ..."
mc alias set hexalocal "http://${MINIO_ENDPOINT}" "${MINIO_AK}" "${MINIO_SK}" >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "[$(date)] FATAL: could not reach ${MINIO_ENDPOINT} with the given credentials. Exiting."
  exit 1
fi

mkdir -p "${BACKUP_DIR}/minio"

while true; do
  echo "[$(date)] Starting MinIO asset mirror cycle (buckets: ${ASSET_BUCKETS})..."

  SUCCESS=0
  FAILED=0
  for bucket in ${ASSET_BUCKETS}; do
    dest="${BACKUP_DIR}/minio/${bucket}/"
    echo "[$(date)] Mirroring hexalocal/${bucket} -> ${dest} ..."
    # Ensure the bucket exists (idempotent; same as init-buckets.sh / backup.sh).
    mc mb --ignore-existing "hexalocal/${bucket}" >/dev/null 2>&1
    if mc mirror --quiet --overwrite "hexalocal/${bucket}" "${dest}"; then
      echo "[$(date)] OK: hexalocal/${bucket} mirrored (${dest})"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "[$(date)] FAIL: mirror failed for hexalocal/${bucket} — will retry next cycle"
      FAILED=$((FAILED + 1))
    fi
  done

  echo "[$(date)] Pruning mirrored asset copies older than 30 days..."
  find "${BACKUP_DIR}/minio" -type f -mtime +30 -delete 2>/dev/null

  echo "[$(date)] MinIO mirror cycle complete: ${SUCCESS} bucket(s) OK, ${FAILED} failed. " \
       "Sleeping ${MIRROR_INTERVAL}s..."
  sleep "${MIRROR_INTERVAL}"
done
