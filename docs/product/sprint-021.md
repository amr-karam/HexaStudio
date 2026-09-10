# SPRINT S-021 — AUTONOMOUS AI AGENTS & ADVANCED WORKFLOWS

**Sprint ID:** S-021 | **Focus:** Multi-Agent Executive Studio, Voice-to-3D Generation, Autonomous Workflows | **Status:** ✅ COMPLETE | **Completed:** 2026-08-31 | **v2.0.0 Released**
- [x] **AgentMemoryService** — Redis-backed conversation memory + long-term facts per persona/session:
  - `apps/backend/src/modules/agents/agent-memory.service.ts` — `agent:memory:{persona}:{sessionId}` (list, 40 msgs, 24h TTL) + `agent:facts:{persona}:{sessionId}` (hash, 7d TTL); `getHistory`/`append`/`appendMany`/`clear`/`remember`/`recall`/`forget`
  - `apps/backend/src/modules/agents/agent-memory.spec.ts` — 7 unit tests (all pass)
- [x] **Resilient Autonomous Chat Loop** — `AgentsService.chat()` hydrates history from Redis, persists user/assistant/tool messages, and isolates per-tool failures (a single tool error returns a tool-result string instead of aborting the loop):
  - `apps/backend/src/modules/agents/agents.service.ts` — memory hydration, sessionId support, per-tool try/catch
  - `apps/backend/src/modules/agents/agents.module.ts` — AgentMemoryService registered/exported
  - `apps/backend/src/modules/agents/agents.controller.ts` — `DELETE /agents/memory` + `sessionId`/`persona` on ChatDto
- [x] **Quality gates:** Backend lint 0/0, typecheck 0 errors, **330/330 tests** (was 323 — 7 new agent-memory tests)

### P1 — Voice-to-3D Architectural Prompting (COMPLETE, Aug 2 2026)
- [x] **SpatialSynthesisService + SpatialBriefSchema (zod)** — text prompt → brief `{atmosphere, recommendedLighting, recommendedMaterial, colorPalette, designRationale}` via `StructuredOutputService`; voice path transcribes via `VoiceService` then synthesizes
- [x] **API Endpoints** — `POST /api/v1/ai/spatial-synthesis` (text) + `POST /api/v1/ai/spatial-synthesis/voice` (audio → `{transcription, brief}`) — JWT-guarded, class-validator DTOs, Swagger; wired into `AIModule`
- [x] **Frontend Config** — `lighting-presets.ts` + `material-presets.ts` (single source of truth for 4 lighting + 4 material presets) + unit tests (22 tests)
- [x] **R3F Scene Consumption** — `SceneLightingRig` in `ExperienceCanvas` (ambient/key/fill/rim lights + Environment from preset), `SceneContent` applies material preset to procedural architecture, `ArchitecturalModel` merges preset into LOD factor pipeline — preset changes render live
- [x] **Voice Recorder** — `DesignerModeConfigurator` AI tab (MediaRecorder → webm base64, ARIA-correct, mic released on stop/cancel/unmount) + Next proxy `voice/route.ts` (validates, forwards, 502 degrade)
- [x] **Backend gates:** lint 0/0, typecheck 0, **335/335 tests**; Frontend gates: lint 0/0, typecheck 0, **205/207** (2 pre-existing `Navbar.spec.tsx` mobile-menu failures, untouched)
- [x] **RESOLVED (Aug 27 2026):** Frontend BFF proxies now forward real auth credentials to the JWT-guarded NestJS endpoints via `lib/bff.ts`. AI synthesis and agent paths no longer 401 and degrade to local fallbacks.

### P2 — Live Odoo Sync & Autonomous Project Management (COMPLETE, Aug 31 2026)
- [x] **Live Odoo ERP Sync to GitLab prod server** (`19.16.1.100` — AI module services initialized)
- [x] **Autonomous Project Management deployment to production** — AI-Driven Project Management features deployed with blue/green zero-downtime switch. Services: `AgentMemoryService`, `StructuredOutputService`, `AiNarratorService`, `ProjectReportService`, `PdfModule`. Commit `129516b` — feature finalization; commit `6e5a78c` — initial deployment. All quality gates passed: 403/403 backend tests, 0 lint errors, 0 typecheck errors.

