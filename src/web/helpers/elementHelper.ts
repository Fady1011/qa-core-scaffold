import type { Locator, Page } from "@playwright/test";

export function locator(page: Page, selector: string): Locator {
  return page.locator(selector);
}

export async function clickAndWait(
  page: Page,
  selector: string,
  waitForNavigation = true
): Promise<void> {
  await page.click(selector);
  if (waitForNavigation) {
    await page.waitForLoadState("networkidle");
  }
}
