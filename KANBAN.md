# Kanban Board — Melius Clone / `/ai-canvas` Deployment

> Auto-generated from session context. Tracks the end-to-end effort to clone the
> Melius homepage into the `hexastudio.net` Next.js frontend at `/ai-canvas` and
> deploy it to production via GitLab CI.

## Columns

### 🔵 Backlog
| # | Task | Notes |
|---|------|-------|
| 1 | Clone Melius homepage into `/ai-canvas` route | Components created: `CanvasShowcase`, `Personas`, `Integrations`, `Pricing`, `MeliusFaq` |
| 2 | Download and fix corrupted Melius CDN assets (WebP) | Generated 22 placeholder WebPs via `scripts/gen-melius-assets.mjs` (sharp) |
| 3 | Apply design token compliance across ai-canvas components | Patched for `bg-void`, `text-sl-gold-subtle` |
| 4 | Revert GitHub Pages noise after GitLab pivot | Removed `.github/workflows/pages-deploy.yml`; reverted `next.config.ts` static export |
| 5 | Clean up stale git stashes (17 accumulated WIP stashes) | Low priority hygiene task |

### 🟡 In Progress
| # | Task | Progress / Notes |
|---|------|-----------------|
| 6 | Trigger GitLab CI/CD `deploy-production` for final deploy | Pipeline triggered by push to `main`; job is `when: manual` — requires GitLab UI/API trigger or SSH deploy run |

### 🟢 Done
| # | Task | Evidence |
|---|------|----------|
| 7 | Diagnose git push "Everything up-to-date" failure | `git log --all --decorate` confirmed commits on `fix/ui-design-tokens`, not `main` |
| 8 | Merge `fix/ui-design-tokens` → local `main` | Commit `2fafc7a3` (Merge fix/ui-design-tokens: /ai-canvas) |
| 9 | Push `/ai-canvas` code to GitLab `main` | `git push gitlab main`: `5c420bd0..2fafc7a3 main -> main` |
| 10 | Verify GitLab `main` contains `/ai-canvas/page.tsx` | `ls-tree gitlab/main` → `93769c7c... page.tsx` |
| 11 | Fix `globals.css` CSS syntax error breaking Docker build | `@utility content-{inline-start}` → `@utility content-inset-start`; commit `5df3f774` |
| 12 | Push `globals.css` repair to GitLab | `git push gitlab main`: `2fafc7a3..5df3f774 main -> main`; `ls-tree` → `e4fed6a2` |
| 13 | Fix `.git/index.lock` conflict | Removed stale lock file (`fatal: cannot lock ref 'HEAD'` error) |
| 14 | Fix production `.env` — add `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY` RSA key pair | Generated via openssl, fixed on server; `source .env && JWT_PRIVATE_KEY loaded: OK` |
| 15 | Kill rogue Docker container blocking SSH on `19.16.1.100` | `while true` loop consuming SSH — identified and terminated |
| 16 | Repair `globals.css` corruption (`--popover-foreground`, `--radius-md`) | Fixed in commit `a1826397` |

### 🔴 Blocked / Needs Attention
| # | Task | Blocker |
|---|------|---------|
| 17 | Production `https://hexastudio.net/ai-canvas` returns 404 | `deploy-production` is `when: manual`; deploy hasn't executed — needs GitLab CI trigger or SSH run of `deploy-zero-downtime.sh` |

## Key Decisions
- **Code isolation**: Melius clone code isolated in `src/app/ai-canvas/` + `src/components/ai-canvas/`
- **Design tokens**: Use `bg-void`, `text-sl-gold-subtle`, `text-sl-alabaster` per design system
- **Deploy target**: GitLab CI (`gitlab.hexastudio.net`), NOT GitHub Pages — `deploy-production` job via SSH to `19.16.1.100`
- **Production server**: `19.16.1.100`, SSH key: `C:\Users\amrmo\.ssh\hexastudio_key` (root)
- **Repo path on prod**: `/home/hexa/Hexa/hexastudio.net/` (not `/root` or `/opt`)
- **Deploy script**: `scripts/deploy-zero-downtime.sh` — blue/green slot switch with health gates

## Pipeline
```
GitLab push to main → CI/CD pipeline → deploy-production (manual) →
  SSH to 19.16.1.100 → git reset --hard gitlab/main → run deploy-zero-downtime.sh →
  Docker build (CMS + Backend + Frontend) → Health check → Cloudflare cache purge
```

## Git State
```
5df3f774 fix(css): repair corrupt globals.css @utility declarations   ← HEAD
2fafc7a3 Merge fix/ui-design-tokens: /ai-canvas Melius clone + CSS fix
5d0df4b2 ci: add GitHub Pages deploy workflow with GITHUB_PAGES env var
```
- Branch: `main`
- Tracking: `gitlab/main = 5df3f774` (up to date)
- Current HEAD on GitLab: `5df3f774`