### S-021 P3 — Fix Auth Headers in All Frontend BFF Proxies (RESOLVED, Aug 27 2026)
- [x] Verified `lib/bff.ts` implements `getForwardedAuthHeaders` which forwards the `auth_token` cookie and `Authorization` header to the NestJS backend. AI paths no longer degrade to local fallbacks.

### S-021 P4 — Address Offsite Backup Gaps
- [x] **DOCS ADDED** — Documented in `docs/devops/BACKUP.md` §8 (Blocked by lack of external S3 credentials — credentials required to close)

### S-021 P5 — Autonomous Project Management Deployment (COMPLETE, Aug 31 2026)
- [x] AI-Driven Project Management features deployed to production (`19.16.1.100`) with blue/green zero-downtime switch.

---

## 3. ADDITIONAL DELIVERABLES (Post-Sprint Scope)

### Frontend Bug Fixes (Aug 14, 2026)
- [x] **BUG 1 — `/portal` crash (`useLocale must be used within a LocaleProvider`):** Repointed `PortalTopBar.tsx` to canonical `@/components/LocaleSwitcher` (uses `@/i18n/LocaleProvider`, mounted in `app-providers.tsx`).
- [x] **BUG 2 — `/premium-chat` 404:** Created route `apps/frontend/src/app/premium-chat/` — server `page.tsx` + client island `PremiumChatClient.tsx`.
- [x] **BUG 3 — WebGL `getProgramParameter` context-loss render race:** Added `useContextLossRecovery.ts` hook — pauses R3F loop on context loss, never unmounts Canvas, restores via `remountOnRestore` (bumps `restartKey`) or auto-resume. All 4 canvas sites wired; zero `any`, design tokens only, no new deps. New hook unit test: 5 tests.
- [x] **Gates verified:** frontend lint 0/0, typecheck 0 errors, tests **341/341** (45 files incl. `useContextLossRecovery.test.ts`), design-token gate PASSED.

### Frontend Typography & Content-Width Fixes (Aug 17, 2026)
- [x] **BUG — Silent Luxury fonts declared but never loaded:** Added `Cormorant+Garamond` + `Jost` to Google Fonts payload in `layout.tsx` + `rel="preload" as="font"` woff2 entries. Homepage hero now renders true Cormorant Garamond headlines (incl. italic "Spaces" accent) and Jost body/buttons.
- [x] **BUG — Inconsistent homepage content columns:** `.storybook-body` now uses `max-width: clamp(640px, 72ch, 760px)`; `StorybookChapter` intro wrapper aligned.
- [x] **Gates verified:** frontend lint 0/0, typecheck 0 errors, tests **357/357** (49 files), design-token gate PASSED.

### HEXA Hub Bridge Restoration + Backend Test Gate GREEN (Aug 19, 2026)
- [x] **Root cause:** Accidental ~340-line deletion in `f13d0f6` removed entire `McpBridge` class from `hexa-hub/src/bridge.ts`.
- [x] **Restored** `bridge.ts` from `f13d0f6^` (464 lines) + fixed `hexa-hub/src/index.ts` re-export path.
- [x] **Implemented missing session subsystem** per test-defined contract: `Session` interface → class with TTL/monotonic timestamps, file persistence, cleanup interval, webhook `EADDRINUSE` tolerance.
- [x] **hexa-hub gates:** session spec **20/20 PASS**; `tsc --noEmit` **0 errors**; **Backend gate GREEN: 47/47 test files PASS**.

