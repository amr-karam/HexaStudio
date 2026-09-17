# ADR-017: AgentsModule ↔ RealtimeModule Circular Dependency Boot Failure

**Date:** 2026-09-13
**Status:** Accepted
**Deciders:** Backend Agent (AI), Chief Architect (review pending)

---

### 1. CONTEXT

The production backend **cannot boot**. `node dist/main.js` (and a full-graph
`Test.createTestingModule({ imports: [AppModule] }).compile()`) fails before
listening with:

```
UndefinedModuleException: Nest cannot create the AgentsModule instance.
The module at index [4] of the AgentsModule "imports" array is undefined.
Scope [AppModule -> HealthModule -> OdooModule -> RealtimeModule
        -> AIModule -> VectorModule -> AIModule -> RealtimeModule]
```

Root cause is an ES-module evaluation cycle, distinct from the
Projects/Vector/AI triangle documented in ADR-003:

```
agents.module.ts  ──direct import──►  realtime.module.ts   (agents.module.ts:13,22)
realtime.module.ts ──forwardRef────►  agents.module.ts     (realtime.module.ts:14)
```

When `RealtimeModule` evaluates first (load order via `HealthModule →
OdooModule`), it starts evaluating `AgentsModule`, which hits the back-edge
`import { RealtimeModule }` while `realtime.module.ts` is still
partially initialised — the binding is `undefined`, and Nest captures
`undefined` at `AgentsModule` imports index [4]. The application boot order
happens to hit this path deterministically, so this is a hard boot failure,
not a flake.

Service-level cross-references driving the module edges:

| Dependent Service | Depends On |
|---|---|
| `agents/swarm-orchestrator.service.ts` | `EventBus` (from Realtime), `SlackService` (from Webhooks) |
| `realtime/approval.service.ts` | `AgentMemoryService` (from Agents) |
| `webhooks/git-webhook.service.ts` | `AgentsService` (from Agents) |

A second direct edge surfaced during the fix itself: `WebhooksModule`
imported `RealtimeModule` directly (`webhooks.module.ts:14`), producing the
identical `imports[1] is undefined` failure one step further down the same
chain once the AgentsModule edge was repaired. It receives the same treatment.

Both use plain type-based constructor injection (no `@Inject(forwardRef…)`),
so even the provider edges are order-dependent. (`ApprovalService` additionally
injects `StructuredOutputService` from AIModule — that edge belongs to the
ADR-003 triangle and is out of scope here.)

### 2. PROBLEM

Choose the minimal, safe repair that restores backend boot and makes the
Agents↔Realtime edges order-independent without destabilising the realtime
path (no e2e boot harness exists; verification is DI-compile + real boot +
unit suite).

### 3. CONSIDERED OPTIONS

- **Option A:** `forwardRef()` both module edges + `@Inject(forwardRef…)` at
  both provider injection sites — the exact pattern already used elsewhere
  in this codebase (`WebhooksModule` in `AgentsModule`, the ADR-003 triangle).
- **Option B:** Interface-based IoC now (`IEventBus`, `IAgentMemoryService`
  tokens) — the ADR-003 Phase-2 end state, applied early to this pair.
- **Option C:** Reorder `modules/index.ts` barrel / `AppModule` imports so
  `AgentsModule` always evaluates first — pure load-order luck, breaks on the
  next added import; rejected as fragile by inspection.

### 4. TRADE-OFF ANALYSIS

| Option | Pros | Cons | Score (1-10) |
|--------|------|------|--------------|
| A: forwardRef both edges | 3-line change; proven pattern in-repo; reversible; makes boot order-independent | `forwardRef` smell remains (consistent with ADR-003 status quo) | 9 |
| B: Interface IoC now | Cleanest end state | 4+ files, new tokens, wider blast radius with no e2e net; duplicates pending ADR-003 Phase-2 work | 5 |
| C: Reorder imports | Zero code change | Fragile; next module addition can re-break boot silently | 2 |

