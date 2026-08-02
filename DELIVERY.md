# 🚀 HEXA STUDIO — DELIVERY & DEVOPS GOVERNANCE

**Version:** 1.0.0  
**Authority Level:** 10  
**Scope:** GitLab CE CI/CD Pipelines, Docker Compose Production, Traefik Ingress, & Release Protocol  

---

## 1. GITLAB CE SOURCE OF TRUTH

- **DevOps Platform**: GitLab CE is the single source of truth for repository management, issues, merge requests, container registry, and CI/CD pipelines.
- **Merge Request (MR) Guard**: Pushing directly to protected `main`/`master` branches is forbidden. All code changes MUST be submitted via GitLab Merge Requests and pass `.gitlab-ci.yml` pipeline checks.

---

## 2. PRODUCTION INGRESS & DEPLOYMENT

- **Proxy**: **Traefik v3** with Cloudflared tunnel integration. Nginx is not used.
- **Docker Compose**: Production services managed via `docker-compose.prod.yml`.
- **Zero-Downtime Swaps**: Container builds use blue/green deployment patterns (`hexa-frontend-blue`, `hexa-backend-blue`).
- **Deploy Script**: Remote commands executed via SSH key authenticated script [`deploy.py`](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/deploy.py).
