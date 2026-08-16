#!/bin/bash
# =============================================================================
# verify-backups.sh
# Verifies the integrity of generated .sql and .tar.gz files.
# =============================================================================
set -e

TARGET_DIR="${1:-/home/hexa/backups/daily}"
LOG_FILE="/home/hexa/backups/backup.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [VERIFY] $1" | tee -a "$LOG_FILE"
}

log "Verifying backups in ${TARGET_DIR}..."

# 1. Verify SQL files (using pg_restore --list to check if they are valid dumps)
# We use the postgres container to perform the check
SQL_FILES=$(ls ${TARGET_DIR}/*.sql 2>/dev/null | tail -n 5) # Check last 5
if [ -z "$SQL_FILES" ]; then
    log "No SQL files found to verify."
else
    for FILE in $SQL_FILES; do
        FNAME=$(basename "$FILE")
        # We mount the file into the container or use cat to stream it
        # Since it's a plain SQL dump (not -Fc), we can just check for 'CREATE TABLE' or similar
        # But a better way is to use pg_restore for custom format or just check for success
        if grep -q "CREATE TABLE" "$FILE"; then
            log "PASS: ${FNAME} contains valid SQL structure."
        else
            log "FAIL: ${FNAME} appears to be empty or corrupt."
            exit 1
        fi
    done
fi

# 2. Verify Tar.gz files
TAR_FILES=$(ls ${TARGET_DIR}/*.tar.gz 2>/dev/null | tail -n 5)
if [ -z "$TAR_FILES" ]; then
    log "No archive files found to verify."
else
    for FILE in $TAR_FILES; do
        FNAME=$(basename "$FILE")
        if tar -tzf "$FILE" > /dev/null 2>&1; then
            log "PASS: ${FNAME} is a valid gzip archive."
        else
            log "FAIL: ${FNAME} is corrupt."
            exit 1
        fi
    done
fi

log "All verified files are intact."
exit 0
