# Server Password Rotation Procedure

## Overview
Rotate root and service passwords on production server (19.16.1.100) quarterly or after any security incident.

## Passwords to Rotate

| Account | Service | Rotation Frequency | Method |
|---------|---------|-------------------|--------|
| `root` | SSH | Quarterly | Manual + SSH key rotation |
| `POSTGRES_PASSWORD` | PostgreSQL | Quarterly | `docker exec` + env update |
| `REDIS_PASSWORD` | Redis | Quarterly | `docker exec` + env update |
| `MINIO_ROOT_PASSWORD` | MinIO | Quarterly | `mc admin` + env update |
| `JWT_SECRET` | Backend | Quarterly | Generate new + deploy |
| `STRAPI_APP_KEYS` | Strapi | Quarterly | Generate new + deploy |
| `ODOO_PASSWORD` | Odoo | Quarterly | Odoo UI + env update |
| `GRAFANA_ADMIN_PASSWORD` | Grafana | Quarterly | Grafana UI + env update |
| `CLOUDFLARE_TUNNEL_TOKEN` | Cloudflare | Quarterly | Cloudflare Dashboard |
| `SENTRY_DSN` | Sentry | Quarterly | Sentry UI |

## Rotation Procedure

### 1. Pre-Rotation Checklist
- [ ] Schedule maintenance window (low traffic: 02:00-04:00 UTC)
- [ ] Notify team via `#deployments` Slack
- [ ] Verify current backups are healthy (`./scripts/verify-backup.sh`)
- [ ] Document current passwords in password manager (1Password/Bitwarden)
- [ ] Prepare new passwords (use `openssl rand -base64 32`)

### 2. Generate New Passwords
```bash
# Generate secure passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
MINIO_ROOT_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
STRAPI_APP_KEYS=$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)
GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 24)
```

### 3. Rotate Database Passwords

#### PostgreSQL
```bash
# 1. Update PostgreSQL password
docker exec -i postgres psql -U hexastudio -c "ALTER USER hexastudio WITH PASSWORD '$POSTGRES_PASSWORD';"

# 2. Update .env on server
ssh root@19.16.1.100 "sed -i 's/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/' /opt/hexastudio/.env"

# 3. Restart dependent services
docker compose -f docker-compose.prod.yml restart backend cms odoo
```

#### Redis
```bash
# 1. Update Redis password (requires restart)
docker exec redis redis-cli -a $OLD_REDIS_PASSWORD CONFIG SET requirepass $REDIS_PASSWORD

# 2. Update .env
ssh root@19.16.1.100 "sed -i 's/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/' /opt/hexastudio/.env"

# 3. Restart Redis and dependent services
docker compose -f docker-compose.prod.yml restart redis backend cms
```

#### MinIO
```bash
# 1. Update MinIO credentials
docker exec minio mc admin user svcacct add minio/hexa-studio --access-key=hexa-studio --secret-key=$MINIO_ROOT_PASSWORD

# 2. Update .env
ssh root@19.16.1.100 "sed -i 's/MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD/' /opt/hexastudio/.env"

# 3. Restart minio-init and dependent services
docker compose -f docker-compose.prod.yml restart minio minio-init backend cms
```

### 4. Rotate Application Secrets

#### JWT Secret (Backend)
```bash
# Update .env
ssh root@19.16.1.100 "sed -i 's/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/' /opt/hexastudio/.env"

# Restart backend
docker compose -f docker-compose.prod.yml restart backend
```

#### Strapi App Keys
```bash
# Update .env
ssh root@19.16.1.100 "sed -i 's/STRAPI_APP_KEYS=.*/STRAPI_APP_KEYS=$STRAPI_APP_KEYS/' /opt/hexastudio/.env"

# Restart CMS
docker compose -f docker-compose.prod.yml restart cms
```

#### Grafana Password
```bash
# Update Grafana admin password via CLI
docker exec grafana grafana-cli admin reset-admin-password $GRAFANA_ADMIN_PASSWORD

# Update .env
ssh root@19.16.1.100 "sed -i 's/GRAFANA_ADMIN_PASSWORD=.*/GRAFANA_ADMIN_PASSWORD=$GRAFANA_ADMIN_PASSWORD/' /opt/hexastudio/.env"
```

### 5. Rotate External Service Tokens

#### Cloudflare Tunnel Token
1. Go to Cloudflare Dashboard > Zero Trust > Networks > Tunnels
2. Click tunnel `hexa-studio` > Regenerate Token
2. Update `.env`: `CLOUDFLARE_TUNNEL_TOKEN=new_token`
3. Restart `cloudflared` container

#### Sentry DSN
1. Go to Sentry > Settings > Projects > hexastudio > Client Keys (DSN)
2. Regenerate DSN
3. Update `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` in `.env`
4. Redeploy frontend and backend

### 6. SSH Key Rotation (Annual)

```bash
# 1. Generate new key pair
ssh-keygen -t ed25519 -C "hexa-deploy-$(date +%Y%m%d)" -f ~/.ssh/hexa_deploy_new

# 2. Add new public key to server
ssh-copy-id -i ~/.ssh/hexa_deploy_new.pub root@19.16.1.100

# 3. Update GitHub Actions secret
# GitHub > Settings > Secrets > SSH_PRIVATE_KEY = cat ~/.ssh/hexa_deploy_new

# 3. Remove old key after verification
ssh root@19.16.1.100 "sed -i '/old-key-fingerprint/d' ~/.ssh/authorized_keys"
```

### 7. Post-Rotation Verification

```bash
# 1. Verify all services healthy
ssh root@19.16.1.100 "docker compose -f docker-compose.prod.yml ps"

# 2. Check health endpoints
curl -sf https://api.hexastudio.net/api/health
curl -sf https://hexastudio.net
curl -sf https://cms.hexastudio.net/_health

# 3. Verify monitoring
curl -sf https://grafana.hexastudio.net/api/health

# 4. Check logs for errors
docker compose -f docker-compose.prod.yml logs --tail=100 backend | grep -i error
```

### 8. Update Documentation
- [ ] Update password manager entries
- [ ] Update `BACKUP.md` if backup encryption key changed
- [ ] Update `DEPLOYMENT.md` if deploy process changed
- [ ] Record rotation in `CHANGELOG.md`

## Emergency Rotation (Security Incident)

If credentials are compromised:

1. **Immediately** rotate all affected credentials
2. **Immediately** revoke compromised SSH keys
3. **Force** logout all users: `docker exec postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='hexa_frontend';"`
4. **Rotate** JWT secret immediately to invalidate all sessions
5. **Audit** access logs for suspicious activity
6. **Document** incident in `INCIDENT_REPORT.md`

## Automation (Future)
- [ ] Create `scripts/rotate-passwords.sh` script
- [ ] Integrate with HashiCorp Vault or AWS Secrets Manager
- [ ] Add GitHub Actions workflow for quarterly rotation reminder

## Contacts
- Primary: DevOps Lead
- Secondary: Backend Lead
- Escalation: CTO