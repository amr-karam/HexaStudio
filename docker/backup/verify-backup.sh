#!/bin/sh
# =============================================================================
# verify-backup.sh
# Verifies PostgreSQL backup dumps stored in /backups are valid and readable.
#
# Usage:
#   docker compose -f docker-compose.prod.yml run --rm backup-verify
#   OR: sh docker/backup/verify-backup.sh
#
# Exit codes:
#   0  All backups are valid
#   1  One or more backups are missing or corrupt
# =============================================================================
set -e

BACKUP_DIR="${BACKUP_DIR:-/backups}"
PG_HOST="${POSTGRES_HOST:-postgres}"
PG_USER="${POSTGRES_USER:-hexastudio}"
PASS="${POSTGRES_PASSWORD}"
VERIFY_DB="${VERIFY_DB:-hexastudio_verify_$$}"
ERRORS=0

echo "============================================"
echo "[verify-backup] Starting backup verification"
echo "[verify-backup] Backup directory: ${BACKUP_DIR}"
echo "============================================"

# --- 1. Check backup directory exists ---
if [ ! -d "${BACKUP_DIR}" ]; then
  echo "[FAIL] Backup directory ${BACKUP_DIR} does not exist."
  exit 1
fi

# --- 2. Find the most recent dumps ---
API_DUMP=$(ls -t "${BACKUP_DIR}"/hexastudio_api_*.dump 2>/dev/null | head -1)
CMS_DUMP=$(ls -t "${BACKUP_DIR}"/hexastudio_cms_*.dump 2>/dev/null | head -1)

if [ -z "${API_DUMP}" ]; then
  echo "[FAIL] No hexastudio_api dump files found in ${BACKUP_DIR}"
  ERRORS=$((ERRORS + 1))
else
  echo "[INFO] Latest API dump: ${API_DUMP}"
fi

if [ -z "${CMS_DUMP}" ]; then
  echo "[FAIL] No hexastudio_cms dump files found in ${BACKUP_DIR}"
  ERRORS=$((ERRORS + 1))
else
  echo "[INFO] Latest CMS dump: ${CMS_DUMP}"
fi

[ "${ERRORS}" -gt 0 ] && exit 1

# --- 3. Validate dump file integrity using pg_restore --list ---
export PGPASSWORD="${PASS}"

echo ""
echo "[verify-backup] Verifying dump integrity..."

for DUMP in "${API_DUMP}" "${CMS_DUMP}"; do
  FNAME=$(basename "${DUMP}")
  echo "[INFO] Checking: ${FNAME}"

  if pg_restore --list "${DUMP}" > /dev/null 2>&1; then
    # Count objects in the dump
    OBJECT_COUNT=$(pg_restore --list "${DUMP}" | grep -v "^;" | wc -l | tr -d ' ')
    FILE_SIZE=$(du -sh "${DUMP}" | cut -f1)
    echo "[PASS] ${FNAME} — ${OBJECT_COUNT} objects, size: ${FILE_SIZE}"
  else
    echo "[FAIL] ${FNAME} — pg_restore reported corrupt or invalid dump"
    ERRORS=$((ERRORS + 1))
  fi
done

# --- 4. Age check: warn if latest backup is older than 25 hours ---
echo ""
echo "[verify-backup] Checking backup age..."

for DUMP in "${API_DUMP}" "${CMS_DUMP}"; do
  FNAME=$(basename "${DUMP}")
  DUMP_TIME=$(stat -c "%Y" "${DUMP}" 2>/dev/null || stat -f "%m" "${DUMP}" 2>/dev/null)
  NOW=$(date +%s)
  AGE_HOURS=$(( (NOW - DUMP_TIME) / 3600 ))

  if [ "${AGE_HOURS}" -gt 25 ]; then
    echo "[WARN] ${FNAME} is ${AGE_HOURS} hours old — backup cycle may have missed a run"
  else
    echo "[PASS] ${FNAME} is ${AGE_HOURS} hours old — within expected window"
  fi
done

# --- 5. Summary ---
echo ""
echo "============================================"
if [ "${ERRORS}" -eq 0 ]; then
  echo "[verify-backup] All backups are VALID."
  echo "============================================"
  exit 0
else
  echo "[verify-backup] ${ERRORS} verification error(s) detected."
  echo "============================================"
  exit 1
fi