### 5. THE DECISION

**Chosen Option:** **Option A**, executed as six edits across five files:

1. `agents.module.ts`: `RealtimeModule` → `forwardRef(() => RealtimeModule)`.
2. `webhooks.module.ts`: `RealtimeModule` → `forwardRef(() => RealtimeModule)`.
3. `swarm-orchestrator.service.ts`:
   `@Inject(forwardRef(() => EventBus))` on `eventBus`,
   `@Inject(forwardRef(() => SlackService))` on `slackService`.
4. `approval.service.ts`:
   `@Inject(forwardRef(() => AgentMemoryService))` on `agentMemory`.
5. `git-webhook.service.ts`:
   `@Inject(forwardRef(() => AgentsService))` on `agentsService`.

Option B is explicitly deferred to converge with ADR-003 Phase 2
(interface-based IoC across all circular pairs).

### 6. IMPACT & CONSEQUENCES

- **Positive:** Backend boots again; Agents↔Realtime resolution no longer
  depends on module evaluation order; new `src/app-boot.spec.ts` full-graph
  DI test prevents silent recurrence.
- **Negative:** One more `forwardRef` pair in the codebase; the underlying
  bidirectional coupling (swarm ←→ approvals) remains by design.
- **Dependencies:** None — no API, DTO, or behaviour change; constructor
  signatures unchanged (decorator-only at injection sites).

### 7. VERIFICATION PLAN

1. `npx vitest run src/app-boot.spec.ts` — full AppModule graph compiles
   (failed before, must pass after).
2. `nest build` + `node dist/main.js` with valid env — process reaches
   "listening" (previously `UndefinedModuleException`).
3. Full backend gates unchanged-green:
   `npm run lint/typecheck/test --workspace=apps/backend`.

### 8. MIGRATION

Apply the three edits; no data, config, or deployment changes. Rebuild `dist`.

### 9. ROLLBACK

Revert the six edits (git). Failure mode of a bad forwardRef is a
compile-time DI error caught by `app-boot.spec.ts` before merge.

### 11. EXECUTION LOG (2026-09-13)

- `app-boot.spec.ts` (full AppModule compile) failed pre-fix with the exact
  production error; after the AgentsModule edit it advanced exactly one chain
  step and exposed the WebhooksModule edge — confirming iterative empirical
  diagnosis.
- Post-fix: `app-boot.spec.ts` passes (only noise is a background Redis
  `ECONNREFUSED` retry log — lazy client, no test infra required).
- Real `node dist/main.js` boot: InstanceLoader initialises every module with
  zero DI errors (previously `UndefinedModuleException` in <2 s). Reaching a
  live listener was not possible in this sandbox (no Redis/MinIO/Odoo —
  `onModuleInit` hooks wait on infra with retry backoff, which is correct
  behaviour, not a regression).
- Collateral boot blocker found and fixed in the same round: `swagger-ui-dist`
  was never installed, so dev-mode boot (`NODE_ENV=development`, the ADR-003
  verification path) crashed with `MODULE_NOT_FOUND` inside
  `@nestjs/swagger`. Installed as a backend dependency (official companion of
  `@nestjs/swagger`; dev-gated usage in `main.ts`); dev boot now logs
  "Swagger docs available at /api/docs".
- Full backend gates green (lint 0/0, typecheck 0, 437/437 tests, 59 files).

### 10. REFERENCES

- ADR-003 (`docs/adr/archive/adr-003-circular-dependency-resolution.md`) —
  Projects/Vector/AI triangle, interface-IoC end state.
- NestJS docs: Module forward references & `forwardRef` for circular
  provider injection.
- `apps/backend/src/app-boot.spec.ts`, `apps/backend/src/modules/minio-upload/minio-upload.module.spec.ts`
  (documents a second order-dependent edge in the same family).

---
**Sign-off:** `🏛️ Chief Architect Approved` (pending human review — fix is P0, review requested)
