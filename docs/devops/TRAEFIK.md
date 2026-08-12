# 🌐 REVERSE PROXY & EDGE ROUTING STANDARDS (TRAEFIK V3)

**Version:** 3.0.0 | **Scope:** Ingress & Edge Routing | **Standard:** Dynamic Traefik v3 / Cloudflared Ingress

---

## 1. OVERVIEW & ROUTING PARADIGM

HEXA Vision uses **Traefik v3** as its exclusive cloud-native edge proxy and ingress controller. Nginx is not used. Traefik auto-discovers containers via Docker socket labels, handles Let's Encrypt TLS certificate generation, terminates SSL, enforces security middlewares, and proxies traffic to Next.js Frontend (`:3000`), NestJS Backend (`:4000`), Strapi CMS (`:1337`), MinIO (`:9000`), Grafana (`:3000`), and Odoo 17 (`:8069`).

---

## 2. ROUTING ARCHITECTURE & DOMAINS

```
                       ┌─────────────────────────────────┐
                       │   CLOUDFLARE WAF / TUNNEL EDGE  │
                       └────────────────┬────────────────┘
                                        │ (Cloudflared / Ports 80/443)
                       ┌────────────────▼────────────────┐
                       │       TRAEFIK v3 INGRESS        │
                       └────────┬───────────────┬────────┘
                                │               │
          ┌─────────────────────┴───────┐   ┌───┴────────────────────────┐
          │ Host: hexastudio.net        │   │ Host: api.hexastudio.net   │
          │ Router: frontend            │   │ Router: backend            │
          └──────────────┬──────────────┘   └───────────┬────────────────┘
                         │                              │
                ┌────────▼────────┐            ┌────────▼────────┐
                │ Next.js Frontend│            │   NestJS BFF    │
                │     (:3000)     │            │     (:4000)     │
                └─────────────────┘            └─────────────────┘
```

| Hostname | Destination Service | Port | TLS Certificate | Middleware Policy |
|----------|---------------------|------|-----------------|-------------------|
| `hexastudio.net` | `frontend` | 3000 | Let's Encrypt / CF | Strict Security Headers, Compression |
| `portal.hexastudio.net` | `frontend` | 3000 | Let's Encrypt / CF | Client Portal Ingress, Security Headers |
| `api.hexastudio.net` | `backend` | 4000 | Let's Encrypt / CF | CORS Guard, Rate Limit (100 req/min) |
| `cms.hexastudio.net` | `cms` | 1337 | Let's Encrypt / CF | Admin IP Allowlist, Frame Ancestors |
| `odoo.hexastudio.net` | `odoo` | 8069 | Let's Encrypt / CF | ERP Webhook Guard, SSL Termination |
| `grafana.hexastudio.net` | `grafana` | 3000 | Let's Encrypt / CF | Basic Auth, Admin IP Allowlist |
| `traefik.hexastudio.net` | `traefik` (API) | 8080 | Let's Encrypt / CF | Basic Auth, IP Allowlist (`api.insecure: false`) |

---

## 3. TRAEFIK MIDDLEWARE CONFIGURATION (`docker/traefik/dynamic.yml`)

> **Authoritative config:** `docker/traefik/dynamic.yml`. The examples below are the **actual implemented** middlewares (verified 2026-08-08).

### A. Security Headers Middleware (`security-headers`)
Applied at the proxy edge to every non-frontend router (backend, CMS, Odoo, MinIO, Grafana, Prometheus, Alertmanager, Uptime Kuma, AI/Auth/Analytics/Hub/Docs/Status). The Next.js frontend is **exempt** — it sets its own tailored CSP in `next.config.ts` (avoids duplicate headers).

```yaml
    security-headers:
      headers:
        customResponseHeaders:
          Strict-Transport-Security: "max-age=31536000; includeSubDomains; preload"
          X-Content-Type-Options: "nosniff"
          X-Frame-Options: "SAMEORIGIN"
          Referrer-Policy: "strict-origin-when-cross-origin"
          Permissions-Policy: "camera=(), microphone=(), geolocation=(), xr-spatial-tracking=(self)"
          Content-Security-Policy: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
```

### B. Basic Auth Middleware (`traefik-auth`)
Protects the Traefik dashboard and Alertmanager UI. Credentials are **env-var referenced — no hardcoded defaults** (PHASE 10 remediation; no default fallback):

```yaml
    traefik-auth:
      basicAuth:
        users:
          - "${TRAEFIK_AUTH_USER}:${TRAEFIK_AUTH_HASH}"
```

Generate the bcrypt hash: `htpasswd -nbB admin '<password>'` → set `TRAEFIK_AUTH_USER` / `TRAEFIK_AUTH_HASH` in `.env` (see `.env.example`).

### C. Forwarded Headers Middleware (`forwarded-headers`)
Used on the Odoo router to normalize the scheme behind Cloudflare:

```yaml
    forwarded-headers:
      headers:
        customRequestHeaders:
          X-Forwarded-Proto: "https"
          X-Forwarded-Ssl: "on"
```

---

## 3.5 TLS HARDENING (`docker/traefik/traefik.yml`)

- **TLS 1.2 minimum** enforced globally via a default TLS options block (AES-GCM + ChaCha20-Poly1305 suites only).
- **Dashboard API not insecure:** `api.insecure: false` — the dashboard is reachable only via the `traefik-dashboard` router (web entrypoint, `traefik-auth@file` basic-auth).
- GitLab is exempt from proxy TLS (TLS terminated at the Cloudflare edge) and is not exposed on `websecure`.

---

## 4. DOCKER CONTAINER LABELS PATTERN

Every container registered with Traefik must declare routing rules in `docker-compose.prod.yml`:

```yaml
  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`hexastudio.net`) || Host(`portal.hexastudio.net`)"
      - "traefik.http.routers.frontend.entrypoints=web"
      - "traefik.http.routers.traefik-dashboard.service=api@internal"
      - "traefik.http.routers.traefik-dashboard.middlewares=traefik-auth@file"
      - "traefik.http.services.frontend.loadbalancer.server.port=3000"
```

> **Note:** dynamic routing for all app services is declared in `docker/traefik/dynamic.yml` (file provider) — middleware policy for backend/CMS/Odoo/MinIO/monitoring is `security-headers@file` (see §3).

---

## 5. QUALITY GATES & VERIFICATION

```bash
# Verify Traefik configuration syntax
docker compose -f docker-compose.prod.yml exec traefik traefik healthcheck

# Check active Traefik routers & services
curl -u admin:password https://traefik.hexastudio.net/api/http/routers
```
