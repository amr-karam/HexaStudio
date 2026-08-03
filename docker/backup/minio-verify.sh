#!/bin/sh
# =============================================================================
# minio-verify.sh
# Verifies that the MinIO asset-bucket mirrors exist in the backup volume.
# Asserts <BACKUP_DIR>/minio/<bucket>/ is a non-empty directory for every asset
# bucket (uploads, models, textures, videos, hdr) that has content.
#
# The verifier is intentionally offline (no MinIO credentials) — it relies on
# per-bucket object counts written by minio-backup.sh into
# <BACKUP_DIR>/minio/.state/<bucket>.count. A source bucket with 0 objects is a
# valid state (nothing to mirror) and is skipped; a bucket with content MUST
# have a non-empty local mirror.
#
# Usage:
#   docker compose -f docker-compose.prod.yml --profile verify-minio run --rm minio-backup-verify
#   OR: sh docker/backup/minio-verify.sh
#
# Exit codes:
#   0  All asset-bucket mirrors are valid (or sources are empty)
#   1  One or more non-empty source buckets have a missing or empty mirror
# =============================================================================
set -e

BACKUP_DIR="${BACKUP_DIR:-/backups}"
ASSET_BUCKETS="uploads models textures videos hdr"
STATE_DIR="${BACKUP_DIR}/minio/.state"
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

# --- 2. Check each asset bucket that has content has a non-empty local mirror ---
for bucket in ${ASSET_BUCKETS}; do
  MIRROR_DIR="${BACKUP_DIR}/minio/${bucket}"

  # Source object count recorded by minio-backup.sh at last cycle.
  SRC_COUNT=0
  if [ -f "${STATE_DIR}/${bucket}.count" ]; then
    SRC_COUNT=$(cat "${STATE_DIR}/${bucket}.count" 2>/dev/null | tr -d ' ')
  fi

  if [ -z "${SRC_COUNT}" ] || [ "${SRC_COUNT}" -eq 0 ]; then
    echo "[SKIP] ${bucket} — source bucket has 0 objects, nothing to verify"
    continue
  fi

  if [ ! -d "${MIRROR_DIR}" ]; then
    echo "[FAIL] Mirror directory ${MIRROR_DIR} does not exist — minio-backup has not mirrored this bucket yet (source has ${SRC_COUNT} object(s))"
    ERRORS=$((ERRORS + 1))
  elif [ -z "$(ls -A "${MIRROR_DIR}" 2>/dev/null)" ]; then
    echo "[FAIL] Mirror directory ${MIRROR_DIR} is empty — no objects mirrored (source has ${SRC_COUNT} object(s))"
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
