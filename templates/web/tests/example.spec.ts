import { test, expect } from "@playwright/test";
import { BasePage } from "@yourorg/qa-core/web";

class HomePage extends BasePage {
  async assertHeroVisible() {
    await this.waitForElement("data-test=hero");
    await expect(this.page.locator("data-test=hero")).toBeVisible();
  }
}

test("home page renders hero", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto({ url: "/" });
  await homePage.assertHeroVisible();
});
