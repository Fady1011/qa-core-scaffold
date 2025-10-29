import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { getQaEnvConfig } from "../utils/env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envConfig = getQaEnvConfig();

export default defineConfig({
  testDir: path.resolve(__dirname, "../../tests"),
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["allure-playwright"]],
  use: {
    baseURL: envConfig.web.baseUrl,
    browserName: envConfig.web.browser as "chromium" | "firefox" | "webkit",
    headless: process.env.HEADLESS !== "false",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    }
  ]
});
