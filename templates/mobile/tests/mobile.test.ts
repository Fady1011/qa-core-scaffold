import { expect } from "@wdio/globals";
import { BaseMobileTest } from "@yourorg/qa-core/mobile";

describe("Sample mobile flow", () => {
  const baseTest = new (class extends BaseMobileTest {})();

  it.skip("performs login", async () => {
    await baseTest.sampleLoginFlow("qa-user", "secret");
    const home = await browser.$("~homeScreen");
    await expect(home).toBeDisplayed();
  });
});
