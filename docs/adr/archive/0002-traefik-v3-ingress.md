# ADR 0002: Traefik v3 and Cloudflared as Exclusive Production Ingress

- **Status:** Accepted
- **Date:** 2026-07-15
- **Deciders:** DevOps Director, Infrastructure Architect

---

## 1. CONTEXT
Production microservices required a cloud-native ingress reverse proxy with automated Docker container discovery, TLS certificate management, strict security middleware, and zero-trust Cloudflare Tunnel ingress.

---

## 2. DECISION
We standardize on **Traefik v3** paired with **Cloudflared Tunnel** as the exclusive edge proxy and ingress controller for both local development (`docker-compose.yml`) and production (`docker-compose.prod.yml`). Nginx is completely superseded and disabled.

---

## 3. CONSEQUENCES
- **Positive:** Automated Docker label discovery; no static IP exposed to open internet; unified SSL certificate handling.
- **Trade-offs:** Traefik dynamic labels must be explicitly declared on all new microservices in `docker-compose.prod.yml`.
