import { Page, expect } from "@playwright/test";

/**
 * Authentication fixture for HEXA Hub E2E tests.
 *
 * Provides helper functions to log in via the actual login API endpoint
 * and set the required localStorage / cookie state so the app treats
 * the browser as authenticated.
 */

const API_URL = process.env.E2E_API_URL || "http://localhost:3000/api";

export interface TestUser {
  email: string;
  password: string;
  fullName: string;
  role: string;
  id: string;
}

export const DEFAULT_ADMIN: TestUser = {
  email: "admin@hexastudio.net",
  password: "admin123",
  fullName: "Admin User",
  role: "SUPER_ADMIN",
  id: "admin-001",
};

export const DEFAULT_EMPLOYEE: TestUser = {
  email: "employee@hexastudio.net",
  password: "employee123",
  fullName: "Jane Architect",
  role: "EMPLOYEE",
  id: "emp-001",
};

export const DEFAULT_CLIENT: TestUser = {
  email: "client@hexastudio.net",
  password: "client123",
  fullName: "Client One",
  role: "CLIENT",
  id: "client-001",
};

/**
 * Log in by calling the real `/api/auth/login` endpoint, then
 * seed localStorage and the `hub_role` cookie so the Next.js
 * middleware and AuthProvider recognise the session.
 */
export async function loginAs(
  page: Page,
  user: TestUser = DEFAULT_ADMIN,
): Promise<void> {
  // 1. Call the login API
  const response = await page.request.post(`${API_URL}/auth/login`, {
    data: { email: user.email, password: user.password },
  });

  // If the API returns an error we still want the test to proceed
  // (the test itself will assert the UI behaviour).  We store
  // whatever the API gives us.
  let token = "";
  let role = user.role;
  let fullName = user.fullName;
  let userId = user.id;

  if (response.ok()) {
    const body = await response.json();
    token = body.access_token || "";
    role = body.user?.role || role;
    fullName = body.user?.fullName || fullName;
    userId = body.user?.id || userId;
  }

  // 2. Seed localStorage (AuthProvider reads these on mount)
  await page.evaluate(
    ([t, u]) => {
      localStorage.setItem("hub_token", t as string);
      localStorage.setItem("hub_user", JSON.stringify(u));
    },
    [
      token,
      { id: userId, fullName, email: user.email, role },
    ] as const,
  );

  // 3. Set the hub_role cookie (middleware reads this)
  await page.context().addCookies([
    {
      name: "hub_role",
      value: role,
      path: "/",
      domain: "localhost",
    },
  ]);
}

/**
 * Clear all auth state from the page.
 */
export async function logout(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem("hub_token");
    localStorage.removeItem("hub_user");
  });
  await page.context().clearCookies();
}

/**
 * Navigate to a path and wait for the network to be idle.
 */
export async function goTo(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: "networkidle" });
}
