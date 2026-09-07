#!/bin/bash
set -e

cd /home/hexa/hexastudio

echo "=== Deploy Start: $(date) ==="

# Force checkout the fix/ui-design-tokens branch
git fetch gitlab fix/ui-design-tokens 2>&1 | tail -3
git checkout -B fix/ui-design-tokens gitlab/fix/ui-design-tokens --force 2>&1 | tail -3
echo "HEAD: $(git log --oneline -1)"

# Determine next slot
CURRENT_SOT=$(docker ps --format '{{.Names}}' | grep -E 'hexa-backend-(blue|green)' | head -n 1 | cut -d'-' -f3)
echo "Current slot: $CURRENT_SOT"
NEXT_SOT="green"
echo "Deploying to $NEXT_SOT slot..."
export SOT=$NEXT_SOT

# Build and start green slot containers (frontend, backend, cms only)
echo "Building and starting green containers..."
docker compose -f docker-compose.prod.yml up -d --build --no-deps backend 2>&1 | tail -10

echo "=== Waiting for backend-green health ==="
for i in $(seq 1 30); do
  STATUS=$(docker inspect -f '{{.State.Health.Status}}' "hexa-backend-green" 2>/dev/null || echo "unknown")
  echo "  backend-green: $STATUS"
  if [ "$STATUS" == "healthy" ]; then
    echo "Backend is healthy!"
    break
  elif [ "$STATUS" == "unhealthy" ]; then
    echo "ERROR: Backend is unhealthy!"
    docker logs hexa-backend-green 2>&1 | tail -20
    exit 1
  fi
  sleep 10
done

echo "=== Starting frontend-green ==="
docker compose -f docker-compose.prod.yml up -d --build --no-deps frontend 2>&1 | tail -10

echo "=== Waiting for frontend-green health ==="
for i in $(seq 1 30); do
  STATUS=$(docker inspect -f '{{.State.Health.Status}}' "hexa-frontend-green" 2>/dev/null || echo "unknown")
  echo "  frontend-green: $STATUS"
  if [ "$STATUS" == "healthy" ]; then
    echo "Frontend is healthy!"
    break
  elif [ "$STATUS" == "unhealthy" ]; then
    echo "ERROR: Frontend is unhealthy!"
    docker logs hexa-frontend-green 2>&1 | tail -30
    exit 1
  fi
  sleep 10
done

echo "=== Removing blue slot containers ==="
for service in backend frontend cms; do
  docker stop "hexa-${service}-blue" 2>/dev/null || true
  docker rm "hexa-${service}-blue" 2>/dev/null || true
done
sleep 3

echo "=== Triggering ISR revalidation ==="
REVALIDATE_SECRET=$(grep 'REVALIDATE_SECRET' .env | cut -d= -f2- | tr -d '"')
if [ -n "$REVALIDATE_SECRET" ]; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "https://hexastudio.net/api/revalidate" \
    -H "Content-Type: application/json" \
    -H "x-revalidate-secret: $REVALIDATE_SECRET" \
    -d '{"paths":["/"],"type":"layout"}' \
    --max-time 10 || echo "000")
  echo "Revalidation: HTTP $HTTP_CODE"
else
  echo "Skipping revalidation: REVALIDATE_SECRET not set"
fi

echo "=== Purging Cloudflare cache ==="
CLOUDFLARE_ZONE_ID=$(grep 'CLOUDFLARE_ZONE_ID' .env | cut -d= -f2- | tr -d '"')
CLOUDFLARE_EMAIL=$(grep 'CLOUDFLARE_EMAIL' .env | cut -d= -f2- | tr -d '"')
CLOUDFLARE_API_KEY=$(grep 'CLOUDFLARE_API_KEY' .env | cut -d= -f2- | tr -d '"')
if [ -n "$CLOUDFLARE_EMAIL" ] && [ -n "$CLOUDFLARE_API_KEY" ]; then
  PURGE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
    -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
    -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"purge_everything":true}' \
    --max-time 15 || echo "000")
  echo "Cache purge: HTTP $PURGE_CODE"
fi

echo "=== Verifying site ==="
sleep 5
curl -s -o /dev/null -w "HTTPS %{http_code}" https://hexastudio.net/ 2>/dev/null
echo ""

echo "=== Deploy Complete: $(date) ==="
