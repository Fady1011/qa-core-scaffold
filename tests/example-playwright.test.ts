import { test, expect } from "@playwright/test";
import { BasePage } from "../src/web/basePage";

class ExamplePage extends BasePage {
  async assertTitle(expected: string) {
    await expect(this.page.locator("title")).toHaveText(expected);
  }
}

test.describe("Example Playwright smoke", () => {
  test("loads the homepage", async ({ page }) => {
    const examplePage = new ExamplePage(page);
    await examplePage.goto({ url: "/" });
    await examplePage.waitForElement("body");
    await examplePage.screenshot("homepage");
  });
});
