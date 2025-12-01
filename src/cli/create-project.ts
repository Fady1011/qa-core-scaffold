import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Command } from "commander";
import { copyTemplateDirectory, ensureDir, pathExists, writeFileSafely } from "../utils/fileHelper.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_TYPES = ["web", "api", "mobile", "all"] as const;
type TemplateType = (typeof TEMPLATE_TYPES)[number];

const BASE_DIRECTORIES = [
  "src/web",
  "src/api",
  "src/mobile",
  "src/db",
  "src/utils",
  "src/governance",
  "docs",
  "tests"
] as const;

async function scaffoldBaseStructure(
  rootDestination: string,
  projectName: string,
  force: boolean
): Promise<void> {
  for (const dir of BASE_DIRECTORIES) {
    await ensureDir(path.resolve(rootDestination, dir));
  }

  const pkgPath = path.resolve(rootDestination, "package.json");
  if (!pathExists(pkgPath) || force) {
    const pkg = {
      name: projectName,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        "test:web":
          'playwright test tests/**/*.spec.ts --config=node_modules/@fady1011/qa-core/dist/web/playwright.config.js',
        "test:api":
          'playwright test tests/**/*.spec.ts --config=node_modules/@fady1011/qa-core/dist/web/playwright.config.js',
        "test:mobile": "wdio run node_modules/@fady1011/qa-core/dist/mobile/appium.config.js",
        "qa:validate": "qa validate",
        "qa:lint": "qa lint"
      },
      dependencies: {
        "@fady1011/qa-core": "^0.3.7"
      }
    };
    await writeFileSafely(pkgPath, JSON.stringify(pkg, null, 2));
  }

  const tsconfigPath = path.resolve(rootDestination, "tsconfig.json");
  if (!pathExists(tsconfigPath) || force) {
    const tsconfig = {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "Node",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        strict: true,
        outDir: "dist",
        rootDir: "."
      },
      include: ["src", "tests"]
    };
    await writeFileSafely(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  }

  const envExamplePath = path.resolve(rootDestination, ".env.example");
  if (!pathExists(envExamplePath) || force) {
    const envContent = [
      "QA_ENV=demo",
      "BASE_URL=https://playwright.dev",
      "API_BASE_URL=https://jsonplaceholder.typicode.com",
      "API_TOKEN=",
      "DB_TYPE=mock",
      "DB_HOST=localhost",
      "DB_PORT=3306",
      "DB_NAME=demo",
      "DB_USER=demo",
      "DB_PASS=demo",
      "APPIUM_HOST=127.0.0.1",
      "APPIUM_PORT=4723",
      "DEVICE_NAME=Android Emulator",
      "PLATFORM_VERSION=13",
      "MOBILE_APP_PATH=./apps/demo.apk"
    ].join("\n");
    await writeFileSafely(envExamplePath, envContent);
  }

  for (const profile of ["dev", "stage", "prod"] as const) {
    const envPath = path.resolve(rootDestination, `.env.${profile}`);
    if (!pathExists(envPath) || force) {
      const envProfile = [
        `QA_ENV=${profile}`,
        "BASE_URL=https://app.example.com",
        "API_BASE_URL=https://api.example.com",
        "API_TOKEN=",
        "DB_TYPE=mock",
        "DB_HOST=localhost",
        "DB_PORT=3306",
        "DB_NAME=demo",
        "DB_USER=demo",
        "DB_PASS=demo",
        "APPIUM_HOST=127.0.0.1",
        "APPIUM_PORT=4723",
        "DEVICE_NAME=Android Emulator",
        "PLATFORM_VERSION=13",
        "MOBILE_APP_PATH=./apps/demo.apk"
      ].join("\n");
      await writeFileSafely(envPath, envProfile);
    }
  }

  const readmePath = path.resolve(rootDestination, "README.md");
  if (!pathExists(readmePath)) {
    const readme = `# ${projectName}

Scaffolded with @fady1011/qa-core.

- Web tests under tests/ (Playwright)
- API tests under tests/ (Playwright + ApiClient)
- Mobile config via Appium (wdio)
- DB utilities via qa-core db clients

Common commands:
- npm run test:web
- npm run test:api
- npm run test:mobile
- npm run qa:validate
`;
    await writeFileSafely(readmePath, readme);
  }

  const gettingStartedPath = path.resolve(rootDestination, "docs", "GETTING_STARTED.md");
  if (!pathExists(gettingStartedPath) || force) {
    const guide = `# Getting Started

1) Install dependencies
   - npm install
   - npx playwright install chromium

2) Pick an environment
   - Copy .env.example to .env or use the provided .env.dev/.env.stage/.env.prod
   - Run with QA_ENV=<env> (defaults to dev)

3) Run demos
   - npm run test:web
   - npm run test:api
   - npm run test:mobile (requires Appium/emulator)
   - npm run qa:validate

4) Add tests
   - Web/API/Mobile samples live under tests/
   - Use qa CLI: npx qa generate-page-object --url https://example.com --class-name ExamplePage
`;
    await writeFileSafely(gettingStartedPath, guide);
  }
}

