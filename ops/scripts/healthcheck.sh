#!/bin/bash

echo "🏥 Checking service health..."

SERVICES=("postgres" "redis" "minio" "backend" "cms" "frontend" "nginx")
FAILED=0

for service in "${SERVICES[@]}"; do
    if docker ps --filter "name=hexa-$service" | grep -q "Up"; then
        echo "✅ $service is running."
    else
        echo "❌ $service is NOT running."
        FAILED=1
    fi
done

# Deep health check for API
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health || echo "FAILED")
if [ "$API_STATUS" == "200" ]; then
    echo "✅ API Health Check passed (200 OK)."
else
    echo "❌ API Health Check failed (Status: $API_STATUS)."
    FAILED=1
fi

if [ $FAILED -eq 0 ]; then
    echo "🌟 All systems operational."
    exit 0
else
    echo "⚠️ Some services are unhealthy."
    exit 1
fi
