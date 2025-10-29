import { browser } from "@wdio/globals";
import { createScopedLogger } from "../utils/logger";
export class BaseMobileTest {
    log = createScopedLogger(this.constructor.name);
    get driver() {
        if (typeof browser === "undefined") {
            throw new Error("WebdriverIO global browser is not defined");
        }
        return browser;
    }
    async takeScreenshot(name = `mobile-${Date.now()}`) {
        this.log.info({ name }, "Capturing mobile screenshot");
        return this.driver.saveScreenshot(`./allure-results/${name}.png`);
    }
    async sampleLoginFlow(username, password) {
        this.log.info({ username }, "Executing sample login flow");
        const userField = await this.driver.$("~username");
        await userField.setValue(username);
        const passwordField = await this.driver.$("~password");
        await passwordField.setValue(password);
        const loginButton = await this.driver.$("~login");
        await loginButton.click();
    }
}
//# sourceMappingURL=baseMobileTest.js.map