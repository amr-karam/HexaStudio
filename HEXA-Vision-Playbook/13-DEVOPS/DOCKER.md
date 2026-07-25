# 🐳 DOCKER CONTAINERIZATION STANDARDS

**Version:** 1.0.0 | **Scope:** Production & Local Infrastructure | **Standard:** Enterprise Containerization

---

## 1. OVERVIEW & OBJECTIVES

HEXA Vision uses a fully containerized micro-service topology orchestrated via Docker and Docker Compose. Containerization guarantees strict environment parity across Local Development, Staging, and Production deployment targets.

---

## 2. CONTAINER TOPOLOGY & ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DOCKER CONTAINER TOPOLOGY                         │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    PUBLIC INTERFACE NETWORK (web)                     │  │
│  │   ┌──────────────┐         ┌───────────────┐        ┌──────────────┐  │  │
│  │   │   Traefik    │         │ Cloudflared   │        │   MinIO      │  │  │
│  │   │  (Reverse)   │         │ (Edge Tunnel) │        │ (S3 Media)   │  │  │
│  │   └──────┬───────┘         └───────┬───────┘        └──────┬───────┘  │  │
│  └──────────┼─────────────────────────┼───────────────────────┼──────────┘  │
│             │                         │                       │             │
│  ┌──────────┴─────────────────────────┴───────────────────────┴──────────┐  │
│  │                    INTERNAL ISOLATED NETWORK (internal)               │  │
│  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐            │  │
│  │   │ Next.js FE   │    │ NestJS BFF   │    │ Strapi CMS   │            │  │
│  │   └──────────────┘    └──────────────┘    └──────────────┘            │  │
│  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐            │  │
│  │   │ PostgreSQL16 │    │  Redis 7     │    │ Qdrant Vector│            │  │
│  │   └──────────────┘    └──────────────┘    └──────────────┘            │  │
│  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐            │  │
│  │   │  Odoo ERP 17 │    │ Prometheus   │    │ Loki/Promtail│            │  │
│  │   └──────────────┘    └──────────────┘    └──────────────┘            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. DOCKERFILE STANDARDS

All application services (`apps/frontend`, `apps/backend`, `apps/cms`) use multi-stage Dockerfiles:

1. **Stage 1: Base & Dependencies (`deps`)** — Installs production node modules using `npm install --legacy-peer-deps`.
2. **Stage 2: Builder (`builder`)** — Copies monorepo source, builds TypeScript, runs Turbopack/Next.js standalone bundle generation.
3. **Stage 3: Runner (`runner`)** — Minimal Node Alpine runtime image running non-root `node` user with zero unnecessary build tooling.

---

## 4. RESOURCE ALLOCATION & LIMITS

| Service | Image | CPU Limit | RAM Limit | RAM Reservation |
|---------|-------|-----------|-----------|-----------------|
| `frontend` | Next.js Standalone | 1.0 vCPU | 512 MB | 256 MB |
| `backend` | NestJS Dist | 1.0 vCPU | 1024 MB | 512 MB |
| `cms` | Strapi 5 | 1.5 vCPU | 4096 MB | 1024 MB |
| `postgres` | Postgres 16 Alpine | 2.0 vCPU | 4096 MB | 1024 MB |
| `redis` | Redis 7 Alpine | 0.5 vCPU | 512 MB | 128 MB |
| `qdrant` | Qdrant Vector DB | 1.0 vCPU | 2048 MB | 512 MB |
| `minio` | MinIO Server | 1.0 vCPU | 1024 MB | 256 MB |
| `odoo` | Odoo 17.0 | 2.0 vCPU | 4096 MB | 1024 MB |

---

## 5. HEALTH CHECK & LOGGING RULES

### Health Checks
Every service container MUST declare an active health check in `docker-compose.prod.yml`:
- **HTTP Services**: `wget --spider -q http://127.0.0.1:{port}/health` or similar endpoint.
- **PostgreSQL**: `pg_isready -U {user} -d {db}`.
- **Redis**: `redis-cli -a {password} ping`.

### Logging Rules
All containers log in JSON format with rotating file caps:
```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

---

## 6. EXAMPLES & OPERATIONAL COMMANDS

```bash
# Start local production container stack
docker compose -f docker-compose.prod.yml up -d

# Check health and status of all services
docker compose -f docker-compose.prod.yml ps

# Tail logs of specific app service
docker compose -f docker-compose.prod.yml logs -f --tail=100 backend

# Execute zero-downtime container upgrade
bash scripts/deploy-zero-downtime.sh
```

---

## 7. RELATED DOCUMENTATION

- [DOCKER_COMPOSE.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/13-DEVOPS/DOCKER_COMPOSE.md) — Service composition & stack configurations.
- [SYSTEM_ARCHITECTURE.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/01-ARCHITECTURE/SYSTEM_ARCHITECTURE.md) — System topology & network architecture.
- [DEPLOYMENT.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/13-DEVOPS/DEPLOYMENT.md) — Production deployment pipelines.
