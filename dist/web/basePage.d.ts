import type { Locator, Page } from "@playwright/test";
export interface NavigationOptions {
    url: string;
    waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
}
type LocatorWaitOptions = NonNullable<Parameters<Locator["waitFor"]>[0]>;
export declare class BasePage {
    protected readonly page: Page;
    protected readonly log: import("pino").Logger<never, boolean>;
    constructor(page: Page);
    protected resolveLocator(selector: string | Locator): Locator;
    goto({ url, waitUntil }: NavigationOptions): Promise<void>;
    click(selector: string | Locator, options?: Parameters<Locator["click"]>[0]): Promise<void>;
    type(selector: string | Locator, value: string, options?: Parameters<Locator["fill"]>[1]): Promise<void>;
    waitForElement(selector: string | Locator, options?: LocatorWaitOptions): Promise<void>;
    screenshot(name?: string): Promise<Buffer>;
}
export {};
