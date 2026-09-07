#!/bin/bash
set -e

cd /home/hexa/hexastudio

# Start backend with pre-milestone image (old working version)
# We need to override the image to use pre-milestone
docker run -d \
  --name hexa-backend-blue \
  --restart unless-stopped \
  --network hexastudio_web \
  --network hexastudio_internal \
  --health-cmd='curl -f http://127.0.0.1:4000/api/health' \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  --health-start-period=40s \
  -e NODE_ENV=production \
  -e PORT=4000 \
  -e DATABASE_URL="${DATABASE_URL:-postgresql://hexastudio:${POSTGRES_PASSWORD}@postgres:5432/hexastudio_api}" \
  -e REDIS_URL="redis://:${REDIS_PASSWORD}@redis:6379" \
  -e JWT_SECRET="${JWT_SECRET}" \
  -e JWT_PUBLIC_KEY="${JWT_PUBLIC_KEY}" \
  -e JWT_PRIVATE_KEY="${JWT_PRIVATE_KEY}" \
  -e JWT_EXPIRES_IN="7d" \
  -e CORS_ORIGINS="https://hexastudio.net,https://www.hexastudio.net" \
  -e RATE_LIMIT_TTL=60 \
  -e RATE_LIMIT_MAX=100 \
  -e SENTRY_DSN="" \
  -e MINIO_ENDPOINT=minio \
  -e MINIO_PORT=9000 \
  -e MINIO_ACCESS_KEY=hexastudio \
  -e MINIO_SECRET_KEY="${MINIO_ROOT_PASSWORD}" \
  -e MINIO_USE_SSL=false \
  -e CMS_URL=http://cms:1337 \
  -e REDIS_PASSWORD="${REDIS_PASSWORD}" \
  -e REDIS_HOST=redis \
  -e MINIO_ROOT_USER=hexastudio \
  -e MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD}" \
  -e ODOO_HOST=odoo \
  -e ODOO_PORT=8069 \
  -e ODOO_DB=hexastudio_odoo \
  -e ODOO_USER=admin \
  -e ODOO_PASSWORD="${ODOO_PASSWORD}" \
  -e ODOO_WEBHOOK_SECRET="${ODOO_WEBHOOK_SECRET}" \
  -e VECTOR_HOST=qdrant \
  -e VECTOR_PORT=6333 \
  -e AI_CHAT_PROVIDER=local \
  -e LM_STUDIO_BASE_URL=http://host.docker.internal:1234/v1 \
  -e LM_STUDIO_MODEL=google/gemma-4-e4b \
  -e NEXT_PUBLIC_API_URL=https://api.hexastudio.net \
  -e NEXT_PUBLIC_CMS_URL=https://cms.hexastudio.net \
  -e NEXT_PUBLIC_SITE_URL=https://hexastudio.net \
  hexastudio-backend:pre-milestone

echo "Backend container started"
