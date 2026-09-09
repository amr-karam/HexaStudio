# 🌐 REVERSE PROXY & EDGE ROUTING STANDARDS (TRAEFIK & CLOUDFLARE)

**Version:** 1.1.0 | **Scope:** Ingress & Proxy Routing | **Standard:** Traefik v3 + Cloudflare Tunnel

---

## 1. OVERVIEW & ROUTING PARADIGM

HEXA Vision employs **Traefik v3** as its primary cloud-native edge proxy and ingress controller. Traefik auto-discovers containers via Docker socket labels, handles TLS certificate generation via Cloudflare, terminates SSL, enforces security middlewares, and proxies traffic to Next.js Frontend (`:3000`), NestJS Backend (`:4000`), Strapi CMS (`:1337`), MinIO (`:9000`), Grafana (`:3000`), and Odoo (`:8069`).

---

## 2. ROUTING ARCHITECTURE & DOMAINS

```
                       ┌─────────────────────────────────┐
                       │   CLOUDFLARE WAF / CDN EDGE     │
                       └────────────────┬────────────────┘
                                        │ (Ports 80 / 443)
                       ┌────────────────▼────────────────┐
                       │        TRAEFIK v3 INGRESS        │
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
| `hexastudio.net` | `frontend` | 3000 | Cloudflare | Strict Security Headers, Compression |
| `api.hexastudio.net` | `backend` | 4000 | Cloudflare | CORS Guard, Rate Limit (100 req/min) |
| `cms.hexastudio.net` | `cms` | 1337 | Cloudflare | Admin IP Allowlist, Frame Ancestors |
| `grafana.hexastudio.net` | `grafana` | 3000 | Cloudflare | Basic Auth, Admin IP Allowlist |
| `traefik.hexastudio.net` | `traefik` (API) | 8080 | Cloudflare | Basic Auth, IP Allowlist (`api.insecure: false`) |

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
        period: 1m
```

---

## 4. DOCKER LABEL ROUTING EXAMPLES

Frontend label configuration in `docker-compose.prod.yml`:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.frontend.rule=Host(`hexastudio.net`)"
  - "traefik.http.routers.frontend.entrypoints=websecure"
  - "traefik.http.routers.frontend.tls.certresolver=cloudflare"
  - "traefik.http.routers.frontend.middlewares=security-headers@file,gzip-compress@file"
  - "traefik.http.services.frontend.loadbalancer.server.port=3000"
```

---

## 5. CLOUDFLARE TUNNEL INGRESS

Cloudflare Tunnel replaces public port exposure. Ingress rules map hostnames to Traefik:

```yaml
# docker/cloudflared/config.yml
tunnel: <tunnel-uuid>
ingress:
  - hostname: hexastudio.net
    service: http://traefik:80
  - hostname: www.hexastudio.net
    service: http://traefik:80
  - hostname: api.hexastudio.net
    service: http://traefik:80
  - hostname: cms.hexastudio.net
    service: http://traefik:80
  - hostname: grafana.hexastudio.net
    service: http://traefik:80
  - hostname: traefik.hexastudio.net
    service: http://traefik:80
  - service: http_status:404
```

---

## 6. OPERATIONAL COMMANDS

```bash
# Check Traefik configuration syntax
docker exec -it hexastudio-traefik-1 traefik healthcheck

# Inspect live router rules in Traefik CLI / dashboard
curl -u admin:password http://localhost:8080/api/rawdata

# Reload dynamic YAML configuration without container restart
touch docker/traefik/dynamic.yml
```

---

## 7. RELATED DOCUMENTATION

- [SSL.md](SSL.md) — TLS certificate management.
- [LOAD_BALANCING.md](LOAD_BALANCING.md) — Traffic distribution rules.
- [CLOUDFLARE_CACHE.md](CLOUDFLARE_CACHE.md) — Edge caching policies.
- [GITLAB_MIGRATION.md](GITLAB_MIGRATION.md) — CI/CD migration notes.
