# 🎭 END-TO-END & VISUAL REGRESSION TESTING STANDARDS

**Version:** 1.1.0 | **Last Updated:** 2026-07-25 | **Scope:** Playwright E2E & Visual Diffing | **Standard:** Zero Visual & Functional Regression

---

## 1. OVERVIEW & FRAMEWORK

HEXA Vision uses **Playwright** (`e2e/playwright.config.ts`) for End-to-End (E2E) user journey testing, WebGL visual regression snapshot comparison, and responsive layout auditing across Desktop Chrome and Mobile viewports.

---

## 2. PLAYWRIGHT CONFIGURATION (`e2e/playwright.config.ts`)

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { outputFolder: "playwright-report" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "visual-regression",
      testMatch: /visual\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
```

---

## 3. TEST FILE INVENTORY

| Spec File | Purpose | Test Cases | Notes |
|-----------|---------|------------|-------|
| `e2e/pages.spec.ts` | Public page navigation tests | Multiple | Verifies route rendering and basic navigation across all public pages |
| `e2e/portal.spec.ts` | Client portal smoke tests | 18 test cases, 10 groups | Backend-independent via `MOCK_FALLBACK_DASHBOARD`; covers login, dashboard, sidebar, protected routes, accessibility, approvals, documents, finance, support, analytics |
| `e2e/visual.spec.ts` | Visual regression snapshot tests | Multiple | Desktop + mobile screenshot comparison with pixel-diff thresholds |

---

## 4. CORE E2E USER JOURNEY SUITES

1. **Gold Path Navigation**: Homepage → Living Blueprint 3D view → Projects listing → Project detail modal → Contact form submission.
2. **Client Portal Operations** (`e2e/portal.spec.ts`):
   - **Login flow** — Form validation, error handling, ARIA attributes
   - **Dashboard** — Mock fallback render, Copilot button presence
   - **Sidebar navigation** — Key areas and route links
   - **Protected routes** — Redirect to login when unauthenticated
   - **Accessibility** — Skip-link, keyboard reach, ARIA compliance
   - **Approval Center** — Approval workflow rendering
   - **Document Center** — Document listing and interactions
   - **Finance Center** — Finance data display
   - **Support Center** — Support ticket listing
   - **Analytics Center** — Analytics dashboard rendering
   - **Cross-page navigation** — Navigation between portal sections
3. **3D Experience Interactivity**: Canvas mount → Camera vantage point navigation → Model LOD switch → Reduced motion emulation.

---

## 5. PORTAL TEST GROUPS (`e2e/portal.spec.ts`)

| # | Group | Test Cases | Description |
|---|-------|------------|-------------|
| 1 | Login flow | 4 | Form loads, validation, error state, ARIA labels |
| 2 | Dashboard | 2 | Mock fallback render, Copilot button |
| 3 | Sidebar navigation | 2 | Key areas visible, route links functional |
| 4 | Protected routes | 1 | Redirect to `/portal/login` when unauthenticated |
| 5 | Accessibility | 3 | Skip-link, keyboard reach, ARIA landmarks |
| 6 | Approval Center | 1 | Approval workflow page renders |
| 7 | Document Center | 1 | Document listing page renders |
| 8 | Finance Center | 1 | Finance page renders |
| 9 | Support Center | 1 | Support page renders |
| 10 | Analytics Center | 1 | Analytics page renders |

**Total:** 18 test cases across 10 groups. All tests are backend-independent via `MOCK_FALLBACK_DASHBOARD` constant.

---

## 6. VISUAL REGRESSION & SNAPSHOT TESTING

Visual diffing (`visual.spec.ts`) captures pixel-perfect screenshots of key UI Organisms and 3D Canvas states:
```typescript
import { test, expect } from "@playwright/test";

test("Homepage hero visual snapshot", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");
  await expect(page).toHaveScreenshot("homepage-hero.png", {
    maxDiffPixelRatio: 0.02,
  });
});
```

---

## 7. OPERATIONAL COMMANDS

```bash
# Run all E2E tests locally
npm run test:e2e --workspace=apps/frontend

# Run visual regression suite specifically
npx playwright test --config=e2e/playwright.config.ts --project=visual-regression

# Update visual regression baseline snapshots
npx playwright test --config=e2e/playwright.config.ts --update-snapshots

# View HTML test report
npx playwright show-report e2e/playwright-report
```

---

## 8. RELATED DOCUMENTATION

- [QUALITY_GATES.md](QUALITY_GATES.md) — CI Quality Gates.
- [UNIT_TESTS.md](UNIT_TESTS.md) — Unit test specifications.
- [ACCESSIBILITY_AUDIT.md](ACCESSIBILITY_AUDIT.md) — WCAG audit procedures.
- [CURRENT_SPRINT.md](../product/CURRENT_SPRINT.md) — S-018 E2E smoke test deliverables.
