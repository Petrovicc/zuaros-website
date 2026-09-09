import { defineConfig } from "@playwright/test";

const path = process.env.TEST_BASE_PATH || "/";
const port = process.env.TEST_PORT || "4173";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${port}${path}`,
    browserName: "chromium",
    locale: "en-GB",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run preview -- --port ${port} --strictPort --base ${path}`,
    url: `http://127.0.0.1:${port}${path}`,
    reuseExistingServer: !process.env.CI,
  },
});
