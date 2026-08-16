#!/bin/bash
# LIVE HOTFIX: make public asset buckets readable, keep backups private.
set -e
CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '^hexastudio-minio-1$' | head -1)
echo "MinIO container: $CONTAINER"

USER=$(docker exec "$CONTAINER" printenv MINIO_ROOT_USER)
PASS=$(docker exec "$CONTAINER" printenv MINIO_ROOT_PASSWORD)

docker exec "$CONTAINER" mc alias set local http://localhost:9000 "$USER" "$PASS" > /dev/null 2>&1

for bucket in uploads models textures videos hdr; do
  echo -n "Set $bucket -> download: "
  docker exec "$CONTAINER" mc anonymous set download "local/$bucket" 2>&1 | tr -d '\n'
  echo ""
done

echo -n "Set backups -> none: "
docker exec "$CONTAINER" mc anonymous set none "local/backups" 2>&1 | tr -d '\n'
echo ""

echo "--- VERIFY POLICIES ---"
for bucket in uploads models textures videos hdr backups; do
  echo -n "$bucket: "
  docker exec "$CONTAINER" mc anonymous get "local/$bucket" 2>&1 | tr -d '\n'
  echo ""
done

echo "--- VERIFY PUBLIC FETCH ---"
curl -s -o /dev/null -w 'https://files.hexastudio.net/uploads/villa_dusk_jpg_be984918b6.jpg -> HTTP %{http_code}\n' https://files.hexastudio.net/uploads/villa_dusk_jpg_be984918b6.jpg --max-time 15
