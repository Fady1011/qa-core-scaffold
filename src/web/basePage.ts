import type { Locator, Page } from "@playwright/test";
import { allure } from "allure-playwright";
import { Step } from "../decorators/step";
import { createScopedLogger } from "../utils/logger";

export interface NavigationOptions {
  url: string;
  waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
}

type LocatorWaitOptions = NonNullable<Parameters<Locator["waitFor"]>[0]>;

export class BasePage {
  protected readonly page: Page;
  protected readonly log = createScopedLogger(this.constructor.name);

  constructor(page: Page) {
    this.page = page;
  }

  protected resolveLocator(selector: string | Locator): Locator {
    return typeof selector === "string" ? this.page.locator(selector) : selector;
  }

  @Step("Navigate to page")
  async goto({ url, waitUntil = "domcontentloaded" }: NavigationOptions): Promise<void> {
    this.log.info({ url }, "Navigating to URL");
    await this.page.goto(url, { waitUntil });
  }

  @Step("Click element")
  async click(
    selector: string | Locator,
    options?: Parameters<Locator["click"]>[0]
  ): Promise<void> {
    const locator = this.resolveLocator(selector);
    await locator.waitFor({ state: "visible" });
    this.log.debug({ selector: locator.toString() }, "Clicking element");
    await locator.click(options);
  }

  @Step("Fill element")
  async type(
    selector: string | Locator,
    value: string,
    options?: Parameters<Locator["fill"]>[1]
  ): Promise<void> {
    const locator = this.resolveLocator(selector);
    await locator.waitFor({ state: "visible" });
    this.log.debug({ selector: locator.toString(), value }, "Typing into element");
    await locator.fill(value, options);
  }

  @Step("Wait for element")
  async waitForElement(
    selector: string | Locator,
    options: LocatorWaitOptions = {}
  ): Promise<void> {
    const locator = this.resolveLocator(selector);
    const waitOptions: LocatorWaitOptions = { state: "visible", ...options };
    this.log.debug(
      { selector: locator.toString(), state: waitOptions.state ?? "visible" },
      "Waiting for element state"
    );
    await locator.waitFor(waitOptions);
  }

  @Step("Capture screenshot")
  async screenshot(name = `screenshot-${Date.now()}`): Promise<Buffer> {
    this.log.debug({ name }, "Capturing screenshot");
    const buffer = await this.page.screenshot({ path: undefined });
    if (allure) {
      allure.attachment(name, buffer, "image/png");
    }
    return buffer;
  }
}
