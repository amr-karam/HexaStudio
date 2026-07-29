import { test, expect } from "@playwright/test";
import { loginAs, goTo, DEFAULT_ADMIN } from "./fixtures/auth.fixture";

test.describe("Dashboard Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, DEFAULT_ADMIN);
    await goTo(page, "/dashboard");
    // Wait for the sidebar to be visible
    await expect(page.locator("aside")).toBeVisible({ timeout: 10_000 });
  });

  // ── Dashboard home renders ────────────────────────────────────────────

  test("should render the dashboard home page with welcome message", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();

    // Metric cards should be present
    await expect(page.getByText(/active projects/i)).toBeVisible();
    await expect(page.getByText(/pending approvals/i)).toBeVisible();
    await expect(page.getByText(/unread messages/i)).toBeVisible();

    // Quick links section
    await expect(page.getByText(/quick access/i)).toBeVisible();
    await expect(page.getByText(/revenue snapshot/i)).toBeVisible();
  });

  // ── Sidebar links are visible ─────────────────────────────────────────

  test("should display all main sidebar navigation links", async ({
    page,
  }) => {
    const sidebar = page.locator("aside");

    // Core navigation items (visible to SUPER_ADMIN)
    const expectedLinks = [
      "Dashboard",
      "CRM",
      "Contacts",
      "Sales",
      "Projects",
      "Tasks",
      "Documents",
      "Accounting",
      "Helpdesk",
      "Calendar",
      "Employees",
      "Timesheets",
      "Knowledge",
      "Messages",
      "Channels",
      "Approvals",
      "Notifications",
      "Settings",
    ];

    for (const label of expectedLinks) {
      await expect(sidebar.getByText(label, { exact: true })).toBeVisible();
    }
  });

  // ── Navigate to Projects ──────────────────────────────────────────────

  test("should navigate to Projects page via sidebar", async ({ page }) => {
    await page.locator("aside").getByText("Projects", { exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/projects/, { timeout: 10_000 });
    await expect(
      page.getByRole("heading", { name: /projects/i }),
    ).toBeVisible();
  });

  // ── Navigate to Tasks ─────────────────────────────────────────────────

  test("should navigate to Tasks page via sidebar", async ({ page }) => {
    await page.locator("aside").getByText("Tasks", { exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/tasks/, { timeout: 10_000 });
    await expect(
      page.getByRole("heading", { name: /tasks/i }),
    ).toBeVisible();
  });

  // ── Navigate to Messages ──────────────────────────────────────────────

  test("should navigate to Messages page via sidebar", async ({ page }) => {
    await page.locator("aside").getByText("Messages", { exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/messages/, { timeout: 10_000 });
    // The messages page should render the inbox sidebar
    await expect(page.getByText(/your messages/i)).toBeVisible({ timeout: 10_000 });
  });

  // ── Navigate to Approvals ─────────────────────────────────────────────

  test("should navigate to Approvals page via sidebar", async ({ page }) => {
    await page.locator("aside").getByText("Approvals", { exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/approvals/, { timeout: 10_000 });
    await expect(
      page.getByRole("heading", { name: /approvals/i }),
    ).toBeVisible();
  });

  // ── Navigate to Settings ──────────────────────────────────────────────

  test("should navigate to Settings page via sidebar", async ({ page }) => {
    await page.locator("aside").getByText("Settings", { exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/settings/, { timeout: 10_000 });
  });

  // ── Navigate to Calendar ──────────────────────────────────────────────

  test("should navigate to Calendar page via sidebar", async ({ page }) => {
    await page.locator("aside").getByText("Calendar", { exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/calendar/, { timeout: 10_000 });
  });

  // ── Navigate to Documents ─────────────────────────────────────────────

  test("should navigate to Documents page via sidebar", async ({ page }) => {
    await page.locator("aside").getByText("Documents", { exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/documents/, { timeout: 10_000 });
  });

  // ── Navigate to Knowledge ─────────────────────────────────────────────

  test("should navigate to Knowledge page via sidebar", async ({ page }) => {
    await page.locator("aside").getByText("Knowledge", { exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/knowledge/, { timeout: 10_000 });
  });

  // ── Navigate to Notifications ────────────────────────────────────────

  test("should navigate to Notifications page via sidebar", async ({ page }) => {
    await page.locator("aside").getByText("Notifications", { exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/notifications/, { timeout: 10_000 });
  });

  // ── Sales submenu ─────────────────────────────────────────────────────

  test("should expand Sales submenu and navigate to Quotations", async ({
    page,
  }) => {
    // Click Sales to expand
    await page.locator("aside").getByText("Sales", { exact: true }).click();
    // Wait for the submenu to appear
    await expect(
      page.locator("aside").getByText("Quotations"),
    ).toBeVisible({ timeout: 5_000 });
    // Click Quotations
    await page.locator("aside").getByText("Quotations").click();
    await expect(page).toHaveURL(/\/dashboard\/sales\/quotations/, {
      timeout: 10_000,
    });
  });

  // ── Executive section for SUPER_ADMIN ─────────────────────────────────

  test("should show Executive section for SUPER_ADMIN role", async ({
    page,
  }) => {
    // The sidebar should contain the "Executive" label
    await expect(
      page.locator("aside").getByText("Executive"),
    ).toBeVisible();
    await expect(
      page.locator("aside").getByText("Executive View"),
    ).toBeVisible();
    await expect(
      page.locator("aside").getByText("Sync Status"),
    ).toBeVisible();
  });

  // ── User profile in sidebar ───────────────────────────────────────────

  test("should display user name and role in sidebar footer", async ({
    page,
  }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar.getByText(DEFAULT_ADMIN.fullName)).toBeVisible();
    await expect(sidebar.getByText(DEFAULT_ADMIN.role)).toBeVisible();
  });
});
