# 🌐 CONTEXT: Environments Matrix

| Environment | Hosts | Ingress | Configuration |
|-------------|-------|---------|---------------|
| **Local Dev** | `localhost:3000` (FE), `localhost:4000` (BE) | Local Node / Traefik | `docker-compose.yml` |
| **Staging** | `staging.hexastudio.net` | Traefik v3 + Cloudflared | `docker-compose.staging.yml` |
| **Production** | `hexastudio.net`, `portal.hexastudio.net`, `api.hexastudio.net` | Traefik v3 + Cloudflared | `docker-compose.prod.yml` |
