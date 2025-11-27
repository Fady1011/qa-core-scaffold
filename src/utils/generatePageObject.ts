import fs from "fs";
import path from "path";
import { performance } from "node:perf_hooks";
import { chromium } from "@playwright/test";
import { load } from "cheerio";
import type { Cheerio, CheerioAPI } from "cheerio";
import type { AnyNode, Element as DomElement, ChildNode } from "domhandler";
import type { LevelWithSilent } from "pino";
import { loadEnv } from "./env.js";
import { createScopedLogger } from "./logger.js";

const DEFAULT_OUTPUT_DIR = "e2e/pages";
const DEFAULT_SCOPE = "body";
const DEFAULT_MAX_ELEMENTS = 200;

const logger = createScopedLogger("page-object-generator");

type LocatorStrategy = "testId" | "label" | "role" | "placeholder" | "css";
type ElementAction = "click" | "fill" | "check" | "select" | "none";

export interface GeneratePageObjectOptions {
  url: string;
  className?: string;
  scope?: string;
  rendered?: boolean;
  storageState?: string;
  waitFor?: string;
  maxElements?: number;
  dedupe?: boolean;
  outfile?: string;
  outputDir?: string;
  logLevel?: LevelWithSilent;
  cwd?: string;
}

export interface GeneratePageObjectResult {
  className: string;
  outfile: string;
  elementsGenerated: number;
}

export interface GeneratorConfig {
  defaults?: Partial<GeneratePageObjectOptions>;
}

export interface GeneratePageObjectCliOptions extends Partial<GeneratePageObjectOptions> {
  config?: string;
}

interface ResolvedOptions {
  url: string;
  className: string;
  scope: string;
  rendered: boolean;
  storageState?: string;
  waitFor?: string;
  maxElements: number;
  dedupe: boolean;
  outfile: string;
  outputDir: string;
  logLevel: LevelWithSilent;
  cwd: string;
}

type ExtractedElement = {
  element: DomElement;
  propName: string;
  locator: LocatorDescriptor;
  action: ElementAction;
  label?: string;
  text?: string;
};

type LocatorDescriptor = {
  strategy: LocatorStrategy;
  line: string;
};

type ElementDescriptor = {
  selector: string;
  action: ElementAction;
  propSuffix: string;
};

const ELEMENT_DESCRIPTORS: ElementDescriptor[] = [
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

export async function runGeneratePageObjectFromCli(
  options: GeneratePageObjectCliOptions
): Promise<GeneratePageObjectResult> {
  const config = await loadGeneratorConfig(options.config);
  const { config: configPath, ...optionOverrides } = options;
  const mergedOptions = {
    ...config.defaults,
    ...optionOverrides
  } as GeneratePageObjectOptions;
  if (mergedOptions.logLevel) {
    logger.level = mergedOptions.logLevel;
  }
  logger.info({ configPath: configPath ?? undefined }, "Resolved generator configuration");
  return generatePageObject(mergedOptions);
}

export async function generatePageObject(
  options: GeneratePageObjectOptions
): Promise<GeneratePageObjectResult> {
  const resolved = resolveOptions(options);
  const runLogger = logger.child({ url: resolved.url, outfile: resolved.outfile });
  runLogger.level = resolved.logLevel;

  const overallStart = performance.now();

  runLogger.info(
    {
      scope: resolved.scope,
      maxElements: resolved.maxElements,
      rendered: resolved.rendered,
      storageState: resolved.storageState
    },
    "Starting page object generation"
  );

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
  runLogger.info(
    {
      discovered: candidates.length,
      generated: uniqueElements.length,
      durationMs: elapsed(extractionStart)
    },
    "Element extraction complete"
  );

  const renderStart = performance.now();
  const source = renderPageObjectClass(resolved, uniqueElements);
  runLogger.debug({ durationMs: elapsed(renderStart) }, "Rendered page object source");

  const writeStart = performance.now();
  await fs.promises.mkdir(path.dirname(resolved.outfile), { recursive: true });
  await fs.promises.writeFile(resolved.outfile, source, "utf-8");
  runLogger.info(
    {
      outfile: resolved.outfile,
      elements: uniqueElements.length,
      durationMs: elapsed(writeStart),
      totalMs: elapsed(overallStart)
    },
    "Page object generation finished"
  );

  return {
    className: resolved.className,
    outfile: resolved.outfile,
    elementsGenerated: uniqueElements.length
  };
}

function resolveOptions(options: Partial<GeneratePageObjectOptions>): ResolvedOptions {
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

async function loadGeneratorConfig(configPath?: string): Promise<GeneratorConfig> {
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
    const parsed = JSON.parse(raw) as GeneratorConfig;
    logger.debug({ configPath: resolvedPath }, "Loaded generator configuration");
    return parsed;
  } catch (error) {
    logger.warn({ configPath: resolvedPath, error }, "Failed to parse generator configuration");
    return { defaults: {} };
  }
}

async function fetchRenderedHtml(
  url: string,
  storageState: string | undefined,
  waitFor: string | undefined,
  runLogger: ReturnType<typeof createScopedLogger>
): Promise<string> {
  const contextOptions: Record<string, unknown> = {};
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
    } catch (error) {
      runLogger.warn(
        { waitFor, error },
        "Wait-for selector timed out; continuing with current DOM"
      );
    }
  } else {
    await page.waitForLoadState("networkidle").catch(() => undefined);
  }

  const html = await page.content();
  await browser.close();
  return html;
}

