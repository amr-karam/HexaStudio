# AI HANDOFF — HexaStudio Project State
**Last Updated:** July 05, 2026

This file enables any AI agent to pick up work exactly where the last agent stopped.

---

## 1. PROJECT ESSENCE

**HexaStudio** (HexaStudio.net) = 3D architecture visualization platform with Next.js 15 frontend, NestJS backend (BFF), Strapi 5 CMS, Docker Compose infra (14 services), and "Awwwards-level" luxury aesthetic.

**Monorepo:** `apps/{frontend,backend,cms}` + `packages/{types,utils}` + `docker/` + `scripts/`

---

## 2. LAST SESSION: What Was Accomplished

### Infrastructure & Deployment
- **Nginx stopped** on production server — was blocking Traefik on port 80
- **PostgreSQL volume recreated** — old credentials were incompatible
- **MinIO health check fixed** — replaced `wget` with `curl` in container
- **Backup container fixed** — base image changed from `alpine` to `postgres:16-alpine` (had no `pg_dump`)
- **CMS fix** — Added `DATABASE_URL` env var to match Strapi 5 config (was using individual fields)
- **Deploy script health checks fixed** — replaced `localhost` curl with Docker exec `node -e fetch()`
- **Redis health check fixed** — added `REDIS_PASSWORD` auth
- **Watchtower fixed** — pinned `containrrr/watchtower:1.7.1` + set `DOCKER_API_VERSION=1.40`
- **All 14 containers running** + all 7 health checks passing

### Brand & Design
- **Real logo deployed** — `logo.webp` from client (replaced SVG approximation)
- **Favicon updated** — `favicon.webp`
- **All logo references updated** — Navbar, Footer, LoadingScreen, layout.tsx, StructuredData

### MCP Server
- **Local dev MCP server** — Created `scripts/mcp/` with server.js + package.json
- **Local opencode.json updated** — Added `dev-server-local` pointing to `localhost:3001`

### Production Server (19.16.1.100)
- **OpenCode CLI installed** — v1.17.13 at `/root/.opencode/bin/opencode`
- **OpenCode Server installed** — systemd service on port 4096, starts on boot
- **Traefik route configured** — `opencode.hexastudio.net` → `172.20.0.1:4096` with Let's Encrypt
- **DNS record added** — Hostinger API: `opencode A 156.206.135.186`
- **OpenCode server config** — `/root/.config/opencode/opencode.json` → localhost:3001 MCP

### Code & Docs
- **All changes committed** to `stage` branch (49 files, 3123 insertions)
- **Git push pending** — needs GitHub auth
- **Synced server configs back to local** — deploy.sh, .env, dynamic.yml
- **AI_CONTEXT.md, AI_HANDOFF.md, CHANGELOG.md** — updated to reflect latest state

---

## 3. IMMEDIATE NEXT STEPS (Priority Order)

### [1] Push to GitHub
- `git push origin stage` — hangs waiting for GitHub credentials
- Use `gh auth login` or personal access token

### [2] SSL Certificate for opencode.hexastudio.net
- DNS `A` record added → `156.206.135.186`
- Traefik configured with `certResolver: letsencrypt`
- Need DNS propagation → restart Traefik → Let's Encrypt issues cert
- Alternative: use SSH tunnel (`ssh -L 4096:localhost:4096 root@19.16.1.100`) + localhost

### [3] Production Rebuild
- Pull latest code on server or scp source files
- `docker compose build --no-cache frontend backend`
- `docker compose up -d`

### [4] Phase 5 Completion
- Per IMPLEMENTATION_ROADMAP.md:
  - Visual Regression Testing
  - Lighthouse Audit (target >95)
  - SEO Finalization (mostly done)
  - Launch Readiness (Sentry OK, backups OK, Cloudflare WAF pending)

### [5] Quality Gate Review
- Run AGENTS.md §46 checklist
- Generate reports (QUALITY_GATE_REPORT.md, etc.)

---

## 4. SERVER CONNECTION DETAILS

| Field | Value |
|-------|-------|
| SSH | `root@19.16.1.100` (public IP: 156.206.135.186) |
| Project path | `/opt` |
| Deploy script | `/opt/scripts/deploy.sh <status\|start\|stop\|restart\|logs\|...>` |
| OpenCode CLI | `/root/.opencode/bin/opencode` |
| MCP Server | `http://localhost:3001` (Docker container `mcp-server`) |
| OpenCode Server | `http://localhost:4096` (systemd, password-protected) |
| Docker compose | `cd /opt && docker compose up -d` |

### Key server files:
```bash
# Check service status
/opt/scripts/deploy.sh status

# View logs
/opt/scripts/deploy.sh logs frontend

# Rebuild & deploy
cd /opt && docker compose build --no-cache frontend && docker compose up -d

# OpenCode server
systemctl status opencode-server
systemctl restart opencode-server

# Traefik config (dynamic routes)
/opt/docker/traefik/dynamic.yml

# Environment
/opt/.env
```

---

## 5. KNOWN ISSUES

| Issue | Severity | Status |
|-------|----------|--------|
| SSL cert for `opencode.hexastudio.net` pending DNS propagation | Medium | Waiting |
| `git push` hangs (no GitHub auth) | Medium | Manual step |
| Server Node v24 (Strapi needs <=22) | Medium | Works for now |
| No tests (unit/integration/E2E) | Critical | Must add |
| Disk space on server — needs monitoring | Low | OK for now |

---

## 6. AGENTS.MD CRITICAL SECTIONS

- **§37** UI Review Requirements (score 1-10 before merging)
- **§38** Brand Guardian (reject generic/cheap/outdated)
- **§46** Quality Gate Controller (final approval authority)

---

## 7. HANDOFF CHECKLIST FOR NEXT AGENT

- [ ] Read this file completely
- [ ] Read `AGENTS.md` completely
- [ ] Push to GitHub (authenticate with gh CLI or PAT)
- [ ] Verify SSL certificate for `opencode.hexastudio.net`
- [ ] Rebuild frontend/backend on server with latest code
- [ ] Run Lighthouse audit
- [ ] Run Quality Gate review
- [ ] Fix Node.js version for Strapi (nvm or volta)
- [ ] Add tests
- [ ] Update this file when done
