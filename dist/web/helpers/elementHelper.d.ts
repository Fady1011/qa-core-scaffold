import type { Locator, Page } from "@playwright/test";
export declare function locator(page: Page, selector: string): Locator;
export declare function clickAndWait(page: Page, selector: string, waitForNavigation?: boolean): Promise<void>;
