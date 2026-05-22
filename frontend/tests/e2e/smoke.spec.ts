import { test, expect } from "@playwright/test";

/**
 * Smoke tests for ResumeAI. These run against whatever BASE_URL points at
 * (defaults to local Next dev server). They never call the backend or
 * Supabase — they only verify pages render and basic client-side behavior.
 */

test("auth page renders sign-in form", async ({ page }) => {
  await page.goto("/auth");
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
  await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
});

test("auth page switches between sign in and sign up", async ({ page }) => {
  await page.goto("/auth");
  await page.getByRole("button", { name: /sign up/i }).first().click();
  await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();
});

test("shared results page renders an invalid-link state for bad UUIDs", async ({ page }) => {
  await page.goto("/results/00000000-0000-0000-0000-000000000000");
  // Either the spinner is still up (network in flight) or the error message lands.
  // Accept either, then specifically wait for the error.
  await expect(
    page.getByText(/invalid|expired|not found/i)
  ).toBeVisible({ timeout: 15_000 });
});

test("security headers are served on every page", async ({ request }) => {
  const res = await request.get("/auth");
  expect(res.status()).toBe(200);
  const headers = res.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["content-security-policy"]).toBeTruthy();
});
