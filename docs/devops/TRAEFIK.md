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

### A. Security Headers Middleware (`security-headers`)
```yaml
http:
  middlewares:
    security-headers:
      headers:
        stsSeconds: 63072000
        stsIncludeSubdomains: true
        stsPreload: true
        frameDeny: true
        contentTypeNosniff: true
        browserXssFilter: true
        referrerPolicy: "strict-origin-when-cross-origin"
        permissionsPolicy: "camera=(), microphone=(), geolocation=()"
```

### B. Rate Limiting Middleware (`rate-limit`)
```yaml
    rate-limit:
      rateLimit:
        average: 100
        burst: 50
```

### C. Gzip & Brotli Compression (`gzip-compress`)
```yaml
    gzip-compress:
      compress:
        excludedContentTypes:
          - "image/jpeg"
          - "image/png"
          - "image/webp"
          - "application/pdf"
```

---

## 4. DOCKER CONTAINER LABELS PATTERN

Every container registered with Traefik must declare routing rules in `docker-compose.prod.yml`:

```yaml
  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`hexastudio.net`) || Host(`portal.hexastudio.net`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=cloudflare"
      - "traefik.http.routers.frontend.middlewares=security-headers@file,gzip-compress@file"
      - "traefik.http.services.frontend.loadbalancer.server.port=3000"
```

---

## 5. QUALITY GATES & VERIFICATION

```bash
# Verify Traefik configuration syntax
docker compose -f docker-compose.prod.yml exec traefik traefik healthcheck

# Check active Traefik routers & services
curl -u admin:password https://traefik.hexastudio.net/api/http/routers
```
