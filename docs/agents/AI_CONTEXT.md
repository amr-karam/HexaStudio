# AI Context & Project State — HEXA Studio
**Last Updated:** July 07, 2026
**Status:** Phase 5 — Production Deployment Live → Final Polish

This file is the **primary entry point** for any AI agent joining the HEXA Studio project.

---

## 1. Project Essence
HEXA Studio is a luxury 3D Architecture Visualization platform.

**Core Mantra:** *Design First. Quality over Speed. Cinematic Experience.*

---

## 2. Knowledge Map (Read Order)
1. **`PROJECT_DIRECTIVE.md`** — The "North Star"
2. **`AGENTS.md`** — The "Operating Manual" (46 sections)
3. **`IMPLEMENTATION_ROADMAP.md`** — The "Tactical Plan"
4. **`AI_CONTEXT.md`** (This file) — The "Current State"
5. **`IMPROVEMENT_ROADMAP.md`** — Sprint tracking

---

## 3. Technical Blueprint
### Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS 4, Framer Motion, GSAP, Three.js / R3F
- **Backend**: NestJS (BFF Pattern), PostgreSQL 16, Redis 7
- **CMS**: Strapi 5
- **Infrastructure**: Docker Compose, Traefik v3, MinIO, Prometheus/Grafana/Loki
- **Deployment**: Production at 19.16.1.100 (public IP 156.206.135.186)

### Architecture
- **Monorepo**: `apps/{frontend,backend,cms}` + `packages/{types,utils}` + `docker/` + `scripts/`
- **Networks**: `hexa_web` (public), `hexa_data` (internal), `hexa_monitoring`
- **14 Docker services**: traefik, postgres, redis, minio, backend, frontend, cms, prometheus, grafana, loki, promtail, node-exporter, watchtower, backup

---

## 4. Current Progress (What's Done)

### Phase 1-4: Design System, 3D, Pages, Performance — All Complete ✓

### Phase 5: Final Polish & Launch
- [x] **Cinematic Hero**: 3D landing scene with scroll-linked camera (useScrollCamera, CameraController)
- [x] **Post-Processing**: Bloom, Chromatic Aberration, Depth of Field, Noise, Vignette
- [x] **3D Optimization**: Draco compression, adaptive quality (LOD), geometry/memory management
- [x] **Accessibility**: SceneAccessibility (parallel semantic DOM), keyboard nav, skip-to-content, reduced-motion
- [x] **Type Safety**: Strict TypeScript across monorepo, shared types in packages/types
- [x] **SEO**: StructuredData (JSON-LD), dynamic metadata, robots.txt, sitemap.ts
- [x] **Security**: JWT httpOnly cookies, env validation (Zod), Docker network segmentation, Redis auth, bucket whitelist
- [x] **Brand Identity**: Logo (real logo.webp from client), slogan "Living Spaces. Visualized.", favicon
- [x] **Sentry**: Client/server/edge config with DSN env variable
- [x] **ADR**: 6 Architecture Decision Records in docs/ADR/
- [x] **CI**: GitHub Actions (lint, typecheck, build, security audit)
- [x] **Production Deployment**: All 14 containers running + healthy on 19.16.1.100
- [x] **Deploy Script**: `/opt/scripts/deploy.sh` with 14 commands, health checks via Docker exec
- [x] **MCP Server**: Running on production (Docker, port 3001) + local dev version in scripts/mcp/
- [x] **OpenCode Server**: v1.17.13 systemd service on production (port 4096)
- [x] **DNS**: `opencode.hexastudio.net → 156.206.135.186` configured (Traefik route + SSL pending)

### Recent Fixes (v0.9.0 - July 07)
- [x] **SSR Crash Fixed**: SmoothScroll dynamic wrapper, JSX comments stripped
- [x] **Framer Motion v12**: All `ease: 'var(--ease-out-expo)'` replaced with inline cubic-bezier `[0.16, 1, 0.3, 1]`
- [x] **Studio 404**: `/studio` → redirect to `/about`
- [x] **Blog Fallback**: 3 fallback articles shown when API fails
- [x] **Portfolio Grid**: Reformatted, responsive font sizes, fixed hover overlays
- [x] **Dockerfile**: Reproducible builds with `npm ci`, ARG/ENV for build vars, wget added

### Remaining
- [ ] SSL certificate for `opencode.hexastudio.net` (Let's Encrypt — needs DNS to propagate)
- [ ] Lighthouse audit (target >95)
- [ ] Visual regression testing
- [ ] Cloudflare WAF configuration
- [ ] Push to GitHub (`git push` needs auth)

---

## 5. Infrastructure Details

### Production Server
| Field | Value |
|-------|-------|
| SSH | `root@19.16.1.100` |
| Public IP | `156.206.135.186` |
| Project path | `/opt` (docker-compose.yml) |
| Deploy | `/opt/scripts/deploy.sh` |
| OpenCode | v1.17.13 at `/root/.opencode/bin/opencode` |
| Node | v24.16.0 |

### Key Config Files
| File | Purpose |
|------|---------|
| `/opt/docker-compose.yml` | Full stack (14 services) |
| `/opt/.env` | All environment secrets |
| `/opt/scripts/deploy.sh` | Deploy orchestration (14 commands) |
| `/opt/docker/traefik/traefik.yml` | Traefik static config |
| `/opt/docker/traefik/dynamic.yml` | Traefik dynamic routes (includes opencode) |
| `/etc/systemd/system/opencode-server.service` | OpenCode server systemd service |
| `~/.config/opencode/opencode.json` | OpenCode MCP config (local dev-server + dev-server-local) |

---

## 6. Critical Constraints
- **Performance**: 60 FPS in 3D scenes, LCP < 1.2s, bundle < 200KB
- **Type Safety**: No `any`. Shared types in `/packages/types`
- **Security**: `getEnv()` for secrets, httpOnly cookies for JWT
- **R3F**: `useFrame` not `requestAnimationFrame`, dispose geometries/materials
- **Logo**: Real logo at `/logo.webp` (replaced SVG approximation)
- **Brand**: "Precision — Purpose — Vision" tagline, "Living Spaces. Visualized." slogan
