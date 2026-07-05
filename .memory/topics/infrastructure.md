# Infrastructure

- 2026-07-05 — Production server 19.16.1.100 (public: 156.206.135.186). 14 Docker services running, all 7 health checks passing.
- 2026-07-05 — Nginx stopped (blocked Traefik on port 80). PostgreSQL volume recreated. MinIO health check fixed (wget→curl). Watchtower pinned to 1.7.1 + DOCKER_API_VERSION=1.40.
- 2026-07-05 — Traefik route configured for opencode.hexastudio.net → 172.20.0.1:4096 with Let's Encrypt. DNS A record added at Hostinger.
- 2026-07-05 — OpenCode CLI v1.17.13 installed, systemd service on port 4096, config at /root/.config/opencode/opencode.json.
- 2026-07-05 — Deploy script at /opt/scripts/deploy.sh with Docker-based health checks (node fetch).
