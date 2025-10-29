import type { Page } from "@playwright/test";
export declare function waitForNetworkIdle(page: Page, timeout?: number): Promise<void>;
export declare function waitForTimeout(duration: number): Promise<void>;
