import type { Page } from "@playwright/test";

export async function waitForNetworkIdle(page: Page, timeout = 10_000) {
  await page.waitForLoadState("networkidle", { timeout });
}

export async function waitForTimeout(duration: number) {
  await new Promise((resolve) => setTimeout(resolve, duration));
}