### Utility Hooks Suite (Aug 18, 2026)
- [x] **7 new utility hooks** in `apps/frontend/src/hooks/`: `usePrevious`, `useDebouncedValue`/`useDebouncedCallback`, `useLocalStorage`, `useCopyToClipboard`, `useWindowSize`/`useWindowBreakpoint`, `useIntersectionObserver`, `useEvent` — 58 new tests.
- [x] **Keyboard shortcut hooks:** `useKeyboardShortcut` + `useHotkeys` — 29 tests.
- [x] **Form hooks:** `useField` + `useForm` — 20 tests.
- [x] **Consolidated 3 components** (`Navbar`, `CurrencySelector`, `ProjectDetailModal`) to use `useKeyboardShortcut`.
- [x] **Gates verified:** frontend lint 0/0, typecheck 0 errors, tests **485/485** (63 files), design-token + font-preload PASSED.

### Production Deploy + Fixes (Aug 17, 2026) — Commit `75dc3b0`
- [x] **BUG — Backend never compiled from scratch (`TS1016`):** Fixed optional parameter ordering in `auth.controller.ts` logout. Backend gates: lint 0/0, typecheck 0, tests **386/386**, `nest build` ✅. **Note: deployed backend now matches repo for first time.**
- [x] **BUG — `deploy-zero-downtime.sh` `docker compose pull` fails on local-only images:** Added `--ignore-buildable` to pull step.
- [x] **DEPLOYED — Frontend typography/width fix (`5a47162`) live:** Blue-slot zero-downtime deploy. Verified live: Cormorant/Jost woff2 files return 200, ISR revalidation 200, all containers healthy.
- [x] **FIX — Server `.env`:** Added missing `CLOUDFLARE_ZONE_ID`; quoted `BACKUP_SCHEDULE`. Cache purge re-run → 200.

### Production Incident — MinIO Off-Network (Aug 17, 2026)
- [x] **INCIDENT — `files.hexastudio.net` → 502 for all objects (~13h):** `hexa-minio` recreated from dev compose, attached to stale `hexa_data` network.
- [x] **FIX (zero-downtime):** Attached container to `hexastudio_web` + `hexastudio_internal` with DNS aliases via `docker network connect --alias`. Verified live: public uploads → 200, `_next/image` → 200.
- [x] **PREVENTION:** Documented: never run `docker compose up` WITHOUT `-f docker-compose.prod.yml` for minio/traefik/cloudflared.

### Security Hardening — GitLab PAT Rotation (Aug 17, 2026)
- [x] **ROTATED — Root admin PAT removed from git remotes:** Created scoped `deploy-access-2026` (id=3, scopes `read_repository,write_repository`, expires 2027-08-17), swapped remote URLs, verified push/fetch, **revoked root token** (verified 401).
- [x] **VERIFIED — Leaked placeholder PAT was never valid:** Scrubbed value returns 401.

### Security Audit Remediation (Aug 16, 2026) — Backend
- [x] **M1 — RolesGuard audit DI:** `SecurityModule` now `@Global()`, `RolesGuard` injects `SecurityAuditService` via constructor.
- [x] **H14 — Logout revocation:** `AuthService.logout()` revokes Redis refresh-token record + family + user token-set entry and blacklists access-token `jti`; added `auth.service.spec.ts` (4 tests).
- [x] **H1-H2 — Error leakage:** SSE stream path no longer sends raw `error.message` to clients.
- [x] **H3-H8 — Console usage:** `console.error` in `leads.service.ts` replaced with NestJS `Logger`.
- [x] **H9-H12 — AI route input hardening:** `class-validator` DTOs + length limits + `sanitizePrompt()` applied at every prompt boundary.
- [x] **Gates:** backend lint 0/0, typecheck 0 errors, tests **386/386** (46 files).

