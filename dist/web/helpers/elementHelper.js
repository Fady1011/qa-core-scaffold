export function locator(page, selector) {
    return page.locator(selector);
}
export async function clickAndWait(page, selector, waitForNavigation = true) {
    await page.click(selector);
    if (waitForNavigation) {
        await page.waitForLoadState("networkidle");
    }
}
//# sourceMappingURL=elementHelper.js.map