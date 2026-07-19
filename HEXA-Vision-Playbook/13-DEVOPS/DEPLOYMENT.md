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
- **Develop Branch:** Auto-deploys to the `dev` environment on every merge.
- **Stage Branch:** Auto-deploys to the `stage` environment after QA approval.
- **Main Branch:** Manual trigger for production deployment.

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

DNS records for `hexastudio.net` are managed via the Hostinger API using `scripts/update-dns.sh`.

### Environment Requirements
The script reads from the repo root `.env` (gitignored):

```env
HOSTINGER_API_KEY=your_hostinger_api_key_here
DNS_DOMAIN=hexastudio.net
SERVER_IP=19.16.1.100
```

### Security
- **Never commit the API key.** The old hardcoded key was removed from `scripts/update-dns.sh`.
- Store `HOSTINGER_API_KEY` only in `.env` on the server or in your password manager.
- Rotate the key in Hostinger → re-import API clients → update `.env` on all environments.

### Running the Update
```bash
bash scripts/update-dns.sh
```

The script will fail fast with a clear error if `HOSTINGER_API_KEY` is not set.

*“Stability is the invisible foundation of luxury.”*
