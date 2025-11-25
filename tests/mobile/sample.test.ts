import { expect } from "@wdio/globals";
import { BaseMobileTest } from "../../src/mobile/baseMobileTest";

describe("Mobile smoke", () => {
  const base = new (class extends BaseMobileTest {})();

  it("captures onboarding screenshot", async () => {
    await base.takeScreenshot("onboarding");
    const onboarding = await browser.$("~onboarding");
    await expect(onboarding).toBeDisplayed();
  });
});
