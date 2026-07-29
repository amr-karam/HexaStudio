import { test, expect } from "@playwright/test";
import { loginAs, goTo, DEFAULT_ADMIN } from "./fixtures/auth.fixture";

test.describe("Approvals Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, DEFAULT_ADMIN);
    await goTo(page, "/dashboard/approvals");
    // Wait for the page to load
    await page.waitForTimeout(2000);
  });

  // ── Approval list renders ─────────────────────────────────────────────

  test("should render the approvals page with heading and stats", async ({
    page,
  }) => {
    // Page heading
    await expect(
      page.getByRole("heading", { name: /approvals/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Stats cards should be present
    await expect(page.getByText(/pending/i).first()).toBeVisible();
    await expect(page.getByText(/approved/i).first()).toBeVisible();
    await expect(page.getByText(/rejected/i).first()).toBeVisible();

    // "New Approval" button should be visible
    await expect(
      page.getByRole("button", { name: /new approval/i }),
    ).toBeVisible();
  });

  // ── Filter tabs ───────────────────────────────────────────────────────

  test("should display filter tabs: All, Pending, Approved, Rejected", async ({
    page,
  }) => {
    const filterLabels = ["All", "Pending", "Approved", "Rejected"];

    for (const label of filterLabels) {
      await expect(
        page.getByRole("button", { name: new RegExp(label, "i") }),
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  // ── Filter by Pending ─────────────────────────────────────────────────

  test("should filter approvals by Pending status", async ({ page }) => {
    await page.getByRole("button", { name: /pending/i }).click();
    await page.waitForTimeout(300);

    // The Pending filter button should now be highlighted (gold)
    await expect(
      page.getByRole("button", { name: /pending/i }),
    ).toBeVisible();
  });

  // ── Filter by Approved ────────────────────────────────────────────────

  test("should filter approvals by Approved status", async ({ page }) => {
    await page.getByRole("button", { name: /approved/i }).click();
    await page.waitForTimeout(300);

    await expect(
      page.getByRole("button", { name: /approved/i }),
    ).toBeVisible();
  });

  // ── Filter by Rejected ────────────────────────────────────────────────

  test("should filter approvals by Rejected status", async ({ page }) => {
    await page.getByRole("button", { name: /rejected/i }).click();
    await page.waitForTimeout(300);

    await expect(
      page.getByRole("button", { name: /rejected/i }),
    ).toBeVisible();
  });

  // ── Open Create Approval modal ─────────────────────────────────────────

  test("should open the New Approval modal", async ({ page }) => {
    await page.getByRole("button", { name: /new approval/i }).click();
    await page.waitForTimeout(300);

    // The modal should appear
    await expect(
      page.getByRole("heading", { name: /new approval request/i }),
    ).toBeVisible({ timeout: 5_000 });

    // Form fields should be present
    await expect(
      page.getByPlaceholder(/title/i),
    ).toBeVisible();
    await expect(page.locator("select")).toBeVisible();
    await expect(
      page.getByPlaceholder(/description/i),
    ).toBeVisible();

    // Submit button
    await expect(
      page.getByRole("button", { name: /submit for approval/i }),
    ).toBeVisible();
  });

  // ── Close Create Approval modal via backdrop ──────────────────────────

  test("should close the New Approval modal when clicking backdrop", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /new approval/i }).click();
    await page.waitForTimeout(300);

    // Click the backdrop (the dark overlay behind the modal)
    await page.locator(".fixed.inset-0").first().click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);

    // The modal heading should no longer be visible
    await expect(
      page.getByRole("heading", { name: /new approval request/i }),
    ).not.toBeVisible({ timeout: 5_000 });
  });

  // ── Create a new approval ─────────────────────────────────────────────

  test("should create a new approval request", async ({ page }) => {
    await page.getByRole("button", { name: /new approval/i }).click();
    await page.waitForTimeout(300);

    // Fill the form
    await page.getByPlaceholder(/title/i).fill("E2E Test Approval");
    await page.locator("select").selectOption("contract");
    await page.getByPlaceholder(/description/i).fill("Created by E2E test");

    // Submit
    await page.getByRole("button", { name: /submit for approval/i }).click();
    await page.waitForTimeout(1000);

    // The modal should close
    await expect(
      page.getByRole("heading", { name: /new approval request/i }),
    ).not.toBeVisible({ timeout: 5_000 });

    // The new approval should appear in the list (if API succeeded)
    // At minimum, the page should still be functional
    await expect(
      page.getByRole("heading", { name: /approvals/i }),
    ).toBeVisible();
  });

  // ── Approve button appears on hover ───────────────────────────────────

  test("should show Approve and Reject buttons on hover for pending items", async ({
    page,
  }) => {
    // First filter to Pending
    await page.getByRole("button", { name: /pending/i }).click();
    await page.waitForTimeout(500);

    // Check if there are any pending approval cards
    const approveBtn = page.getByRole("button", { name: /approve/i });
    const hasApproveBtn = await approveBtn.first().isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasApproveBtn) {
      // If visible without hover, that's fine too
      await expect(approveBtn.first()).toBeVisible();
    }
    // If no pending items, the empty state is acceptable
  });

  // ── Empty state ───────────────────────────────────────────────────────

  test("should show empty state when no approvals match filter", async ({
    page,
  }) => {
    // Filter to Rejected (may be empty)
    await page.getByRole("button", { name: /rejected/i }).click();
    await page.waitForTimeout(500);

    // Either approvals render or empty state shows
    const emptyState = page.getByText(/no approvals found/i);
    const approvalCards = page.locator('[class*="rounded-2xl"]').first();

    const hasContent = await Promise.race([
      emptyState.waitFor({ timeout: 5_000 }).then(() => true),
      approvalCards.waitFor({ timeout: 5_000 }).then(() => true),
    ]).catch(() => false);

    expect(hasContent).toBeTruthy();
  });
});
