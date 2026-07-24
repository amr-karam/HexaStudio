# Local Staging Deployment Guide

This guide describes how to deploy the HEXA Vision platform to a local Ubuntu Server (24.04 LTS) for staging purposes.

## Prerequisites
- Ubuntu Server 24.04 LTS
- Docker Engine v24+
- Docker Compose v2.20+
- Git

## Installation Steps

### 1. System Preparation
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget
```

### 2. Clone Repository
```bash
git clone ssh://git@19.16.1.100:2222/hexa/hexa-studio.git
cd hexa-studio
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env # Update passwords and secrets
```

### 4. Deploy
```bash
chmod +x deploy-local.sh healthcheck.sh
./deploy-local.sh
```

## Verification
Run the health check manually:
```bash
./healthcheck.sh
```

## Access
- **Frontend:** `http://localhost` or `http://SERVER_IP`
- **Backend API:** `http://localhost/api`
- **CMS Admin:** `http://localhost/cms/admin`
