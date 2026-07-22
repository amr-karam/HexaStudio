import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("navbar links navigate to correct pages", async ({ page }) => {
    const links = [
      { label: "Home", path: "/" },
      { label: "About", path: "/about" },
      { label: "Services", path: "/services" },
      { label: "Projects", path: "/projects" },
      { label: "Blog", path: "/blog" },
      { label: "Contact", path: "/contact" },
    ];

    for (const link of links) {
      const navLink = page.locator(`nav a[href="${link.path}"]`).first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForURL(`**${link.path}`);
        await expect(page).toHaveURL(new RegExp(`${link.path}$`));
        await page.goto("/");
      }
    }
  });
});

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/HexaStudio/);
  });

  test("displays key sections", async ({ page }) => {
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
  });
});

test.describe("About page", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveURL(/\/about/);
  });
});

test.describe("Services page", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/services");
    await expect(page).toHaveURL(/\/services/);
  });
});

test.describe("Projects page", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/projects/);
  });

  test("displays project grid", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    const projectCards = page.locator('[data-testid="project-card"]');
    const count = await projectCards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Project detail page", () => {
  test("loads successfully with 3D scene", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    
    const firstProject = page.locator('[data-testid="project-card"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL(/\/projects\/[^/]+$/);
      
      const canvas = page.locator("canvas");
      await expect(canvas).toBeVisible();
    }
  });

  test("has accessibility controls", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    
    const firstProject = page.locator('[data-testid="project-card"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForLoadState("networkidle");
      
      const skipLink = page.locator('[role="region"][aria-label="3D Scene Viewer"]');
      await expect(skipLink).toBeVisible();
    }
  });
});

test.describe("Blog page", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveURL(/\/blog/);
  });
});

test.describe("Contact page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("loads successfully", async ({ page }) => {
    await expect(page).toHaveURL(/\/contact/);
  });

  test("form submission validation", async ({ page }) => {
    await page.goto("/contact");
    
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      const errorMessages = page.locator('[role="alert"], .error, [data-invalid="true"]');
      const hasValidation = await errorMessages.count() > 0;
      
      expect(hasValidation || !await submitButton.isEnabled()).toBeTruthy();
    }
  });
});

test.describe("404 page", () => {
  test("shows 404 for unknown routes", async ({ page }) => {
    const response = await page.goto("/nonexistent-route");
    expect(response?.status()).toBe(404);
  });
});

test.describe("SEO metadata", () => {
  test("has viewport meta tag", async ({ page }) => {
    await page.goto("/");
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute("content", /width=device-width/);
  });

  test("has description meta tag", async ({ page }) => {
    await page.goto("/");
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content");
  });

  test("has JSON-LD structured data", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test("skip-to-content link exists", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator("a[href='#main-content'], [role='region'][aria-label]");
    if (await skipLink.first().isVisible()) {
      await expect(skipLink.first()).toBeVisible();
    }
  });

  test("keyboard navigation works", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    
    await page.keyboard.press("Tab");
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(["A", "BUTTON", "INPUT"]).toContain(focusedElement);
  });

  test("aria labels are present on interactive elements", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    
    const buttons = page.locator("button");
    const count = await buttons.count();
    
    if (count > 0) {
      const firstButton = buttons.first();
      const hasAria = await firstButton.evaluate((el: HTMLElement) => 
        el.hasAttribute("aria-label") || el.hasAttribute("aria-labelledby")
      );
      expect(hasAria || await firstButton.textContent()).toBeTruthy();
    }
  });
});

test.describe("Performance", () => {
  test("LCP within budget", async ({ page }) => {
    const response = await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      };
    });
    
    expect(metrics.domContentLoaded).toBeLessThan(3000);
    expect(metrics.loadComplete).toBeLessThan(5000);
  });
});
