# 🎼 DOCKER COMPOSE CONFIGURATION & STACK SPECIFICATIONS

**Version:** 1.0.0 | **Scope:** Service Orchestration | **Standard:** Multi-Environment Composition

---

## 1. OVERVIEW & OBJECTIVES

Docker Compose is the primary orchestration tool for running the multi-service HEXA Vision platform locally and in production. Composition isolates networks, coordinates database migrations, sets container resource boundaries, and manages secret propagation.

---

## 2. ENVIRONMENT STACKS

The repository maintains two core compose definitions:
1. **`docker-compose.yml`** — Local development stack with hot-reloading volume mounts, local port exposures, and debug logging.
2. **`docker-compose.prod.yml`** — Production stack with Traefik routing labels, Cloudflare Tunnel integration, isolated internal network boundaries, health check dependencies, and automatic backup routines.

---

## 3. NETWORK ARCHITECTURE

Compose defines two strict network boundaries:

```yaml
networks:
  web:
    name: hexastudio_web
  internal:
    name: hexastudio_internal
    internal: true
```

- **`hexastudio_web`**: Public network joined by Traefik, Cloudflared, MinIO, Frontend, Backend, CMS, and Odoo.
- **`hexastudio_internal`**: Isolated internal network with **no external egress or public ports**. Accessible ONLY by internal application containers. Contains PostgreSQL (`:5432`), Redis (`:6379`), Qdrant (`:6333`), Prometheus, Loki, Promtail, and Node Exporter.

---

## 4. SERVICE CONFIGURATION PATTERNS

### A. Healthcheck Dependencies
Services defer initialization until required databases are healthy:
```yaml
depends_on:
  postgres:
    condition: service_healthy
  redis:
    condition: service_healthy
```

### B. Environment Secret Injection
Production secrets are injected via host environment variables (`.env`) with strict fallback rules:
```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
  JWT_SECRET: ${JWT_SECRET:?JWT_SECRET is required}
```

---

## 5. AUTOMATED SERVICE CONTAINERS

Beyond core applications, Compose manages key utility containers:
- **`minio-init`**: Runs `/scripts/init-buckets.sh` to initialize MinIO buckets upon startup.
- **`backup`**: Runs `docker/backup/backup.sh` — infinite-loop `pg_dump -Fc` of `hexastudio_api`, `hexastudio_cms`, `hexastudio_odoo`, `hexastudio_db` every 24h, 30-day prune, optional MinIO `backups` bucket upload via `mc`.
- **`backup-verify`**: Profiles-gated container (`--profile verify`) running `docker/backup/verify-backup.sh` (`pg_restore --list` integrity + 25h age check, exit 0/1).
- **`backup-verify-scheduled`**: Profiles-gated daemon (`--profile scheduled`) running `docker/backup/verify-loop.sh` (24h verification loop).
- **`watchtower`**: Scheduled updates for authorized third-party base images.

---

## 6. OPERATIONAL COMMANDS

```bash
# Start local development environment
docker compose up -d

# Start production environment in background
docker compose -f docker-compose.prod.yml up -d

# Validate compose file syntax and resolved variables
docker compose -f docker-compose.prod.yml config

# Run backup verification drill
docker compose -f docker-compose.prod.yml --profile verify run --rm backup-verify

# Enable scheduled daily backup verification daemon
docker compose -f docker-compose.prod.yml --profile scheduled up -d backup-verify-scheduled
```

---

## 7. RELATED DOCUMENTATION

- [DOCKER.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/docs/devops/DOCKER.md) — Base Dockerfile standards & resource limits.
- [DEPLOYMENT.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/docs/devops/DEPLOYMENT.md) — Zero-downtime deployment script execution.
- [DISASTER_RECOVERY.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/docs/devops/DISASTER_RECOVERY.md) — Backup and restore procedures.
