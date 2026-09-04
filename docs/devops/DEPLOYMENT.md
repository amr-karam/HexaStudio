# 🛠️ DEVOPS: THE INFRASTRUCTURE BLUEPRINT

**Version:** 1.0 | **Scope:** Infrastructure | **Standard:** Immutable / Scalable / Secure

## 1. THE DEVOPS PHILOSOPHY
We treat infrastructure as **Code**. There are no "manual" server changes. Every environment (Dev, Stage, Prod) is a mirror image, defined in version control and deployed automatically.

---

## 2. THE CONTAINER STRATEGY (Docker & K8s)

### I. Image Optimization
- **Multi-Stage Builds:** Use multi-stage Dockerfiles to keep production images lean.
- **Alpine Base:** Prefer `alpine` or `distroless` images to reduce the attack surface.
- **Caching:** Optimize Docker layer caching to ensure fast build times.

### II. Orchestration
- **Docker Compose:** Used for local development and small-scale staging.
- **Traefik v3:** The entry point for all traffic. Handles SSL (Let's Encrypt), Load Balancing, and Path Routing.

---

## 3. THE DEPLOYMENT PIPELINE (CI/CD)

### I. The Git-Flow Pipeline
- **`develop` Branch:** Auto-deploys to the `staging` environment on every push via GitLab CI/CD.
- **`main` Branch:** Manual trigger (with approval gate) for production deployment via GitLab CI/CD.
- **Feature branches:** CI pipeline runs quality gates only (no deploy).

### II. The Deployment Sequence
1. **Lint & Test:** Run `npm run lint` and `vitest`.
2. **Build:** Create Docker images and push to the registry.
3. **Deploy:** Update the container images in the environment.
4. **Health Check:** Verify the `/health` endpoint before switching traffic.

---

## 4. OBSERVABILITY & MONITORING

### I. The Monitoring Stack
- **Prometheus:** Collects time-series metrics (CPU, RAM, Request Rate).
- **Grafana:** Visualizes the metrics in real-time dashboards.
- **Loki & Promtail:** Centralized logging for all containers.
- **Sentry:** Real-time error tracking and alerting.

### II. The Alerting Policy
- **Critical (P0):** Site down or 5xx error spike $\rightarrow$ Immediate PagerDuty/Slack alert.
- **Warning (P1):** High latency or memory leak $\rightarrow$ Ticket created in `OPEN_TASKS.md`.

---

## 5. QUALITY GATE: DEVOPS AUDIT
A deployment is "DevOps-Done" only when:
- [ ] The build is fully automated (zero manual steps).
- [ ] The infrastructure is defined as code (Docker/Compose).
- [ ] The monitoring dashboard is active and reporting data.
- [ ] The backup and recovery plan is tested and verified.

---

## 6. DNS MANAGEMENT (Hostinger)

DNS records for `hexastudio.net` are managed via **Cloudflare** (proxy orange cloud for CDN + WAF). All production DNS, SSL, and edge routing is configured through the Cloudflare dashboard + `cloudflared` tunnel (`4137e139` tunnel at `19.16.1.100`).

*“Stability is the invisible foundation of luxury.”*
