# 🌐 REVERSE PROXY & EDGE ROUTING STANDARDS (TRAEFIK & NGINX)

**Version:** 1.0.0 | **Scope:** Ingress & Proxy Routing | **Standard:** Dynamic Traefik v2.11 / Nginx Edge Proxy

---

## 1. OVERVIEW & ROUTING PARADIGM

HEXA Vision employs **Traefik v2.11** as its primary cloud-native edge proxy and ingress controller. Traefik auto-discovers containers via Docker socket labels, handles Let's Encrypt TLS certificate generation, terminates SSL, enforces security middlewares, and proxies traffic to Next.js Frontend (`:3000`), NestJS Backend (`:4000`), Strapi CMS (`:1337`), MinIO (`:9000`), Grafana (`:3000`), and Odoo (`:8069`).

---

## 2. ROUTING ARCHITECTURE & DOMAINS

```
                       ┌─────────────────────────────────┐
                       │   CLOUDFLARE WAF / CDN EDGE     │
                       └────────────────┬────────────────┘
                                        │ (Ports 80 / 443)
                       ┌────────────────▼────────────────┐
                       │        TRAEFIK v2.11 INGRESS    │
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
| `api.hexastudio.net` | `backend` | 4000 | Let's Encrypt / CF | CORS Guard, Rate Limit (100 req/min) |
| `cms.hexastudio.net` | `cms` | 1337 | Let's Encrypt / CF | Admin IP Allowlist, Frame Ancestors |
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

## 5. NGINX LEGACY / FALLBACK PROXY PATTERN

When Nginx is used in standalone legacy deployments, configuration must mirror Traefik's security profile:
```nginx
server {
    listen 443 ssl http2;
    server_name hexastudio.net;

    ssl_certificate /etc/letsencrypt/live/hexastudio.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hexastudio.net/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
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

- [SSL.md](SSL.md)) — TLS certificate management.
- [LOAD_BALANCING.md](LOAD_BALANCING.md)) — Traffic distribution rules.
- [CLOUDFLARE_CACHE.md](CLOUDFLARE_CACHE.md)) — Edge caching policies.
