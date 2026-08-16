#!/bin/bash
# =============================================================================
# prune-backups.sh
# Implements the GFS Rotational Retention Policy.
# =============================================================================
set -e

BACKUP_ROOT="/home/hexa/backups"
DAILY_DIR="${BACKUP_ROOT}/daily"
WEEKLY_DIR="${BACKUP_ROOT}/weekly"
MONTHLY_DIR="${BACKUP_ROOT}/monthly"
LOG_FILE="${BACKUP_ROOT}/backup.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [PRUNE] $1" | tee -a "$LOG_FILE"
}

log "Starting rotational pruning..."

# Daily backups: Keep for last 7 days
log "Pruning daily backups (> 7 days)..."
find "${DAILY_DIR}" -type f -mtime +7 -name "*_*" -delete

# Weekly backups: Keep for last 4 weeks (28 days)
log "Pruning weekly backups (> 28 days)..."
find "${WEEKLY_DIR}" -type f -mtime +28 -name "*_*" -delete

# Monthly backups: Keep for last 6 months (180 days)
log "Pruning monthly backups (> 180 days)..."
find "${MONTHLY_DIR}" -type f -mtime +180 -name "*_*" -delete

log "Pruning completed."
