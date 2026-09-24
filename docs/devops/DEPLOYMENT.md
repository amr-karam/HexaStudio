# 🛠️ DEVOPS: THE INFRASTRUCTURE BLUEPRINT

**Version:** 2.0 | **Scope:** Infrastructure | **Standard:** Immutable / Scalable / Secure

## 1. THE DEVOPS PHILOSOPHY
We treat infrastructure as **Code**. There are no "manual" server changes. Every environment is defined in version control and deployed automatically through GitLab CE CI/CD and Docker Compose.

---

## 2. THE CONTAINER STRATEGY

### I. Image Optimization
- **Multi-Stage Builds:** Use multi-stage Dockerfiles to keep production images lean.
- **Alpine Base:** Prefer `alpine` or `distroless` images where applicable.
- **Caching:** Optimize Docker layer caching for faster rebuilds.

### II. Orchestration
- **Docker Compose:** The single source of truth for production/service definitions in `docker-compose.prod.yml`.
- **Traefik v3:** Edge reverse proxy and ingress router. See `docker/traefik/traefik.yml` and `docker/traefik/dynamic.yml`.
- **Cloudflare Tunnel:** `cloudflared` exposes services without a public server IP; Cloudflare provides CDN, WAF, and DNS.

---

## 3. THE DEPLOYMENT PIPELINE (CI/CD)

### I. Pipeline Authority
- **GitLab CE** is the authoritative CI/CD system.
- **GitHub Actions is not used.** The old `.github/workflows` workflows and `docs/devops/GITHUB_ACTIONS.md` redirect now point to GitLab CE pipeline docs.

### II. GitLab Flow
- **`develop`:** Auto-deploys to staging on push via GitLab CI/CD.
- **`main`:** Manual production approval gate, then deploy via GitLab CI/CD.
- **Feature branches:** Run quality gates only.

### III. Deployment Sequence
1. **Lint & Test:** Run `npm run lint`, `npm run typecheck`, and `npm run test`.
2. **Build:** Build Docker images and push to the GitLab Container Registry.
3. **Deploy:** Update container images on the production server.
4. **Health Check:** Verify application health before traffic switches.

---

## 4. OBSERVABILITY & MONITORING

### I. Monitoring Stack
- **Prometheus:** Metrics collection.
- **Grafana:** Dashboards.
- **Loki + Promtail:** Centralized logging.
- **Tempo:** Distributed traces.
- **Alertmanager:** Alert routing.
- **Blackbox Exporter:** External probe checks.
- **cAdvisor + Node Exporter + Postgres Exporter + Redis Exporter:** Host, container, database, and cache metrics.

### II. Alerting Policy
- **Critical (P0):** Site down or spike in errors.
- **Warning (P1):** Elevated latency or resource pressure.

---

## 5. QUALITY GATE: DEVOPS AUDIT
A deployment is "DevOps-Done" only when:
- [ ] The build is fully automated.
- [ ] Infrastructure is defined as code.
- [ ] Monitoring is active and reporting.
- [ ] Backup and recovery is tested and verified.

---

## 6. EDGE, DNS, AND TUNNELING
DNS, CDN, WAF, and SSL termination are handled through **Cloudflare**. Inbound traffic reaches the host through `cloudflared` (`docker/cloudflared/config.yml`). Production hostnames are routed through Cloudflare to Traefik, then to Docker services on `web` and `internal` networks.

*“Stability is the invisible foundation of luxury.”*
