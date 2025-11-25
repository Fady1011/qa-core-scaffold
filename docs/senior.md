# Senior Guide

## Governance and gates
- Structure guard: `npm run qa:validate`.
- Reporting: `npm run qa:report` (Allure).
- Lint/type/style: `npm run lint`, `npm run format`, `npm run build`.
- Pre-merge: see `docs/quickstart.md` checklist.

## Environments
- Profiles resolved via `QA_ENV` (or `QA_PROFILE` fallback). Provide `.env.<env>` per environment; ship `.env.dev`, `.env.demo`, `.env.stage`, `.env.prod`.
- For strict pipelines, call `getQaEnvConfig(profile, { requireKeys: true })` where you must fail on missing env.

## Extending the CLI
- Commands live in `src/cli`. Register new ones in `src/cli/index.ts` using Commander.
- Keep defaults in `.genpo.json` where shared (e.g., page-object generator).

## Adding services
- Web: extend Playwright config at `src/web/playwright.config.ts`; base URL/browser come from env.
- Mobile: update `src/mobile/appium.config.ts` capabilities; prefer env-driven values.
- API: configure headers/tokens in `src/api/apiClient.ts` (env-backed).
- DB: adapters live in `src/db/adapters`; a `mock` adapter ships for demos. Add more adapters by implementing `DatabaseAdapter` and wiring into `DBClient`.
