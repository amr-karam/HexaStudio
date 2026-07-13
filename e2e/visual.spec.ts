import { test, expect } from "@playwright/test";

/**
 * Visual Regression Tests
 *
 * These tests capture screenshots of key pages and compare them against
 * stored baselines. On first run, baselines are generated automatically.
 * Subsequent runs compare against those baselines and fail on visual diffs.
 *
 * Run locally:
 *   npx playwright test --config e2e/playwright.config.ts e2e/visual.spec.ts
 *
 * Update baselines:
 *   npx playwright test --config e2e/playwright.config.ts e2e/visual.spec.ts --update-snapshots
 *
 * CI runs these automatically via the Lighthouse/Visual CI job.
 */

// Disable animations for deterministic screenshots
const disableAnimations = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
`;

// Common viewport for consistent screenshots
const VIEWPORT = { width: 1440, height: 900 };

test.describe("Visual Regression — Full Page Screenshots", () => {
  test.use({ viewport: VIEWPORT });

  test.beforeEach(async ({ page }) => {
    // Inject CSS to freeze animations/transitions
    await page.addStyleTag({ content: disableAnimations });
  });

  test("Home page — above the fold", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Wait for 3D canvas or fallback to render
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot("home-above-fold.png", {
      maxDiffPixelRatio: 0.05,
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
    });
  });

  test("Home page — full page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot("home-full-page.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test("About page", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("about-page.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test("Services page", async ({ page }) => {
    await page.goto("/services");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("services-page.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test("Portfolio page", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("portfolio-page.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test("Blog page", async ({ page }) => {
    await page.goto("/blog");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("blog-page.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test("Contact page", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("contact-page.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});

test.describe("Visual Regression — Component Snapshots", () => {
  test.use({ viewport: VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await page.addStyleTag({ content: disableAnimations });
  });

  test("Navigation bar", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
    await expect(nav).toHaveScreenshot("navbar.png", {
      maxDiffPixelRatio: 0.05,
    });
  });

  test("Footer", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const footer = page.locator("footer").first();
    await expect(footer).toBeVisible();
    await expect(footer).toHaveScreenshot("footer.png", {
      maxDiffPixelRatio: 0.05,
    });
  });
});

test.describe("Visual Regression — Mobile Viewport", () => {
  test.use({
    viewport: { width: 375, height: 812 }, // iPhone 14
  });

  test.beforeEach(async ({ page }) => {
    await page.addStyleTag({ content: disableAnimations });
  });

  test("Home page — mobile", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot("home-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test("Portfolio page — mobile", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("portfolio-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});
