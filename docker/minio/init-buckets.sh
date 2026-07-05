#!/bin/sh
set -e

echo "Waiting for MinIO..."
until mc alias set local http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"; do
  sleep 2
done

echo "Creating buckets..."
for bucket in uploads models textures videos hdr backups; do
  mc mb --ignore-existing "local/${bucket}"
done

echo "Setting bucket policies..."
# uploads: private (requires presigned URLs)
mc anonymous set none "local/uploads" 2>/dev/null || true
# models: private (3D assets require auth)
mc anonymous set none "local/models" 2>/dev/null || true
# textures: private (textures require auth)
mc anonymous set none "local/textures" 2>/dev/null || true
# videos: private (video content requires auth)
mc anonymous set none "local/videos" 2>/dev/null || true
# hdr: private (HDRI maps require auth)
mc anonymous set none "local/hdr" 2>/dev/null || true
# backups: private (never public)
mc anonymous set none "local/backups" 2>/dev/null || true

echo "MinIO buckets ready (all private)."
