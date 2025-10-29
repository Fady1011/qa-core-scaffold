export async function waitForNetworkIdle(page, timeout = 10_000) {
    await page.waitForLoadState("networkidle", { timeout });
}
export async function waitForTimeout(duration) {
    await new Promise((resolve) => setTimeout(resolve, duration));
}
//# sourceMappingURL=waitHelper.js.map