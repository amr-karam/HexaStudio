# ADR-018: Agents ↔ Realtime ↔ Webhooks — Interface-IoC Refactor (Phase 2)

**Date:** 2026-09-15
**Status:** Proposed
**Deciders:** Chief Architect, Backend Guild

### 1. CONTEXT
ADR-017 sealed the 3-way circular dependency (`AgentsModule ↔ RealtimeModule ↔ WebhooksModule`) with `forwardRef()` at 6 edges (decorator-only, 5 files). The app boots and Swagger is reachable, but `forwardRef` hides the coupling and makes unit testing harder (mocks must replicate the circular graph). The gate is green (437/437 backend, 80/80 build) but the design still violates the Dependency Inversion Principle — concrete modules depend on concrete modules, not abstractions. OneDrive sync also showed how fragile the current wiring is (6 edits to keep in sync).

### 2. PROBLEM
Replace the `forwardRef` triangle with a stable, testable IoC seam that survives future sprints (S-024 portal approval hub, S-025 Framer bridge) without re-introducing `UndefinedModuleException`.

### 3. CONSIDERED OPTIONS
- **Option A — Keep `forwardRef` (status quo):** No code change, boot stays green.
- **Option B — Interface-IoC with port tokens:** Extract `AgentsPort`, `RealtimePort`, `WebhooksPort` interfaces + `Symbol` tokens in `src/ports/`, have modules bind concrete services to tokens, and depend only on tokens.
- **Option C — Event-bus-only decoupling:** Remove direct service injections entirely; all 3 modules communicate via `EventBus`/`WorkflowEventListener` (async, no DI edges).

### 4. TRADE-OFF ANALYSIS

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| A | Zero risk, 0 churn, boot green | Hidden cycle, hard to mock, 6 `forwardRef` sites to maintain | 5 |
| B | Explicit seam, easy unit mocks (provide token mock), single place to wire, aligns with DIP, reversible | 3 new port files + 3 provider bindings, 6 injection sites change from `@Inject(forwardRef(()=>X))` to `@Inject(AGENTS_PORT)` etc. | 9 |
| C | Zero DI cycles, fully async | Latency, eventual consistency, harder to trace, needs event schema versioning, overkill for approval→memory→realtime sync | 6 |

### 5. THE DECISION
**Chosen Option:** B — Interface-IoC with port tokens.
**Justification:** Preserves synchronous approval→memory→realtime semantics (needed for the Signing Chamber UX), but makes the dependency direction explicit and mockable. Small, reversible change (6 injection sites, 3 tokens). Aligns with Hexa Studio `GOVERNANCE.md` § Governance Hierarchy (Architecture before code) and `ENGINEERING_STANDARDS.md` (no `any`, strict DI).

### 6. IMPACT & CONSEQUENCES
- **Positive:** Unit tests can `provide: [{ provide: AGENTS_PORT, useValue: mock }]` without importing the real module; circular graph collapses to a star at `PortsModule`; future portal/Framer features add new ports without new cycles.
- **Negative:** One-time churn (3 tokens + 6 `@Inject` changes); token names must be kept stable — rename is breaking.
- **Dependencies:** `AgentsService`, `RealtimeGateway`, `GitWebhookService`, `ApprovalService`, `SwarmOrchestrator`.

### 7. VERIFICATION PLAN
- `npm run typecheck --workspace=apps/backend` 0 errors, `npm run test --workspace=apps/backend` 437/437 (add 3 new port-binding specs), `next build` 80/80 unaffected, no `UndefinedModuleException` on boot, portal approval E2E still green.

### 8. MIGRATION
1. Create `src/ports/agents.port.ts`, `realtime.port.ts`, `webhooks.port.ts` (Symbol + interface).
2. Add `PortsModule` that `provide: [{ provide: AGENTS_PORT, useExisting: AgentsService }]` etc., exported as global.
3. Change 6 injection sites: `agents.module.ts`/`webhooks.module.ts` imports → `PortsModule`; `swarm-orchestrator.service.ts`/`approval.service.ts`/`git-webhook.service.ts` → `@Inject(AGENTS_PORT)` etc.
4. Keep `forwardRef` for one sprint as fallback, then remove once `PortsModule` is proven on staging.
5. Update `docs/adr/017` §11 to point to this ADR.

### 9. ROLLBACK
Revert 3 port files + 6 injections, restore `forwardRef` at 6 edges (previous commit `ceebc85b` is the rollback point). No DB migration, no config change.

### 10. REFERENCES
- ADR-017: `docs/adr/017-agents-realtime-circular-dependency.md`
- ADR-003: `docs/adr/archive/adr-003-circular-dependency-resolution.md`
- NestJS Circular Dependencies: https://docs.nestjs.com/fundamentals/circular-dependency
- `GOVERNANCE.md` § Governance Hierarchy, `ENGINEERING_STANDARDS.md`

---
**Sign-off:** `🏛️ Chief Architect Approved` (pending)
