# ADR-003: Docker Compose for Development and Deployment

## Status
Accepted

## Date
2025-01-15

## Context
The platform consists of multiple services:
- Frontend (Next.js)
- Backend (NestJS)
- CMS (Strapi)
- Database (PostgreSQL)
- Cache (Redis)
- Object Storage (MinIO)
- Reverse Proxy (Traefik)
- Monitoring (Prometheus, Grafana, Loki)

We need a consistent environment across development, staging, and production.

## Decision
We will use **Docker Compose** for local development and **Docker + SSH deployment** for production.

## Alternatives Considered
| Alternative | Pros | Cons |
|-------------|------|------|
| Podman | Rootless, daemonless | Smaller ecosystem, less tooling support |
| Kubernetes | Industry standard, auto-scaling | Overkill for small team, steep learning curve |
| Nix | Reproducible builds, declarative | Complex setup, smaller community |
| Vagrant | VM-based isolation | Heavier resource usage, slower startups |

## Rationale
1. **Consistency**: "Works on my machine" eliminated — Docker ensures identical environments.
2. **Isolation**: Each service (Postgres, Redis, MinIO) runs in its own container with controlled networking.
3. **Security**: Internal services (databases) are not exposed to the public — only Traefik handles external traffic.
4. **Simplicity**: Docker Compose is simpler than Kubernetes for a team of our size.
5. **Cost**: No managed container orchestration fees — runs on a single VPS.

## Consequences
- Must maintain `docker-compose.yml` and service-specific `Dockerfile`s.
- Development requires Docker Desktop or Docker Engine installed.
- Image sizes must be minimized (use `-alpine` variants).

## References
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Traefik Reverse Proxy](https://doc.traefik.io/traefik/)
