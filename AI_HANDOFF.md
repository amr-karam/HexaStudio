# AI HANDOFF — HexaStudio Project State
**Last Updated:** July 06, 2026

This file enables any AI agent to pick up work exactly where the last agent stopped.

---

## 1. PROJECT ESSENCE

**HexaStudio** (HexaStudio.net) = 3D architecture visualization platform with Next.js 15 frontend, NestJS backend (BFF), Strapi 5 CMS, Docker Compose infra (14 services), and "Awwwards-level" luxury aesthetic.

**Monorepo:** `apps/{frontend,backend,cms}` + `packages/{types,utils}` + `docker/` + `scripts/`

---

## 2. LAST SESSION: What Was Accomplished (July 06)

### Infrastructure & Deployment
- **Traefik downgraded** v3.4.5 → v2.11 for Docker API version compatibility
- **All 14 services stable** — traefik, postgres, redis, minio, backend, frontend, cms, monitoring stack all passing
- **Hardcoded passwords removed** from `apps/cms/config/database.ts` and duplicate Traefik configs cleaned

### DNS & Cloudflare Migration
- **DNS fixed via Hostinger API** — A records updated for `@`, `api`, `cms`, `traefik` → `156.206.135.186`
- **Cloudflare account created** — Zone `hexastudio.net` added (zone ID `214e4603a28f73d7279946baf820f5ed`)
- **Nameservers changed** — Hostinger `ns1.dns-parking.com` → Cloudflare `kip.ns.cloudflare.com` / `lara.ns.cloudflare.com`
- **All DNS records migrated** — A, CNAME tunnel records, MX/SPF/DKIM/DMARC/Zeptomail/Google verification all recreated in Cloudflare

### Cloudflare Tunnel
- **Cloudflare Tunnel installed** — `cloudflared` running as systemd service
- **2 connections active** — via `mrs06`, `mrs04` (protocol HTTP/2, token-based auth)
- **Port forwarding eliminated** — Tunnel connects to `http://localhost:80`, bypassing NAT entirely
- **Traefik updated** — HTTP→HTTPS redirect removed from web entrypoint, `web` entrypoint added to all routers

### Let's Encrypt Certificates
- **DNS-01 challenge configured** — Cloudflare API provider in Traefik
- **All 5 certificates issued:**
  - `hexastudio.net` + 1 SAN (`www.hexastudio.net`)
  - `api.hexastudio.net`, `cms.hexastudio.net`, `opencode.hexastudio.net`, `ai.hexastudio.net`
- **Certs valid** Jul 6 – Oct 4 2026 (Let's Encrypt YR1)
- **Public verification** — `hexastudio.net` returns 200 OK with valid LE cert through Cloudflare

### E2E Testing
- **Playwright scaffolded** — `e2e/playwright.config.ts` + `e2e/pages.spec.ts`
- **Tests cover** — navigation, all pages load, 404 handling, SEO metadata, accessibility skip-link
- **Scripts added** — `test:e2e` and `test:e2e:ui` to `package.json`

### Code & Docs
- **5 new commits** today (Traefix fixes, security fixes, tests, E2E, `.agents` fix)
- **`.agents/skills/gemini-skills`** — converted from broken submodule to tracked files
- **`stage` → `main`** — merged and pushed to GitHub
- **Local configs synced** — `docker-compose.prod.yml`, `traefik.yml`, `dynamic.yml` all match server
- **Self-signed cert files removed** from server and compose mounts
- **`.env.example`** — added `CLOUDFLARE_EMAIL` / `CLOUDFLARE_API_KEY`
- **BLOCKING_ISSUES.md, RELEASE_DECISION.md, CHANGELOG.md, IMPLEMENTATION_ROADMAP.md** — updated
- **QUALITY_SCORECARD.md** — scores updated (Architecture 8, Code Quality 8, Security 7, Documentation 9, SEO 8)

---

## 3. IMMEDIATE NEXT STEPS (Priority Order)

### [1] Secure Traefik Dashboard (B8)
- `api.insecure: true` exposes port 8080 without auth
- Fix: add basic auth middleware or set `api.insecure: false` + internal network only

### [2] Optimize JS Bundle (B9)
- 578kB first-load JS vs 200kB budget
- Fix: dynamic import Three.js/GSAP, lazy-load below-the-fold sections

### [3] Full Playwright Test Integration
- E2E scaffold exists but not run in CI
- Add `playwright` step to `.github/workflows/ci.yml`
- Run tests in headless Chromium against built frontend

### [4] Production Rebuild
- Pull latest `main` on server
- `docker compose build --no-cache frontend backend`
- `docker compose up -d`

### [5] Quality Gate Re-Evaluation
- Run AGENTS.md §46 checklist
- Previous score: 8.5/10 (quality gate approval pending)

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
