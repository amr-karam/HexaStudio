#!/bin/bash
# Fix MinIO uploads bucket public-read policy (BUG-2: 403 on files.hexastudio.net)
set -u
cd /home/hexa/hexastudio

U=$(grep '^MINIO_ROOT_USER=' .env | cut -d= -f2)
P=$(grep '^MINIO_ROOT_PASSWORD=' .env | cut -d= -f2)
ENDPOINT="http://minio:9000"

echo "---BUCKETS---"
docker exec hexastudio-minio-backup-1 mc alias set fix "$ENDPOINT" "$U" "$P" >/dev/null 2>&1 || true
docker exec hexastudio-minio-backup-1 mc ls fix/ 2>&1 || true

echo "---UPLOADS-POLICY-BEFORE---"
docker exec hexastudio-minio-backup-1 mc anonymous get fix/uploads 2>&1 || echo "(no policy / bucket missing)"

echo "---SET-UPLOADS-DOWNLOAD---"
docker exec hexastudio-minio-backup-1 mc anonymous set download fix/uploads 2>&1 || echo "SET FAILED"

echo "---UPLOADS-POLICY-AFTER---"
docker exec hexastudio-minio-backup-1 mc anonymous get fix/uploads 2>&1 || true

echo "---LIVE-TEST---"
docker exec hexastudio-minio-backup-1 curl -s -o /dev/null -w "anon GET uploads root: HTTP %{http_code}\n" "$ENDPOINT/uploads/" 2>&1 || true
curl -s -o /dev/null -w "public files.hexastudio.net/uploads/: HTTP %{http_code}\n" "https://files.hexastudio.net/uploads/" --max-time 10 || true
