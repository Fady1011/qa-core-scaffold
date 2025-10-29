var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { allure } from "allure-playwright";
import { Step } from "../decorators/step";
import { createScopedLogger } from "../utils/logger";
export class BasePage {
    page;
    log = createScopedLogger(this.constructor.name);
    constructor(page) {
        this.page = page;
    }
    resolveLocator(selector) {
        return typeof selector === "string" ? this.page.locator(selector) : selector;
    }
    async goto({ url, waitUntil = "domcontentloaded" }) {
        this.log.info({ url }, "Navigating to URL");
        await this.page.goto(url, { waitUntil });
    }
    async click(selector, options) {
        const locator = this.resolveLocator(selector);
        await locator.waitFor({ state: "visible" });
        this.log.debug({ selector: locator.toString() }, "Clicking element");
        await locator.click(options);
    }
    async type(selector, value, options) {
        const locator = this.resolveLocator(selector);
        await locator.waitFor({ state: "visible" });
        this.log.debug({ selector: locator.toString(), value }, "Typing into element");
        await locator.fill(value, options);
    }
    async waitForElement(selector, options = {}) {
        const locator = this.resolveLocator(selector);
        const waitOptions = { state: "visible", ...options };
        this.log.debug({ selector: locator.toString(), state: waitOptions.state ?? "visible" }, "Waiting for element state");
        await locator.waitFor(waitOptions);
    }
    async screenshot(name = `screenshot-${Date.now()}`) {
        this.log.debug({ name }, "Capturing screenshot");
        const buffer = await this.page.screenshot({ path: undefined });
        if (allure) {
            allure.attachment(name, buffer, "image/png");
        }
        return buffer;
    }
}
__decorate([
    Step("Navigate to page"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BasePage.prototype, "goto", null);
__decorate([
    Step("Click element"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BasePage.prototype, "click", null);
__decorate([
    Step("Fill element"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BasePage.prototype, "type", null);
__decorate([
    Step("Wait for element"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BasePage.prototype, "waitForElement", null);
__decorate([
    Step("Capture screenshot"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BasePage.prototype, "screenshot", null);
//# sourceMappingURL=basePage.js.map