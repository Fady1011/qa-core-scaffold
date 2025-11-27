import { browser } from "@wdio/globals";
import type { Browser } from "webdriverio";
import { createScopedLogger } from "../utils/logger.js";

export abstract class BaseMobileTest {
  protected readonly log = createScopedLogger(this.constructor.name);

  protected get driver(): Browser {
    if (typeof browser === "undefined") {
      throw new Error("WebdriverIO global browser is not defined");
    }
    return browser;
  }

  async takeScreenshot(name = `mobile-${Date.now()}`): Promise<Buffer> {
    this.log.info({ name }, "Capturing mobile screenshot");
    return this.driver.saveScreenshot(`./allure-results/${name}.png`);
  }

  async sampleLoginFlow(username: string, password: string): Promise<void> {
    this.log.info({ username }, "Executing sample login flow");
    const userField = await this.driver.$("~username");
    await userField.setValue(username);

    const passwordField = await this.driver.$("~password");
    await passwordField.setValue(password);

    const loginButton = await this.driver.$("~login");
    await loginButton.click();
  }
}
