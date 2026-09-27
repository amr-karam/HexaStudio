#!/bin/sh
# PostgreSQL backup script for staging
# Runs daily via cron (0 0 6 * * *) - 6 AM daily

set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/hexastudio_${DATE}.sql.gz"
RETENTION_DAYS=7

echo "Starting backup at $(date)"

# Create backup directory if not exists
mkdir -p ${BACKUP_DIR}

# Dump database
pg_dump -h ${POSTGRES_HOST} -U ${POSTGRES_USER} -d ${POSTGRES_DB} | gzip > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
    echo "Backup created: ${BACKUP_FILE}"
    
    # Upload to MinIO (must include :9000 port)
    mc alias set minio http://${MINIO_ENDPOINT} ${MINIO_ACCESS_KEY} ${MINIO_SECRET_KEY} --api s3v4
    mc cp ${BACKUP_FILE} minio/backups/$(basename ${BACKUP_FILE})
    
    if [ $? -eq 0 ]; then
        echo "Backup uploaded to MinIO successfully"
    else
        echo "ERROR: Failed to upload backup to MinIO"
        exit 1
    fi
    
    # Clean old local backups
    find ${BACKUP_DIR} -name "hexastudio_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
    echo "Old backups cleaned up"
else
    echo "ERROR: pg_dump failed"
    exit 1
fi

echo "Backup completed at $(date)"