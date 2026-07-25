# 🎭 END-TO-END & VISUAL REGRESSION TESTING STANDARDS

**Version:** 1.0.0 | **Scope:** Playwright E2E & Visual Diffing | **Standard:** Zero Visual & Functional Regression

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

## 3. CORE E2E USER JOURNEY SUITES

1. **Gold Path Navigation**: Homepage $\rightarrow$ Living Blueprint 3D view $\rightarrow$ Projects listing $\rightarrow$ Project detail modal $\rightarrow$ Contact form submission.
2. **Client Portal Operations**: JWT login $\rightarrow$ Milestone progress review $\rightarrow$ File download $\rightarrow$ Proposal approval.
3. **3D Experience Interactivity**: Canvas mount $\rightarrow$ Camera vantage point navigation $\rightarrow$ Model LOD switch $\rightarrow$ Reduced motion emulation.

---

## 4. VISUAL REGRESSION & SNAPSHOT TESTING

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

## 5. OPERATIONAL COMMANDS

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

## 6. RELATED DOCUMENTATION

- [QUALITY_GATES.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/15-QUALITY/QUALITY_GATES.md) — CI Quality Gates.
- [UNIT_TESTS.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/15-QUALITY/UNIT_TESTS.md) — Unit test specifications.
- [ACCESSIBILITY_AUDIT.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/15-QUALITY/ACCESSIBILITY_AUDIT.md) — WCAG audit procedures.
