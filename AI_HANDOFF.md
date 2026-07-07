# AI HANDOFF — HexaStudio Project State
**Last Updated:** July 07, 2026

This file enables any AI agent to pick up work exactly where the last agent stopped.

---

## 1. PROJECT ESSENCE

**HexaStudio** (HexaStudio.net) = 3D architecture visualization platform with Next.js 15 frontend, NestJS backend (BFF), Strapi 5 CMS, Docker Compose infra (14 services), and "Awwwards-level" luxury aesthetic.

**Monorepo:** `apps/{frontend,backend,cms}` + `packages/{types,utils}` + `docker/` + `scripts/`

---

## 2. LAST SESSION: What Was Accomplished (July 07 — Session 2)

### Full-Width Layout
- Removed `max-w-screen-2xl`/`max-w-5xl` from all pages (services, contact, about, blog, ProjectGrid, HeaderSection, HomeHero)
- Frontend lint + TypeScript check pass

### CMS Container Fixed (was blocking production)
- **3 root causes found and fixed:**
  1. Dockerfile runner stage — missing `COPY apps/cms/config ./config` (config files not in image)
  2. Database config — `username` → `user` (pg driver expects `user`, not `username`)
  3. Missing `public/uploads/` directory in Docker image
- Strapi 5.49.0 now running, connected to postgres, healthy on `/_health` (204)

### Infrastructure
- `.js` config files created for all 6 CMS configs (Strapi 5 only loads .js/.json)
- Automated SSH deployment via Python/paramiko (no local SSH key needed)
- Cloudflare cache purge failed — API key auth error (needs credential update)

## 2. LAST SESSION: What Was Accomplished (July 07)

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

### Latest Fixes (v0.9.1 - July 07 — 4 commits)
- **Full-width layout**: Removed `max-w-screen-2xl`/`max-w-5xl` from all pages (services, contact, about, blog, ProjectGrid, HeaderSection, HomeHero)
- **CMS Dockerfile**: Added COPY for config/ dir and mkdir for public/uploads/
- **Database config**: Fixed `username`→`user` for pg driver compatibility in Strapi 5
- **CMS running**: Strapi 5.49.0 connected to postgres, healthy on port 1337
- **SSH deploy**: Automated via WSL+paramiko Python script (no local SSH key needed)

### Latest Fixes (v0.9.0 - July 07 — 5 commits)
- **SSR Crash**: SmoothScroll wrapped in dynamic import, JSX comments stripped across all components
- **Framer Motion v12**: Replaced all `ease: 'var(--ease-out-expo)'` with inline `[0.16, 1, 0.3, 1]` cubic-bezier
- **Studio 404 Fixed**: `/studio` page now redirects to `/about`
- **Portfolio Grid Fix**: Reformatted `ProjectGrid.tsx`, fixed card hover overlays, responsive text sizing
- **Blog Fallback**: 3 hardcoded fallback articles display when CMS API fails
- **Font Size Polish**: `text-[11px]` → `text-xs`, `text-[9px]` → `text-[10px] md:text-xs` across UI
- **Dockerfile**: Pinned `framer-motion` in root deps; switched to `npm ci` for reproducible builds; added `wget`, `ARG/ENV` for `NEXT_PUBLIC_*`, `--no-audit --no-fund` flags

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

## 5. KNOWN ISSUES (Last Updated: July 07, 2026)

| Issue | Severity | Status |
|-------|----------|--------|
| SSL cert for `opencode.hexastudio.net` — issued, Traefik routing fixed (split HTTP/HTTPS routers) | Medium | ✅ Resolved |
| `git push` hangs — remote has proper PAT stored in URL, no hang | Medium | ✅ Resolved |
| Server Node.js v22.23.1 — compatible with Strapi 5 (v24 info was outdated) | None | ✅ No action needed |
| Tests — 14 backend tests exist and all pass | None | ✅ Already done |
| Disk space on server (82% used, 17G free) — needs monitoring | Low | Monitor |
| CMS container fails to start — fixed: Dockerfile missing config/ COPY, 'username'→'user' in DB config, missing public/uploads/ dir | High | ✅ Resolved |
| CI/CD — GitHub Actions billing lock prevents automated deployment | High | Needs billing fix |

---

## 6. AGENTS.MD CRITICAL SECTIONS

- **§37** UI Review Requirements (score 1-10 before merging)
- **§38** Brand Guardian (reject generic/cheap/outdated)
- **§46** Quality Gate Controller (final approval authority)

---

## 7. HANDOFF CHECKLIST FOR NEXT AGENT

- [x] Read this file completely
- [x] Read `AGENTS.md` completely
- [x] Push to GitHub (authenticate with gh CLI or PAT) — `gh` installed and authenticated
- [x] Verify SSL certificate for `opencode.hexastudio.net` — cert issued, routing works
- [x] Rebuild frontend on server with latest code — full-width layout fixes deployed
- [x] Fix CMS container startup (Dockerfile + config + uploads)
- [x] Run Lighthouse audit
- [ ] Run Quality Gate review
- [x] Fix Node.js version for Strapi — v22 already installed
- [x] Add tests — 14 backend tests exist and pass
- [x] Update this file when done
