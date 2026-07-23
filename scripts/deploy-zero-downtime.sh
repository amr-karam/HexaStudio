#!/bin/bash
set -e

# determine current slot
CURRENT_SOT=$(docker ps --format '{{.Names}}' | grep -E 'hexa-backend-(blue|green)' | head -n 1 | cut -d'-' -f3)

if [ -z "$CURRENT_SOT" ]; then
  echo "No active slot found. Defaulting to blue."
  NEXT_SOT="blue"
else
  echo "Current slot: $CURRENT_SOT"
  [ "$CURRENT_SOT" == "blue" ] && NEXT_SOT="green" || NEXT_SOT="blue"
fi

echo "Deploying to $NEXT_SOT slot..."

# Set container names for the next slot
export SOT=$NEXT_SOT

# Pull and start
docker compose -f docker-compose.prod.yml pull
SOT=$NEXT_SOT docker compose -f docker-compose.prod.yml up -d --build --no-deps backend frontend cms

# Wait for health
echo "Waiting for $NEXT_SOT slot to become healthy..."
for service in "backend" "frontend" "cms"; do
  CONTAINER_NAME="hexa-${service}-$NEXT_SOT"
  echo "Checking $CONTAINER_NAME..."
  while true; do
    STATUS=$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
    if [ "$STATUS" == "healthy" ]; then
      echo "$CONTAINER_NAME is healthy!"
      break
    elif [ "$STATUS" == "unhealthy" ]; then
      echo "Error: $CONTAINER_NAME is unhealthy!"
      exit 1
    fi
    echo "Still waiting for $CONTAINER_NAME... (status: $STATUS)"
    sleep 5
  done
done

# Remove old slot FIRST so Traefik routes exclusively to the new slot.
# NOTE: never use `docker compose stop/rm` here — compose tracks the CURRENT
# project containers (the new slot we just started), so it would kill the
# fresh deployment. Target the old slot's containers explicitly by name.
if [ -n "$CURRENT_SOT" ]; then
  echo "Removing $CURRENT_SOT slot..."
  for service in backend frontend cms; do
    docker stop "hexa-${service}-${CURRENT_SOT}" 2>/dev/null || true
    docker rm "hexa-${service}-${CURRENT_SOT}" 2>/dev/null || true
  done
  # Give Traefik a moment to detect the old containers are gone.
  sleep 3
fi

# Sprint 15 P9: kick on-demand ISR revalidation. The frontend was prerendered
# during build with an empty data cache (backend was unreachable during
# `docker compose build`). Now that backend is healthy AND the old slot is
# removed (so the request hits the new slot exclusively), POST /api/revalidate
# to flush the whole layout cache; Next regenerates with live data within
# seconds. Best-effort: if the secret is unset or the call fails, the next
# user request still triggers regeneration via stale-while-revalidate.
if [ -n "$REVALIDATE_SECRET" ]; then
  echo "Triggering on-demand ISR revalidation..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "https://hexastudio.net/api/revalidate" \
    -H "Content-Type: application/json" \
    -H "x-revalidate-secret: $REVALIDATE_SECRET" \
    -d '{"paths":["/"],"type":"layout"}' \
    --max-time 10 || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    echo "Revalidation triggered successfully."
  else
    echo "Warning: revalidation returned HTTP $HTTP_CODE (non-fatal; ISR will heal on next request)."
  fi
else
  echo "Skipping on-demand revalidation: REVALIDATE_SECRET not set in deploy environment."
fi

echo "Zero-downtime deployment complete!"