### Security Audit Remediation (Aug 16, 2026) — Frontend / Mobile / hexa-hub / CMS
- [x] **M7 — Frontend logout race (`useAuth.tsx`):** Token captured before state clear; logout API fire-and-forget; forced-logout clears access token.
- [x] **L5 — `TextCharReveal` reduced motion:** Uses `useReducedMotion` hook.
- [x] **L1 — Modal focus ring:** Added design-system `focus-visible` ring classes to `ModalContent`.
- [x] **L15 — `deferred-scene-loader` canvas children:** Restructured to valid HTML (relative wrapper + absolutely-positioned canvas + overlay sibling).
- [x] **Frontend gates:** lint 0/0, typecheck 0, tests **357/357** (49 files), design-token gate PASSED.
- [x] **C8 — Mobile project detail auth guard:** Waits for session restore then redirects to login when unauthenticated.
- [x] **H15 — Mobile API client 401 handling:** Clears tokens + `router.replace('/login')` with 1s loop-guard.
- [x] **H16 — Mobile login validation:** Email regex + non-empty password + `accessibilityState`.
- [x] **L6-L11 — Mobile a11y labels:** Roles/labels added across all mobile components.
- [x] **Mobile gates:** lint 0/0, typecheck clean, tests **26/26** (8 suites).
- [x] **C4-C7 — hexa-hub hardcoded fallbacks removed (fail-fast):** `database/seed.ts`, `database/data-source.ts`, `auth.module.ts`, `jwt.strategy.ts`, `docker-compose.prod.yml`.
- [x] **C9 — hexa-hub channels authorization:** Class-level `JwtAuthGuard` extended with membership/ownership RBAC.
- [x] **H18 — hexa-hub realtime CORS:** `CORS_ORIGIN` parsed as comma-separated allowlist, `credentials: true` wired into Socket.IO.
- [x] **C1-C3 — CMS script secrets:** All env-driven; `apps/cms/inspect_db.js` hardcoded DB password in history (commit `2ca68ff3`) — rewritten to env + fail-fast, gitignored, staged for `git rm --cached`.
- [x] **H17 — CMS admin vs API JWT secrets verified separate:** Confirmed live on server.

### Follow-ups (Completed Aug 17, 2026)
- [x] **ROTATE CMS database password** — Leaked value rotated to fresh 32-hex in local `apps/cms/.env`. Prod NOT exposed (server used different 64-char password).
- [x] **Scrub git history** — `git filter-repo --replace-text` redacted all 3 leaked secrets across **all refs** (894 commits), force-pushed to `gitlab` + `hexa` (all 14 branches). Server clone force-fetched + hard-reset. Zero leaked refs remain.
- [x] **Untrack `apps/cms/inspect_db.js`** — Removed from tracking + gitignored; purged from all history.
- [x] **Hardcoded GitLab PAT removed from HEAD** — `ops/scripts/gitlab-newpat.sh` now requires `GITLAB_ROOT_PAT` env var; committed `6df2a9b`.
- [ ] Still open: pre-commit secret scanner (gitleaks/trufflehog) — recommended.

### CMS Schema Change (Aug 16, 2026) — Article `isPublished`
- [x] Added `isPublished` Boolean field to Article content type in `apps/cms/src/api/article/content-types/article/schema.json`. Typecheck ✅ + `strapi build` ✅ verified.

---

## 4. QUALITY METRICS (Final S-021 State)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Frontend typecheck | 0 errors | 0 errors | ✅ |
| Frontend lint | 0 errors | 0 errors | ✅ |
| Backend typecheck | 0 errors | 0 errors | ✅ |
| Backend lint | 0 errors | 0 errors | ✅ |
| Mobile tests | 26/26 | 26/26 | ✅ |
| Backend tests | 403/403 | 404/404 | ✅ |
| Frontend tests | 585/585 | 660/660 | ✅ |
| Design token gate | 0 violations | 0 violations | ✅ |
| Font preload gate | 7/7 match | 7/7 match | ✅ |
| Production runtime vulns | 0 critical, 0 high | 0 critical, 0 high | ✅ |

---

## 5. NEXT SPRINT: S-022 — SEO & CONTENT EXCELLENCE (COMPLETED Sep 4 2026)

See `docs/product/CURRENT_SPRINT.md` for S-023 (current).