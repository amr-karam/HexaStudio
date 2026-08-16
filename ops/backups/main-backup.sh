#!/bin/bash
# =============================================================================
# main-backup.sh
# Local-First Backup System for HEXA STUDIO
# =============================================================================
set -e

# --- Configuration ---
BACKUP_ROOT="/home/hexa/backups"
SOT_DIR="/home/hexa/hexastudio"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${BACKUP_ROOT}/backup.log"

# DB Config (matching docker-compose.prod.yml)
PG_HOST="localhost" # Use localhost if running via docker exec or mapping ports
PG_USER="hexastudio"
PG_DB_LIST=("hexastudio_api" "hexastudio_cms" "hexastudio_odoo" "hexastudio_db")

# Directories for GFS
DAILY_DIR="${BACKUP_ROOT}/daily"
WEEKLY_DIR="${BACKUP_ROOT}/weekly"
MONTHLY_DIR="${BACKUP_ROOT}/monthly"

# Ensure directories exist
mkdir -p "$DAILY_DIR" "$WEEKLY_DIR" "$MONTHLY_DIR"
touch "$LOG_FILE"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting backup cycle..."

# --- 1. Database Backups ---
# We use 'docker exec' to run pg_dump inside the postgres container to avoid local pg_dump version mismatches
for DB in "${PG_DB_LIST[@]}"; do
    FILE="${DAILY_DIR}/${DB}_${TIMESTAMP}.sql"
    log "Backing up database: ${DB}..."
    if docker exec postgres pg_dump -U "${PG_USER}" -d "${DB}" > "${FILE}"; then
        log "SUCCESS: ${DB} backed up to ${FILE}"
    else
        log "ERROR: Failed to backup ${DB}"
        exit 1
    fi
done

# --- 2. File Backups ---
# A. Odoo Filestore
ODOO_FILE="${DAILY_DIR}/odoo_filestore_${TIMESTAMP}.tar.gz"
log "Archiving Odoo filestore..."
if docker exec odoo tar -czf - /var/lib/odoo > "${ODOO_FILE}"; then
    log "SUCCESS: Odoo filestore archived to ${ODOO_FILE}"
else
    log "ERROR: Failed to archive Odoo filestore"
    exit 1
fi

# B. System Config Files
CONFIG_FILE="${DAILY_DIR}/system_config_${TIMESTAMP}.tar.gz"
log "Archiving system configuration..."
if tar -czf "${CONFIG_FILE}" -C "${SOT_DIR}" . ; then
    log "SUCCESS: System config archived to ${CONFIG_FILE}"
else
    log "ERROR: Failed to archive system config"
    exit 1
fi

# --- 3. GFS Rotation (Copy to Weekly/Monthly) ---
# Weekly: Every Sunday (Day 0)
if [ "$(date +%u)" -eq 7 ]; then
    log "Sunday detected. Copying backups to weekly storage..."
    cp ${DAILY_DIR}/*_${TIMESTAMP}.* ${WEEKLY_DIR}/
fi

# Monthly: Every 1st of the month
if [ "$(date +%d)" -eq "01" ]; then
    log "First of the month detected. Copying backups to monthly storage..."
    cp ${DAILY_DIR}/*_${TIMESTAMP}.* ${MONTHLY_DIR}/
fi

# --- 4. Verification ---
log "Triggering backup verification..."
if /bin/bash "${SOT_DIR}/ops/backups/verify-backups.sh" "${DAILY_DIR}"; then
    log "VERIFICATION PASSED: All latest backups are intact."
else
    log "VERIFICATION FAILED: Integrity check failed for one or more files."
    exit 1
fi

log "Backup cycle completed successfully."