async function fetchStaticHtml(
  url: string,
  storageState: string | undefined,
  runLogger: ReturnType<typeof createScopedLogger>
): Promise<string> {
  const headers: Record<string, string> = {};

  if (storageState && fs.existsSync(storageState)) {
    try {
      const raw = await fs.promises.readFile(storageState, "utf-8");
      const state = JSON.parse(raw) as { cookies?: Array<Record<string, string>> };
      const requestUrl = new URL(url);
      const cookies = (state.cookies ?? [])
        .filter((cookie) => cookieMatchesUrl(cookie, requestUrl))
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");
      if (cookies) {
        headers.cookie = cookies;
      }
    } catch (error) {
      runLogger.warn({ storageState, error }, "Unable to apply cookies from storage state");
    }
  }

  const response = await fetch(url, { headers });
  return await response.text();
}

function cookieMatchesUrl(cookie: Record<string, string>, url: URL): boolean {
  const domain = cookie.domain?.replace(/^\./, "");
  if (domain && !url.hostname.endsWith(domain)) {
    return false;
  }
  const cookiePath = cookie.path ?? "/";
  return url.pathname.startsWith(cookiePath);
}

function extractElements(
  $: CheerioAPI,
  scopeRoot: Cheerio<AnyNode>,
  maxElements: number
): ExtractedElement[] {
  const elements: ExtractedElement[] = [];
  const collectedSignatures = new Set<string>();
  const usedProps = new Map<string, number>();

  for (const descriptor of ELEMENT_DESCRIPTORS) {
    scopeRoot.find(descriptor.selector).each((index: number, node: AnyNode) => {
      if (!isDomElement(node) || !node.attribs) {
        return;
      }
      const element: DomElement = node;
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

function buildLocator($: CheerioAPI, element: DomElement): LocatorDescriptor {
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

function elementSignature(element: DomElement): string {
  const attrs = (Object.entries(element.attribs ?? {}) as Array<[string, string]>)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("|");
  return `${getTagName(element)}|${attrs}`;
}

function getTagName(element: DomElement): string {
  return (element as unknown as { tagName?: string }).tagName ?? element.name ?? "div";
}

function buildPropertyName(element: DomElement, suffix: string): string {
  const baseCandidate =
    element.attribs?.["data-testid"] ||
    element.attribs?.name ||
    element.attribs?.id ||
    element.attribs?.placeholder ||
    element.attribs?.["aria-label"] ||
    suffix;
  const camel = toCamelCase(baseCandidate);
  return `${camel}${suffix}`;
}

function ensureUniquePropertyName(base: string, registry: Map<string, number>): string {
  if (!registry.has(base)) {
    registry.set(base, 1);
    return base;
  }
  const count = (registry.get(base) ?? 1) + 1;
  registry.set(base, count);
  return `${base}${count}`;
}

function inferLabel($: CheerioAPI, element: DomElement): string | undefined {
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

function dedupeElements(elements: ExtractedElement[]): ExtractedElement[] {
  const map = new Map<string, ExtractedElement>();
  for (const element of elements) {
    const key = `${element.locator.strategy}|${element.propName}`;
    if (!map.has(key)) {
      map.set(key, element);
    }
  }
  return Array.from(map.values());
}

function renderPageObjectClass(options: ResolvedOptions, elements: ExtractedElement[]): string {
  const lines: string[] = [];
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

function renderHelperMethod(element: ExtractedElement): string | undefined {
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

function buildUniqueCss($: CheerioAPI, element: DomElement): string {
  const id = element.attribs?.id;
  if (id) return `#${cssEscape(id)}`;

  const name = element.attribs?.name;
  if (name) {
    const selector = `${getTagName(element)}[name="${cssEscape(name)}"]`;
    if (uniqueCount($, selector) === 1) return selector;
  }

  const classes = (element.attribs?.class ?? "")
    .split(/\s+/)
    .filter((value: string | undefined): value is string => Boolean(value));
  if (classes.length) {
    const selector = `${getTagName(element)}${classes.map((cls: string) => `.${cssEscape(cls)}`).join("")}`;
    if (uniqueCount($, selector) === 1) return selector;
  }

  const pathSegments: string[] = [];
  let node: DomElement | null = element;
  while (node && (node as unknown as { type?: string }).type !== "root") {
    const parent = node.parent as DomElement | null;
    const tag = getTagName(node);
    const siblings =
      parent?.children?.filter(
        (child: ChildNode): child is DomElement => isDomElement(child) && getTagName(child) === tag
      ) ?? [];
    const index = siblings.indexOf(node as DomElement);
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

function uniqueCount($: CheerioAPI, selector: string): number {
  try {
    return $(selector).length;
  } catch {
    return 0;
  }
}

function isDomElement(node: AnyNode | null | undefined): node is DomElement {
  return Boolean(node && (node as DomElement).type === "tag");
}

function inferClassNameFromUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const candidate = segments[segments.length - 1] ?? parsed.hostname;
    return toPascalCase(candidate) || "GeneratedPage";
  } catch {
    return "GeneratedPage";
  }
}

function toCamelCase(input: string): string {
  const normalized = input
    .replace(/[^a-zA-Z0-9]+(.)/g, (_match: string, chr: string) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
  if (/^[a-zA-Z_]/.test(normalized)) {
    return normalized;
  }
  return `element${capitalize(normalized)}`;
}

function toPascalCase(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function cssEscape(value: string): string {
  return value.replace(/"/g, '\\"');
}

function escapeTsString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/'/g, "\\'");
}

function elapsed(start: number): number {
  return Math.round(performance.now() - start);
}
