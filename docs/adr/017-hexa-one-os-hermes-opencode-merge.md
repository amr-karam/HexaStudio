# 📝 ADR-017: HEXA ONE OS — Perfect Merge of Hermes and OpenCode

**Date:** 2026-09-09
**Status:** Accepted
**Deciders:** Chief Architect (AI) + Product Owner
**Risk:** MEDIUM (new integration component, no auth/DB/infra change)

### 1. CONTEXT
HEXA STUDIO runs two agent brains in parallel:

- **Hermes Agent (Nous Research)** — the OS vision: CLI / Ink TUI / Electron desktop (`hermes desktop`), web dashboard, multi-platform gateway (Telegram/Discord/Slack/WhatsApp/iMessage/Signal/Matrix/Teams/Email), persistent memory (Honcho at `19.16.1.100:8000` + `state.db` + skills that self-improve), provider-agnostic models with credential pools, profiles, skins, desktop-plugins, TUI widgets, MCP native, webhooks, cron/curator/kanban.
- **OpenCode** — the autonomous coding hands: `opencode run` one-shots, interactive TUI, `build`/`plan` agents, session list/stats, PR review, parallel worktrees. In this repo it is executed via `hexa-hub/src/bridge.ts` (`McpBridge.executeOpencodeRun` + GitLab webhook MR automation) and remembered via `.opencode/memory/project.json`.

Today they share no session id, no memory snapshot, and no router. Users must choose the tool. Hermes plans but cannot execute long code runs in isolation; OpenCode executes but forgets Hermes memory/skills/profiles.

### 2. PROBLEM
Provide **one perfect desktop OS entry** where Hermes is the brain/shell and OpenCode is the muscle, with a single session contract, a single memory snapshot, and a deterministic router — without forking either upstream, without new heavy dependencies, and without breaking `McpBridge`.

### 3. CONSIDERED OPTIONS
- **Option A:** Fork Hermes desktop into `apps/desktop` and embed OpenCode TUI inside Electron.
- **Option B:** Replace Hermes with OpenCode everywhere (OpenCode-only OS).
- **Option C (chosen):** Thin merge layer `hexa-hub/src/one-os/` — Hermes decides, OpenCode does, ONE-OS remembers. No fork, injectable executors, pure router/session/memory + orchestrator over the existing bridge.

### 4. TRADE-OFF ANALYSIS

| Option | Pros | Cons | Score (1-10) |
|---------|------|------|--------------|
| A — Full Electron fork | Native single window, pixel-perfect | Fork drift from Hermes upstream, Electron build/CI cost, HIGH risk, violates "no silent architecture change" | 4 |
| B — OpenCode-only | Simplest, one tool | Loses Hermes memory/skills/gateway/desktop-plugins/proxy/profiles, loses Honcho learning | 5 |
| C — Thin ONE-OS layer | Zero fork, zero heavy deps, testable, MEDIUM risk, preserves both upstreams, Clean Architecture | Two processes still exist under the hood (hidden by contract, not eliminated) | 9 |

### 5. THE DECISION
**Chosen Option:** C.

**Justification:** Matches `ARCHITECTURE.md` §4 (hexa-hub is the integration hub), `GOVERNANCE.md` §37 (ADR for architecture), §32–§36 (agent governance + risk-appropriate review), and HEXA Hub `AGENTS.md` (decoupling via APIs, no cross-DB access, API-first). Hermes strengths (memory/skills/gateway/shell) and OpenCode strengths (autonomous code runs) are complementary, not overlapping. A thin contract preserves both upstreams and can be rolled back by deleting one folder.

Contract:
- `routeIntent(prompt)` — deterministic: hermes-only → `hermes`, code-only → `opencode`, both/ambiguous → `hybrid` (Hermes plans → OpenCode executes).
- `one_<ms>_<base36>` canonical id maps to `hermesSessionId` + `opencodeSessionId`.
- `renderOneOsMemory()` merges Hermes representation + OpenCode project memory + bridge session count, secret-free and truncated.
- `OneOsBridge.run()` orchestrates injected `HermesExecutor` / `OpencodeExecutor`; production wiring uses `hermes chat -q` + `McpBridge.executeOpencodeRun`, tests inject mocks (never spawn).
- Config is env-first, profile-safe (`$HERMES_HOME`), never returns secret values (only `hasHonchoKey` boolean).

### 6. IMPACT & CONSEQUENCES
- **Positive:** One desktop story (`hermes desktop` shell + `opencode attach` hands), one memory file, one session id, parallel-safe, fully tested.
- **Negative:** Hybrid runs cost two model calls (plan + execute). Mitigated by `plan`-agent short-circuit for review-only prompts.
- **Dependencies:** `hexa-hub` only. No change to `apps/frontend`, `apps/backend`, `apps/mobile`, `packages/*`, Docker, Traefik, Odoo, CMS. No DB migration. No new npm dependencies.

### 7. VERIFICATION PLAN
- `hexa-hub`: `npm run lint` 0/0, `npx tsc --noEmit` 0 errors, `npm test` — existing 20 session tests + 5 new ONE-OS suites (router/session/config/memory/bridge) all green.
- Manual: Hermes plan → OpenCode build on a toy prompt via injected executors; production wiring smoke via `opencode run 'Respond with exactly: OPENCODE_SMOKE_OK'` + `hermes chat -q` (outside CI, needs keys).
- No design-token gate (no UI), no E2E (no route change).

### 8. MIGRATION
1. Add `hexa-hub/src/one-os/*` + `hexa-hub/tests/one-os/*` (this ADR).
2. Export from `hexa-hub/src/index.ts`.
3. Wire production executors in a follow-up (gateway route) without changing the contract.
4. Document in `docs/agents/one-os-merge.md` + `hexa-hub/README.md` pointer.

### 9. ROLLBACK
Delete `hexa-hub/src/one-os/`, `hexa-hub/tests/one-os/`, revert `hexa-hub/src/index.ts` to `export { McpBridge }`, remove ADR-017 index line. `McpBridge` is untouched and keeps working standalone.

### 10. REFERENCES
- `.kilocode/skills/hermes-agent/SKILL.md` (Hermes surfaces, spawning, invariants)
- `.kilocode/skills/opencode/SKILL.md` (opencode run/TUI/sessions)
- `.agents/skills/inspecting-hermes-desktop-dom/SKILL.md` (desktop CDP shell)
- `hexa-hub/src/bridge.ts` (existing OpenCode executor + sessions)
- `.hermes/honcho_learner.py` (Honcho `19.16.1.100:8000` memory source)
- `.opencode/memory/project.json` (OpenCode project memory)
- `GOVERNANCE.md` §32–§38, `ARCHITECTURE.md` §4, HEXA Hub `AGENTS.md`

---
**Sign-off:** `🏛️ Chief Architect Approved`
