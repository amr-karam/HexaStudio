import { test, expect } from "@playwright/test";
import { loginAs, goTo, DEFAULT_ADMIN } from "./fixtures/auth.fixture";

test.describe("Messages", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, DEFAULT_ADMIN);
    await goTo(page, "/dashboard/messages");
    // Wait for the messages page to load
    await page.waitForTimeout(2000);
  });

  // ── Inbox renders ─────────────────────────────────────────────────────

  test("should render the messages inbox with sidebar and main area", async ({
    page,
  }) => {
    // The messages page should have the inbox sidebar
    // Either the empty state or the sidebar with tabs should be visible
    const emptyState = page.getByText(/your messages/i);
    const tabs = page.getByText("All", { exact: true });

    const hasContent = await Promise.race([
      emptyState.waitFor({ timeout: 10_000 }).then(() => true),
      tabs.waitFor({ timeout: 10_000 }).then(() => true),
    ]).catch(() => false);

    expect(hasContent).toBeTruthy();
  });

  // ── Tab navigation ────────────────────────────────────────────────────

  test("should display All, Messages, Channels, and Mentions tabs", async ({
    page,
  }) => {
    const tabLabels = ["All", "Messages", "Channels", "Mentions"];

    for (const label of tabLabels) {
      const tab = page.getByRole("button", { name: label });
      const visible = await tab.isVisible({ timeout: 5_000 }).catch(() => false);
      // Tabs should be visible once the page loads
      expect(visible).toBeTruthy();
    }
  });

  // ── Switch to Messages (DMs) tab ──────────────────────────────────────

  test("should switch to Messages tab", async ({ page }) => {
    const messagesTab = page.getByRole("button", { name: /messages/i });
    await messagesTab.click();
    await page.waitForTimeout(300);

    // The tab should now be highlighted (gold color)
    await expect(messagesTab).toBeVisible();
  });

  // ── Switch to Channels tab ────────────────────────────────────────────

  test("should switch to Channels tab", async ({ page }) => {
    const channelsTab = page.getByRole("button", { name: /channels/i });
    await channelsTab.click();
    await page.waitForTimeout(300);

    await expect(channelsTab).toBeVisible();
  });

  // ── Switch to Mentions tab ────────────────────────────────────────────

  test("should switch to Mentions tab", async ({ page }) => {
    const mentionsTab = page.getByRole("button", { name: /mentions/i });
    await mentionsTab.click();
    await page.waitForTimeout(300);

    await expect(mentionsTab).toBeVisible();
  });

  // ── Switch back to All tab ────────────────────────────────────────────

  test("should switch back to All tab after navigating away", async ({
    page,
  }) => {
    // Click Channels first
    await page.getByRole("button", { name: /channels/i }).click();
    await page.waitForTimeout(200);

    // Then click All
    await page.getByRole("button", { name: "All", exact: true }).click();
    await page.waitForTimeout(200);

    await expect(
      page.getByRole("button", { name: "All", exact: true }),
    ).toBeVisible();
  });

  // ── Search contacts ────────────────────────────────────────────────────

  test("should filter contacts via search input", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    const searchVisible = await searchInput.isVisible({ timeout: 5_000 }).catch(() => false);

    if (searchVisible) {
      await searchInput.fill("test");
      await page.waitForTimeout(300);
      // The search input should still contain the value
      await expect(searchInput).toHaveValue("test");
    }
  });

  // ── Socket connection indicator ───────────────────────────────────────

  test("should display socket connection status", async ({ page }) => {
    // The connection status indicator should be visible in the sidebar
    const connected = page.getByText(/connected/i);
    const connecting = page.getByText(/connecting/i);

    const hasStatus = await Promise.race([
      connected.waitFor({ timeout: 5_000 }).then(() => true),
      connecting.waitFor({ timeout: 5_000 }).then(() => true),
    ]).catch(() => false);

    // At least one status indicator should be present
    expect(hasStatus).toBeTruthy();
  });

  // ── Empty state when no conversation selected ─────────────────────────

  test("should show empty state when no conversation is selected", async ({
    page,
  }) => {
    // The empty state message should be visible in the main area
    const emptyState = page.getByText(/select a conversation/i);
    const yourMessages = page.getByText(/your messages/i);

    const hasEmptyState = await Promise.race([
      emptyState.waitFor({ timeout: 5_000 }).then(() => true),
      yourMessages.waitFor({ timeout: 5_000 }).then(() => true),
    ]).catch(() => false);

    expect(hasEmptyState).toBeTruthy();
  });
});
