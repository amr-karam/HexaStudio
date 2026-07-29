import { test, expect } from "@playwright/test";
import { loginAs, logout, goTo, DEFAULT_ADMIN } from "./fixtures/auth.fixture";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Start clean — no cookies or localStorage
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  // ── Login with valid credentials ──────────────────────────────────────

  test("should login with valid credentials via API and redirect to dashboard", async ({
    page,
  }) => {
    await loginAs(page, DEFAULT_ADMIN);
    await goTo(page, "/dashboard");

    // After login, the dashboard layout should render
    await expect(page.locator("aside")).toBeVisible({ timeout: 10_000 });
    // The sidebar brand should be visible
    await expect(page.getByText("HEXA")).toBeVisible();
    await expect(page.getByText("HUB")).toBeVisible();
    // The welcome heading should appear
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── Login with invalid credentials ────────────────────────────────────

  test("should show error message with invalid credentials", async ({
    page,
  }) => {
    await goTo(page, "/login");

    // Fill the form with bad credentials
    await page.getByPlaceholder(/email/i).fill("wrong@hexastudio.net");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: /enter workspace/i }).click();

    // Expect the error message to appear
    await expect(
      page.getByText(/invalid credentials/i),
    ).toBeVisible({ timeout: 10_000 });

    // We should still be on the login page
    await expect(page).toHaveURL(/\/login/);
  });

  // ── Logout ────────────────────────────────────────────────────────────

  test("should logout and redirect to login page", async ({ page }) => {
    await loginAs(page, DEFAULT_ADMIN);
    await goTo(page, "/dashboard");

    // Verify we are on the dashboard
    await expect(page.locator("aside")).toBeVisible({ timeout: 10_000 });

    // Click the "Sign Out" button in the sidebar footer
    await page.getByRole("button", { name: /sign out/i }).click();

    // Should be redirected to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  // ── Protected route redirect ──────────────────────────────────────────

  test("should redirect unauthenticated users from /dashboard to /login", async ({
    page,
  }) => {
    await goTo(page, "/dashboard");

    // Without auth, the middleware or client-side guard should redirect
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  // ── Client role redirect ──────────────────────────────────────────────

  test("should redirect CLIENT role from /dashboard to /client", async ({
    page,
  }) => {
    // Simulate a CLIENT session via cookie
    await page.context().addCookies([
      { name: "hub_role", value: "CLIENT", path: "/", domain: "localhost" },
    ]);

    await goTo(page, "/dashboard");
    await expect(page).toHaveURL(/\/client/, { timeout: 10_000 });
  });

  // ── Already-authenticated redirect from /login ────────────────────────

  test("should redirect authenticated users away from /login", async ({
    page,
  }) => {
    await loginAs(page, DEFAULT_ADMIN);
    await goTo(page, "/login");

    // Should be redirected to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });
});
