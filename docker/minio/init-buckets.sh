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
# Public asset buckets: served to browsers directly via files.hexastudio.net
# (frontend uses <img src="https://files.hexastudio.net/uploads/..."> and
# Next.js _next/image optimizer fetches these URLs server-side). Private
# buckets here caused HTTP 403 on every site image.
mc anonymous set download "local/uploads" 2>/dev/null || true
mc anonymous set download "local/models" 2>/dev/null || true
mc anonymous set download "local/textures" 2>/dev/null || true
mc anonymous set download "local/videos" 2>/dev/null || true
mc anonymous set download "local/hdr" 2>/dev/null || true
# backups: private (never public — contains DB dumps & credentials)
mc anonymous set none "local/backups" 2>/dev/null || true

echo "MinIO buckets ready (assets public-read, backups private)."
