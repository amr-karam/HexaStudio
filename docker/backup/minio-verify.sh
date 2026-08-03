#!/bin/sh
# =============================================================================
# minio-verify.sh
# Verifies that the MinIO asset-bucket mirrors exist in the backup volume.
# Asserts <BACKUP_DIR>/minio/<bucket>/ is a non-empty directory for every asset
# bucket (uploads, models, textures, videos, hdr).
#
# Usage:
#   docker compose -f docker-compose.prod.yml --profile verify-minio run --rm minio-backup-verify
#   OR: sh docker/backup/minio-verify.sh
#
# Exit codes:
#   0  All asset-bucket mirrors are present and non-empty
#   1  One or more mirrors are missing or empty
# =============================================================================
set -e

BACKUP_DIR="${BACKUP_DIR:-/backups}"
ASSET_BUCKETS="uploads models textures videos hdr"
ERRORS=0

echo "============================================"
echo "[minio-verify] Starting MinIO mirror verification"
echo "[minio-verify] Backup directory: ${BACKUP_DIR}"
echo "============================================"

# --- 1. Check backup directory exists ---
if [ ! -d "${BACKUP_DIR}" ]; then
  echo "[FAIL] Backup directory ${BACKUP_DIR} does not exist."
  exit 1
fi

# --- 2. Check each asset bucket has a non-empty local mirror ---
for bucket in ${ASSET_BUCKETS}; do
  MIRROR_DIR="${BACKUP_DIR}/minio/${bucket}"
  if [ ! -d "${MIRROR_DIR}" ]; then
    echo "[FAIL] Mirror directory ${MIRROR_DIR} does not exist — minio-backup has not mirrored this bucket yet"
    ERRORS=$((ERRORS + 1))
  elif [ -z "$(ls -A "${MIRROR_DIR}" 2>/dev/null)" ]; then
    echo "[FAIL] Mirror directory ${MIRROR_DIR} is empty — no objects mirrored"
    ERRORS=$((ERRORS + 1))
  else
    FILE_COUNT=$(find "${MIRROR_DIR}" -type f | wc -l | tr -d ' ')
    TOTAL_SIZE=$(du -sh "${MIRROR_DIR}" | cut -f1)
    echo "[PASS] ${bucket} — ${FILE_COUNT} file(s), total size: ${TOTAL_SIZE}"
  fi
done

# --- 3. Summary ---
echo ""
echo "============================================"
if [ "${ERRORS}" -eq 0 ]; then
  echo "[minio-verify] All MinIO asset mirrors are VALID."
  echo "============================================"
  exit 0
else
  echo "[minio-verify] ${ERRORS} verification error(s) detected."
  echo "============================================"
  exit 1
fi
