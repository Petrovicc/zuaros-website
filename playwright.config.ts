import { defineConfig } from "@playwright/test";

const port = process.env.TEST_PORT || "4173";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.TEST_BASE_URL || `http://127.0.0.1:${port}/`,
    browserName: "chromium",
    locale: "en-GB",
    screenshot: "only-on-failure",
  },
  webServer: process.env.TEST_BASE_URL ? undefined : {
    command: "node scripts/serve-static.mjs",
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: !process.env.CI,
  },
});
