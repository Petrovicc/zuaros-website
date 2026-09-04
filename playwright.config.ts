import { defineConfig } from "@playwright/test";

const path = process.env.TEST_BASE_PATH || "/";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:4173${path}`,
    browserName: "chromium",
    locale: "en-GB",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run preview -- --port 4173 --strictPort --base ${path}`,
    url: `http://127.0.0.1:4173${path}`,
    reuseExistingServer: !process.env.CI,
  },
});
