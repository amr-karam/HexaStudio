# Server Setup Guide

**Last Updated:** 2026-07-08

---

## Prerequisites

- Ubuntu 24.04 LTS Server
- SSH access with root or sudo privileges
- Public IP address
- Domain name pointed to the server IP

## Step-by-Step Setup

### 1. OS Hardening

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl git vim ufw lsb-release

# Configure Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Docker Installation

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER
```

### 3. Application Setup

```bash
# Clone repository
git clone https://github.com/hexastudio/hexa-studio.git /opt/hexastudio
cd /opt/hexastudio

# Setup environment
cp .env.example .env
nano .env # Fill in secrets, DB URLs, etc.

# Deploy stack
docker compose -f docker-compose.prod.yml up -d
```

### 4. SSL Verification

Traefik automatically handles SSL via Let's Encrypt. Verify by visiting:
`https://hexastudio.net`

## Maintenance Tasks

| Task | Frequency | Command |
|------|-----------|----------|
| System Update | Weekly | `sudo apt update && sudo apt upgrade -y` |
| Log Rotation | Daily | Handled by Docker log-opts |
| Backup Check | Daily | Check `/backups` directory |
| Docker Prune | Weekly | `docker system prune -f` |
| Security Audit | Monthly | `npm audit` + system scan |

## Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| Container loop | Check logs: `docker compose logs -f <service>` |
| SSL not renewing | Check `/acme.json` permissions (600) |
| Disk full | Check `/var/lib/docker/volumes` and prune |
| API 502 error | Verify backend service is running and healthy |
