#!/bin/bash
# Diagnose MinIO bucket policy + files.hexastudio.net 403
set -e
CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '^hexastudio-minio-1$' | head -1)
echo "MinIO container: $CONTAINER"

# Extract root creds from container env
USER=$(docker exec "$CONTAINER" printenv MINIO_ROOT_USER)
PASS=$(docker exec "$CONTAINER" printenv MINIO_ROOT_PASSWORD)
echo "Root user: $USER"

# Configure mc alias
docker exec "$CONTAINER" mc alias set local http://localhost:9000 "$USER" "$PASS" > /dev/null 2>&1

echo "--- BUCKETS ---"
docker exec "$CONTAINER" mc ls local 2>&1 | head -20

echo "--- ANON POLICY uploads ---"
docker exec "$CONTAINER" mc anonymous get local/uploads 2>&1 | head -5

echo "--- ANON POLICY root/bucket per-bucket ---"
for b in uploads models textures videos hdr backups; do
  echo -n "$b: "
  docker exec "$CONTAINER" mc anonymous get "local/$b" 2>&1 | tr -d '\n'
  echo ""
done

echo "--- TEST OBJECT READ ---"
docker exec "$CONTAINER" mc stat "local/uploads/villa_dusk_jpg_be984918b6.jpg" 2>&1 | head -8 || echo "object not found"
