import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests target a running server.
 * Override BASE_URL to point at staging/production:
 *   BASE_URL=https://frontend-kappa-lyart-79.vercel.app npm run test:e2e
 *
 * With no BASE_URL, Playwright will start a local Next.js dev server.
 */
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
        env: {
          NEXT_PUBLIC_API_URL: "http://localhost:8000",
          NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "build-time-placeholder",
        },
      },
});
