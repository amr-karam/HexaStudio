# ⚖️ TRAFFIC DISTRIBUTION & LOAD BALANCING STANDARDS

**Version:** 1.0.0 | **Scope:** Production Traffic Management | **Standard:** Layer 7 Dynamic Load Balancing

---

## 1. OVERVIEW & STRATEGY

HEXA Vision utilizes **Layer 7 (Application Layer)** load balancing to distribute incoming user connections, handle zero-downtime rolling deployments, manage blue/green deployment switches, and buffer against traffic spikes.

---

## 2. LOAD BALANCING TOPOLOGY

```
                        ┌──────────────────────────────┐
                        │      CLOUDFLARE ANYCAST      │
                        │    (Layer 4/7 Edge Proxy)    │
                        └──────────────┬───────────────┘
                                       │
                        ┌──────────────▼───────────────┐
                        │     TRAEFIK v2.11 INGRESS    │
                        │     (Layer 7 Load Balancer)  │
                        └──────────────┬───────────────┘
                                       │
               ┌───────────────────────┴───────────────────────┐
               │ Round-Robin Weighting & Health Check Routing │
               └──────────────┬─────────────────┬──────────────┘
                              │                 │
                     ┌────────▼────────┐   ┌────▼────────────┐
                     │ Backend Slot A  │   │ Backend Slot B  │
                     │ (blue: port 4000)│   │ (green: port 4001)
                     └─────────────────┘   └─────────────────┘
```

---

## 3. TRAEFIK LOAD BALANCING POLICIES (`docker/traefik/dynamic.yml`)

### A. Round-Robin Load Balancing
Traefik balances requests across active backend container replicas:
```yaml
http:
  services:
    backend-service:
      loadBalancer:
        method: wrr
        healthCheck:
          path: /api/health
          interval: 10s
          timeout: 3s
        responseForwarding:
          flushInterval: 100ms
```

### B. Sticky Sessions (Client Portal & WebSockets)
For WebSocket connections (`/realtime` collab room) and Client Portal state, Traefik enforces cookie-based session stickiness:
```yaml
        sticky:
          cookie:
            name: hexa_lb_sticky
            secure: true
            httpOnly: true
```

---

## 4. ZERO-DOWNTIME BLUE/GREEN SWITCHING (`deploy-zero-downtime.sh`)

During production deployment:
1. New container slot (`hexa-backend-green`) starts on secondary port.
2. Traefik performs health check (`GET /api/health`).
3. Once healthy, Traefik updates dynamic router weights (100% traffic to `green`).
4. Old slot (`hexa-backend-blue`) terminates gracefully after draining existing connections.

---

## 5. OPERATIONAL COMMANDS

```bash
# Verify active load balancer service endpoints
curl -s http://localhost:8080/api/http/services | jq .

# Test zero-downtime deployment script locally
bash scripts/deploy-zero-downtime.sh
```

---

## 6. RELATED DOCUMENTATION

- [NGINX.md](NGINX.md) — Reverse proxy settings.
- [DEPLOYMENT.md](DEPLOYMENT.md) — Deployment scripts.
- [CLOUDFLARE_CACHE.md](CLOUDFLARE_CACHE.md) — Edge caching rules.