async function scaffoldSingleTemplate(
  template: Exclude<TemplateType, "all">,
  destinationDir: string,
  force: boolean
) {
  const templateDir = path.resolve(__dirname, "../../templates", template);
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template directory not found for type ${template}`);
  }

  if (!pathExists(destinationDir)) {
    await ensureDir(destinationDir);
  }

  logger.info({ templateDir, destinationDir }, "Scaffolding project");
  await copyTemplateDirectory(templateDir, destinationDir);
}

export function buildCreateProjectCommand() {
  const command = new Command("create-project");

  return command
    .description("Scaffold a new QA automation project from templates")
    .argument("<name>", "Name of the destination project directory")
    .option("-t, --type <type>", "Project type", "web")
    .option("-d, --directory <directory>", "Workspace directory", ".")
    .option("-f, --force", "Overwrite if directory exists", false)
    .option("--append", "Add this template into an existing project directory", false)
    .action(
      async (
        name: string,
        options: { type: TemplateType; directory: string; force: boolean; append: boolean }
      ) => {
        const { type, directory, force } = options;
        if (!TEMPLATE_TYPES.includes(type)) {
          throw new Error(`Unsupported template type: ${type}`);
        }

        const rootDestination = path.resolve(process.cwd(), directory, name);
        const rootExisted = pathExists(rootDestination);
        if (!rootExisted) {
          await ensureDir(rootDestination);
        }
        await scaffoldBaseStructure(rootDestination, name, force);

        if (type === "all") {
          const existing: string[] = [];
          for (const subType of ["web", "api", "mobile"] as const) {
            const marker = path.resolve(rootDestination, `templates-${subType}.marker`);
            if (pathExists(marker) && !force) {
              existing.push(subType);
            }
          }
          if (existing.length && !force) {
            throw new Error(
              `Templates already applied for: ${existing.join(", ")}. Use --force to overwrite.`
            );
          }

          for (const subType of ["web", "api", "mobile"] as const) {
            await scaffoldSingleTemplate(subType, rootDestination, force);
            await writeFileSafely(
              path.resolve(rootDestination, `templates-${subType}.marker`),
              "applied"
            );
          }
          logger.info({ destinationDir: rootDestination }, "Scaffolded all templates");
          return;
        }

        const markerPath = path.resolve(rootDestination, `templates-${type}.marker`);
        if (pathExists(markerPath) && !force) {
          throw new Error(
            `Template ${type} already applied. Use --force to overwrite or choose a different name.`
          );
        }

        await scaffoldSingleTemplate(type, rootDestination, force);
        await writeFileSafely(markerPath, "applied");
        logger.info({ destinationDir: rootDestination }, "Project scaffold complete");
      }
    );
}

if (process.argv[1]?.includes("create-project")) {
  buildCreateProjectCommand().parseAsync(process.argv);
}
