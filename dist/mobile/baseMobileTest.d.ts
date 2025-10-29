import type { Browser } from "webdriverio";
export declare abstract class BaseMobileTest {
    protected readonly log: import("pino").Logger<never, boolean>;
    protected get driver(): Browser;
    takeScreenshot(name?: string): Promise<Buffer>;
    sampleLoginFlow(username: string, password: string): Promise<void>;
}
