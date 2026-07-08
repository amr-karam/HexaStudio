# 🧪 TESTING STRATEGY: THE ZERO-DEFECT PROTOCOL

**Version:** 1.0 | **Scope:** All Engineering | **Goal:** 100% Reliability

## 1. THE TESTING PHILOSOPHY
At HEXA Studio, testing is not a final step; it is **integrated into the development process**. We use a "Shift-Left" approach, testing as early as possible to avoid costly late-stage bugs.

---

## 2. THE TESTING PYRAMID

### I. Unit Tests (The Foundation)
- **Focus:** Pure functions, utility logic, and isolated component behavior.
- **Tool:** Vitest / Jest.
- **Requirement:** 80% coverage for core business logic in `/packages/utils` and Backend Services.
- **SOP:** Write the test *before* the code (TDD) for complex logic.

### II. Integration Tests (The Bridge)
- **Focus:** API endpoints, Database queries, and Service-to-Service communication.
- **Tool:** Supertest / NestJS Testing module.
- **Requirement:** 100% coverage of critical "Happy Paths" and "Error Paths."
- **SOP:** Test the lauch as a black box; verify the final output and DB state.

### III. E2E Tests (The User Experience)
- **Focus:** Critical user journeys (e.g., Landing $\rightarrow$ Project $\rightarrow$ Contact).
- **Tool:** Playwright.
- **Requirement:** Zero critical bugs in the "Gold Path."
- **SOP:** Run E2E tests in a staging environment that mirrors production.

---

## 3. VISUAL REGRESSION TESTING
Since the "Luxury" feel is paramount, traditional tests aren't enough.
- **Snapshot Testing:** Use Playwright's visual comparison to detect 1px drifts in the UI.
- **FPS Auditing:** Use a custom script to measure frame drops during camera transitions.
- **Lighthouse CI:** Automate LCP, CLS, and TBT checks on every PR.

---

## 4. THE "BUG" LIFECYCLE
1. **Detection:** Bug found by QA or User $\rightarrow$ Logged in `BLOCKING_ISSUES.md`.
2. **Triage:** Chief Architect assigns priority (P0 to P3).
3. **Resolution:** Developer fixes bug $\rightarrow$ Writes a regression test to prevent it from returning.
4. **Verification:** QA Agent verifies the fix in staging.
5. **Closure:** Bug marked as "Resolved" and merged to `develop`.

*“The only bug that is acceptable is the one that doesn't exist.”*
