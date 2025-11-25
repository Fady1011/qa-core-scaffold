# @yourorg/qa-core

`@yourorg/qa-core` is a reusable QA automation scaffold for web, API, and mobile projects. It centralises configuration, governance, and reporting patterns so delivery teams can focus on business logic.

## Features
- Playwright base abstractions and configuration.
- Axios-based API client with AJV schema validation.
- WebdriverIO + Appium setup for mobile automation.
- Database adapters for MySQL, Postgres, and MSSQL.
- Allure reporting utilities and CLI commands.
- Governance artefacts, docs, and project templates.

## Scripts
- `npm run build` - compile TypeScript to `dist`.
- `npm run test:web` - run Playwright web suites using project config.
- `npm run test:api` - exercise API scenarios through Playwright's runner.
- `npm run test:mobile` - execute WebdriverIO suites.
- `npm run qa:validate` - enforce governance structure.
- `npm run qa:report` - generate Allure HTML reports.

## CLI
Use the bundled CLI to bootstrap new automation workspaces:

```bash
npx qa create-project my-web-suite --type web
npx qa validate
npx qa db:check --type mysql
npx qa generate-page-object --url https://example.com --class-name ExamplePage --rendered --wait-for "#app"
```

The page-object generator honours configuration defaults stored in `.genpo.json`. Use this file to pin shared values such as output directories, storage state paths, or scopes:

```json
{
  "defaults": {
    "outputDir": "e2e/pages",
    "scope": "#app",
    "rendered": true,
    "storageState": "e2e/.auth/admin.json",
    "logLevel": "info"
  }
}
```

Override any default at run-time via CLI flags (e.g. `--no-dedupe`, `--max 50`, `--log-level debug`) or by using the npm script `npm run qa:generate-po -- --url ...`.

## Publishing
1. Update the version in `package.json`.
2. Run `npm run build`.
3. Publish with `npm publish --access public`.

## Getting started
- Quick copy/paste onboarding and demo scripts: `docs/quickstart.md`.
- Role guides: `docs/getting-started-junior.md`, `docs/journeyman.md`, `docs/senior.md`.

## License
MIT
