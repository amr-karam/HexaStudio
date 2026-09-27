#!/bin/sh
# MinIO bucket initialization script for staging
# Creates required buckets with proper policies

set -e

MINIO_ALIAS=local
MC_CONFIG_DIR=/tmp/mc

echo "Waiting for MinIO to be ready..."
until mc alias set ${MINIO_ALIAS} http://minio:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD} --api s3v4; do
  echo "MinIO not ready, waiting..."
  sleep 5
done

echo "MinIO is ready, creating buckets..."

# Create buckets
mc mb --ignore-existing ${MINIO_ALIAS}/assets
mc mb --ignore-existing ${MINIO_ALIAS}/uploads
mc mb --ignore-existing ${MINIO_ALIAS}/backups
mc mb --ignore-existing ${MINIO_ALIAS}/cms-uploads

# Set bucket policies (public read for assets, private for others)
mc anonymous set public ${MINIO_ALIAS}/assets
mc anonymous set private ${MINIO_ALIAS}/uploads
mc anonymous set private ${MINIO_ALIAS}/backups
mc anonymous set private ${MINIO_ALIAS}/cms-uploads

echo "Buckets created and configured successfully"