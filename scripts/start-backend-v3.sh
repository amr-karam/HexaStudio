#!/bin/bash
set -e

cd /home/hexa/hexastudio

# Remove existing container
docker rm -f hexa-backend-blue 2>/dev/null || true

# Start backend with env-file and pre-milestone image
docker run -d \
  --name hexa-backend-blue \
  --restart unless-stopped \
  --network hexastudio_web \
  --network hexastudio_internal \
  --env-file .env \
  --health-cmd='curl -f http://127.0.0.1:4000/api/health' \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=5 \
  --health-start-period=40s \
  -e NODE_ENV=production \
  -e PORT=4000 \
  -e DATABASE_URL="postgresql://hexastudio:${POSTGRES_PASSWORD}@postgres:5432/hexastudio_api" \
  -e REDIS_URL="redis://:${REDIS_PASSWORD}@redis:6379" \
  -e "MINIO_ROOT_USER=hexastudio" \
  -e "MINIO_ENDPOINT=minio" \
  -e MINIO_PORT=9000 \
  -e MINIO_USE_SSL=false \
  -e CMS_URL=http://cms:1337 \
  -e REDIS_HOST=redis \
  -e "ODOO_HOST=odoo" \
  -e ODOO_PORT=8069 \
  -e "ODOO_DB=hexastudio_odoo" \
  -e "ODOO_USER=admin" \
  -e AI_CHAT_PROVIDER=local \
  -e "LM_STUDIO_BASE_URL=http://host.docker.internal:1234/v1" \
  -e LM_STUDIO_MODEL=google/gemma-4-e4b \
  -e "NEXT_PUBLIC_API_URL=https://api.hexastudio.net" \
  -e "NEXT_PUBLIC_CMS_URL=https://cms.hexastudio.net" \
  -e "NEXT_PUBLIC_SITE_URL=https://hexastudio.net" \
  hexastudio-backend:pre-milestone

echo "Backend started: $(docker ps -q -f name=hexa-backend-blue)"
