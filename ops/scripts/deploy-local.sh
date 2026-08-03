#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Starting Local Staging Deployment for HEXA Vision..."

# 1. Environment Setup
if [ ! -f .env ]; then
    echo "⚠️ .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env created. PLEASE EDIT .env WITH SECURE PASSWORDS BEFORE RUNNING AGAIN."
    exit 1
fi

# 2. Build and Start Containers
echo "📦 Building and starting Docker containers..."
docker compose build
docker compose up -d

# 3. Health Check
echo "🔍 Running health checks..."
"$SCRIPT_DIR/healthcheck.sh"

if [ $? -eq 0 ]; then
    echo "🎉 Deployment Successful! Application accessible at http://localhost"
else
    echo "❌ Deployment failed during health checks. Check logs: docker compose logs"
    exit 1
fi
