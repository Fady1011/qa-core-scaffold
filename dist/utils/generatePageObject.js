import fs from "fs";
import path from "path";
import { performance } from "node:perf_hooks";
import { chromium } from "@playwright/test";
import { load } from "cheerio";
import { loadEnv } from "./env";
import { createScopedLogger } from "./logger";
const DEFAULT_OUTPUT_DIR = "e2e/pages";
const DEFAULT_SCOPE = "body";
const DEFAULT_MAX_ELEMENTS = 200;
const logger = createScopedLogger("page-object-generator");
const ELEMENT_DESCRIPTORS = [
    { selector: "button", action: "click", propSuffix: "Button" },
    { selector: "a[href]", action: "click", propSuffix: "Link" },
    { selector: "input[type=submit]", action: "click", propSuffix: "Button" },
    { selector: "input[type=button]", action: "click", propSuffix: "Button" },
    { selector: "input[type=text], input:not([type])", action: "fill", propSuffix: "Input" },
    { selector: "input[type=email]", action: "fill", propSuffix: "Input" },
    { selector: "input[type=password]", action: "fill", propSuffix: "Input" },
    { selector: "input[type=number]", action: "fill", propSuffix: "Input" },
    { selector: "textarea", action: "fill", propSuffix: "Textarea" },
    { selector: "select", action: "select", propSuffix: "Select" },
    { selector: "input[type=checkbox]", action: "check", propSuffix: "Checkbox" },
    { selector: "input[type=radio]", action: "check", propSuffix: "Radio" }
];
export async function runGeneratePageObjectFromCli(options) {
    const config = await loadGeneratorConfig(options.config);
    const { config: configPath, ...optionOverrides } = options;
    const mergedOptions = {
        ...config.defaults,
        ...optionOverrides
    };
    if (mergedOptions.logLevel) {
        logger.level = mergedOptions.logLevel;
    }
    logger.info({ configPath: configPath ?? undefined }, "Resolved generator configuration");
    return generatePageObject(mergedOptions);
}
export async function generatePageObject(options) {
    const resolved = resolveOptions(options);
    const runLogger = logger.child({ url: resolved.url, outfile: resolved.outfile });
    runLogger.level = resolved.logLevel;
    const overallStart = performance.now();
    runLogger.info({
        scope: resolved.scope,
        maxElements: resolved.maxElements,
        rendered: resolved.rendered,
        storageState: resolved.storageState
    }, "Starting page object generation");
    loadEnv();
    const fetchStart = performance.now();
    runLogger.info("Fetching DOM source");
    const html = resolved.rendered
        ? await fetchRenderedHtml(resolved.url, resolved.storageState, resolved.waitFor, runLogger)
        : await fetchStaticHtml(resolved.url, resolved.storageState, runLogger);
    runLogger.debug({ durationMs: elapsed(fetchStart) }, "Fetched DOM source");
    const parseStart = performance.now();
    const $ = load(html);
    runLogger.debug({ durationMs: elapsed(parseStart) }, "Parsed HTML into DOM");
    const scopeRoot = $(resolved.scope);
    if (!scopeRoot.length) {
        throw new Error(`Scope selector "${resolved.scope}" did not match any elements.`);
    }
    const extractionStart = performance.now();
    runLogger.info("Extracting interactable elements");
    const candidates = extractElements($, scopeRoot, resolved.maxElements);
    const uniqueElements = resolved.dedupe ? dedupeElements(candidates) : candidates;
    runLogger.info({
        discovered: candidates.length,
        generated: uniqueElements.length,
        durationMs: elapsed(extractionStart)
    }, "Element extraction complete");
    const renderStart = performance.now();
    const source = renderPageObjectClass(resolved, uniqueElements);
    runLogger.debug({ durationMs: elapsed(renderStart) }, "Rendered page object source");
    const writeStart = performance.now();
    await fs.promises.mkdir(path.dirname(resolved.outfile), { recursive: true });
    await fs.promises.writeFile(resolved.outfile, source, "utf-8");
    runLogger.info({
        outfile: resolved.outfile,
        elements: uniqueElements.length,
        durationMs: elapsed(writeStart),
        totalMs: elapsed(overallStart)
    }, "Page object generation finished");
    return {
        className: resolved.className,
        outfile: resolved.outfile,
        elementsGenerated: uniqueElements.length
    };
}
function resolveOptions(options) {
    const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();
    const url = options.url;
    if (!url) {
        throw new Error("A --url option (or config default) is required to generate a page object");
    }
    const className = options.className ?? inferClassNameFromUrl(url);
    const outputDir = path.resolve(cwd, options.outputDir ?? DEFAULT_OUTPUT_DIR);
    const outfile = path.resolve(cwd, options.outfile ?? path.join(outputDir, `${className}.ts`));
    const storageState = options.storageState ? path.resolve(cwd, options.storageState) : undefined;
    return {
        url,
        className,
        scope: options.scope ?? DEFAULT_SCOPE,
        rendered: options.rendered ?? false,
        storageState,
        waitFor: options.waitFor,
        maxElements: options.maxElements ?? DEFAULT_MAX_ELEMENTS,
        dedupe: options.dedupe ?? true,
        outfile,
        outputDir,
        logLevel: options.logLevel ?? "info",
        cwd
    };
}
async function loadGeneratorConfig(configPath) {
    const resolvedPath = configPath
        ? path.resolve(process.cwd(), configPath)
        : path.resolve(process.cwd(), ".genpo.json");
    if (!fs.existsSync(resolvedPath)) {
        if (configPath) {
            logger.warn({ configPath: resolvedPath }, "Configured generator file was not found");
        }
        return { defaults: {} };
    }
    try {
        const raw = await fs.promises.readFile(resolvedPath, "utf-8");
        const parsed = JSON.parse(raw);
        logger.debug({ configPath: resolvedPath }, "Loaded generator configuration");
        return parsed;
    }
    catch (error) {
        logger.warn({ configPath: resolvedPath, error }, "Failed to parse generator configuration");
        return { defaults: {} };
    }
}
async function fetchRenderedHtml(url, storageState, waitFor, runLogger) {
    const contextOptions = {};
    if (storageState && fs.existsSync(storageState)) {
        contextOptions.storageState = storageState;
    }
    const browser = await chromium.launch();
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "load" });
    if (waitFor) {
        try {
            await page.locator(waitFor).first().waitFor({ state: "visible", timeout: 15_000 });
        }
        catch (error) {
            runLogger.warn({ waitFor, error }, "Wait-for selector timed out; continuing with current DOM");
        }
    }
    else {
        await page.waitForLoadState("networkidle").catch(() => undefined);
    }
    const html = await page.content();
    await browser.close();
    return html;
}
async function fetchStaticHtml(url, storageState, runLogger) {
    const headers = {};
    if (storageState && fs.existsSync(storageState)) {
        try {
            const raw = await fs.promises.readFile(storageState, "utf-8");
            const state = JSON.parse(raw);
            const requestUrl = new URL(url);
            const cookies = (state.cookies ?? [])
                .filter((cookie) => cookieMatchesUrl(cookie, requestUrl))
                .map((cookie) => `${cookie.name}=${cookie.value}`)
                .join("; ");
            if (cookies) {
                headers.cookie = cookies;
            }
        }
        catch (error) {
            runLogger.warn({ storageState, error }, "Unable to apply cookies from storage state");
        }
    }
    const response = await fetch(url, { headers });
    return await response.text();
}
function cookieMatchesUrl(cookie, url) {
    const domain = cookie.domain?.replace(/^\./, "");
    if (domain && !url.hostname.endsWith(domain)) {
        return false;
    }
    const cookiePath = cookie.path ?? "/";
    return url.pathname.startsWith(cookiePath);
}
function extractElements($, scopeRoot, maxElements) {
    const elements = [];
    const collectedSignatures = new Set();
    const usedProps = new Map();
    for (const descriptor of ELEMENT_DESCRIPTORS) {
        scopeRoot.find(descriptor.selector).each((index, node) => {
            if (!isDomElement(node) || !node.attribs) {
                return;
            }
            const element = node;
            const signature = elementSignature(element);
            if (collectedSignatures.has(signature)) {
                return;
            }
            const locator = buildLocator($, element);
            const basePropName = buildPropertyName(element, descriptor.propSuffix);
            const propName = ensureUniquePropertyName(basePropName, usedProps);
            const label = inferLabel($, element);
            const textContent = $(element).text().trim() || undefined;
            elements.push({
                element,
                propName,
                locator,
                action: descriptor.action,
                label,
                text: textContent
            });
            collectedSignatures.add(signature);
        });
        if (elements.length >= maxElements) {
            break;
        }
    }
    return elements.slice(0, maxElements);
}
function buildLocator($, element) {
    const testId = element.attribs?.["data-testid"];
    if (testId) {
        return { strategy: "testId", line: `this.page.getByTestId('${escapeTsString(testId)}')` };
    }
    const ariaLabel = element.attribs?.["aria-label"];
    if (ariaLabel) {
        return { strategy: "label", line: `this.page.getByLabel('${escapeTsString(ariaLabel)}')` };
    }
    const role = element.attribs?.role;
    const text = $(element).text().trim();
    if (role && text) {
        return {
            strategy: "role",
            line: `this.page.getByRole('${escapeTsString(role)}', { name: '${escapeTsString(text)}' })`
        };
    }
    const placeholder = element.attribs?.placeholder;
    if (placeholder) {
        return {
            strategy: "placeholder",
            line: `this.page.getByPlaceholder('${escapeTsString(placeholder)}')`
        };
    }
    const cssSelector = buildUniqueCss($, element);
    return { strategy: "css", line: `this.page.locator('${escapeTsString(cssSelector)}')` };
}
function elementSignature(element) {
    const attrs = Object.entries(element.attribs ?? {})
        .map(([key, value]) => `${key}=${value}`)
        .sort()
        .join("|");
    return `${getTagName(element)}|${attrs}`;
}
function getTagName(element) {
    return element.tagName ?? element.name ?? "div";
}
function buildPropertyName(element, suffix) {
    const baseCandidate = element.attribs?.["data-testid"] ||
        element.attribs?.name ||
        element.attribs?.id ||
        element.attribs?.placeholder ||
        element.attribs?.["aria-label"] ||
        suffix;
    const camel = toCamelCase(baseCandidate);
    return `${camel}${suffix}`;
}
function ensureUniquePropertyName(base, registry) {
    if (!registry.has(base)) {
        registry.set(base, 1);
        return base;
    }
    const count = (registry.get(base) ?? 1) + 1;
    registry.set(base, count);
    return `${base}${count}`;
}
function inferLabel($, element) {
    const id = element.attribs?.id;
    if (id) {
        const label = $(`label[for="${id}"]`).first();
        if (label.length) {
            return label.text().trim();
        }
    }
    const parentLabel = $(element).closest("label");
    if (parentLabel.length) {
        return parentLabel.text().trim();
    }
    return undefined;
}
function dedupeElements(elements) {
    const map = new Map();
    for (const element of elements) {
        const key = `${element.locator.strategy}|${element.propName}`;
        if (!map.has(key)) {
            map.set(key, element);
        }
    }
    return Array.from(map.values());
}
function renderPageObjectClass(options, elements) {
    const lines = [];
    lines.push(`// Auto-generated from ${options.url} on ${new Date().toISOString()}`);
    lines.push(`import type { Locator, Page } from "@playwright/test";`);
    lines.push(`import { BasePage } from "@yourorg/qa-core/web";`);
    lines.push("");
    lines.push(`export class ${options.className} extends BasePage {`);
    lines.push(`  constructor(page: Page) {`);
    lines.push(`    super(page);`);
    lines.push(`  }`);
    lines.push("");
    for (const element of elements) {
        lines.push(`  readonly ${element.propName}: Locator = ${element.locator.line};`);
    }
    if (elements.length) {
        lines.push("");
    }
    for (const element of elements) {
        const helper = renderHelperMethod(element);
        if (helper) {
            lines.push(helper);
            lines.push("");
        }
    }
    lines.push(`}`);
    lines.push("");
    lines.push(`export default ${options.className};`);
    return lines.join("\n");
}
function renderHelperMethod(element) {
    const methodName = element.propName;
    switch (element.action) {
        case "click":
            return `  async click${capitalize(methodName)}() {\n    await this.${methodName}.click();\n  }`;
        case "fill":
            return `  async fill${capitalize(methodName)}(value: string) {\n    await this.${methodName}.fill(value);\n  }`;
        case "check":
            return `  async toggle${capitalize(methodName)}(checked: boolean) {\n    if (checked) {\n      await this.${methodName}.check();\n    } else {\n      await this.${methodName}.uncheck();\n    }\n  }`;
        case "select":
            return `  async select${capitalize(methodName)}(value: string) {\n    await this.${methodName}.selectOption(value);\n  }`;
        default:
            return undefined;
    }
}
function buildUniqueCss($, element) {
    const id = element.attribs?.id;
    if (id)
        return `#${cssEscape(id)}`;
    const name = element.attribs?.name;
    if (name) {
        const selector = `${getTagName(element)}[name="${cssEscape(name)}"]`;
        if (uniqueCount($, selector) === 1)
            return selector;
    }
    const classes = (element.attribs?.class ?? "")
        .split(/\s+/)
        .filter((value) => Boolean(value));
    if (classes.length) {
        const selector = `${getTagName(element)}${classes.map((cls) => `.${cssEscape(cls)}`).join("")}`;
        if (uniqueCount($, selector) === 1)
            return selector;
    }
    const pathSegments = [];
    let node = element;
    while (node && node.type !== "root") {
        const parent = node.parent;
        const tag = getTagName(node);
        const siblings = parent?.children?.filter((child) => isDomElement(child) && getTagName(child) === tag) ?? [];
        const index = siblings.indexOf(node);
        const segment = `${tag}:nth-of-type(${index + 1})`;
        pathSegments.unshift(segment);
        const combined = pathSegments.join(" > ");
        if (uniqueCount($, combined) === 1) {
            return combined;
        }
        node = parent;
    }
    return getTagName(element);
}
function uniqueCount($, selector) {
    try {
        return $(selector).length;
    }
    catch {
        return 0;
    }
}
function isDomElement(node) {
    return Boolean(node && node.type === "tag");
}
function inferClassNameFromUrl(rawUrl) {
    try {
        const parsed = new URL(rawUrl);
        const segments = parsed.pathname.split("/").filter(Boolean);
        const candidate = segments[segments.length - 1] ?? parsed.hostname;
        return toPascalCase(candidate) || "GeneratedPage";
    }
    catch {
        return "GeneratedPage";
    }
}
function toCamelCase(input) {
    const normalized = input
        .replace(/[^a-zA-Z0-9]+(.)/g, (_match, chr) => chr.toUpperCase())
        .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
    if (/^[a-zA-Z_]/.test(normalized)) {
        return normalized;
    }
    return `element${capitalize(normalized)}`;
}
function toPascalCase(input) {
    return input
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
}
function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
function cssEscape(value) {
    return value.replace(/"/g, '\\"');
}
function escapeTsString(value) {
    return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/'/g, "\\'");
}
function elapsed(start) {
    return Math.round(performance.now() - start);
}
//# sourceMappingURL=generatePageObject.js.map