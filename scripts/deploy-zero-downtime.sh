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

# Remove old slot
if [ -n "$CURRENT_SOT" ]; then
  echo "Removing $CURRENT_SOT slot..."
  export SOT=$CURRENT_SOT
  docker compose -f docker-compose.prod.yml stop backend frontend cms
  docker compose -f docker-compose.prod.yml rm -f backend frontend cms
fi

echo "Zero-downtime deployment complete!"
