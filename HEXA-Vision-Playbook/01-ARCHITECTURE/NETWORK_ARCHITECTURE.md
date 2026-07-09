# Network Architecture

**Last Updated:** 2026-07-08

---

## Network Segmentation

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET                                     │
│  Users, CDN, WAF, DNS (Cloudflare), Monitoring Access               │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PUBLIC NETWORK (DMZ)                            │
│  Ports open: 80 (HTTP→HTTPS), 443 (HTTPS), 22 (SSH, restricted IP) │
│                                                                      │
│  Services exposed:                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Traefik │  │ Frontend │  │ Backend  │  │  Grafana │            │
│  │  :80/443 │  │  :3000   │  │  :4000   │  │  :3001   │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                            │
                    (Docker internal network)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      INTERNAL NETWORK                                │
│  No public access. Inter-service communication only.                 │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │PostgreSQL│  │  Redis   │  │  MinIO   │  │  Strapi  │            │
│  │  :5432   │  │  :6379   │  │  :9000   │  │  :1337   │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                           │
│  │   Odoo   │  │Prometheus│  │   Loki   │                           │
│  │  :8069   │  │  :9090   │  │  :3100   │                           │
│  └──────────┘  └──────────┘  └──────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
```

## DNS Configuration

| Record | Type | Value | Proxy |
|--------|------|-------|-------|
| `hexastudio.net` | A | Server IP | Cloudflare |
| `www.hexastudio.net` | CNAME | hexastudio.net | Cloudflare |
| `api.hexastudio.net` | A | Server IP | Cloudflare |
| `cms.hexastudio.net` | A | Server IP | Cloudflare (restricted) |
| `monitor.hexastudio.net` | A | Server IP | Cloudflare Access |
| `status.hexastudio.net` | A | Server IP | Cloudflare Access |
| `cdn.hexastudio.net` | CNAME | hexastudio.net | Cloudflare |

## Cloudflare WAF Rules

```yaml
rules:
  - description: "Block common attacks"
    action: block
    expressions:
      - http.request.uri.path contains "/wp-admin"
      - http.request.uri.path contains ".env"
      - http.request.uri.path contains "xmlrpc"
      - http.user_agent contains "sqlmap"

  - description: "Rate limit API"
    action: block
    characteristics: [cf.unique_id]
    rate_limit:
      requests_per_period: 100
      period: 60

  - description: "Block non-browser access to frontend"
    action: block
    expressions:
      - http.host eq "hexastudio.net"
      - not cf.client.bot
      - http.user_agent not matches "(Mozilla|Chrome|Safari|Firefox)"
```

## Traefik Configuration

```yaml
# traefik/traefik.yml
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@hexastudio.net
      storage: /acme/acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false

# Middleware
http:
  middlewares:
    security-headers:
      headers:
        frameDeny: true
        sslRedirect: true
        browserXssFilter: true
        contentTypeNosniff: true
        forceSTSHeader: true
        stsIncludeSubdomains: true
        stsPreload: true
        stsSeconds: 31536000
        customFrameOptionsValue: "SAMEORIGIN"
```

## Service Exposure Rules

| Service | Public? | Auth Required | Rate Limit |
|---------|---------|--------------|------------|
| Frontend (hexastudio.net) | Yes | No | 100/min |
| API (api.hexastudio.net) | Yes | JWT (most endpoints) | 100/min |
| Grafana (monitor.hexastudio.net) | Cloudflare Access | SSO | — |
| Uptime Kuma (status.hexastudio.net) | Cloudflare Access | SSO | — |
| Strapi Admin | No (internal only) | — | — |
| Odoo | No (internal only) | — | — |
| PostgreSQL | No (internal only) | — | — |
| Redis | No (internal only) | — | — |
| MinIO | No (internal only) | — | — |
