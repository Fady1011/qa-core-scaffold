# Quickstart

Follow one track (web, api, mobile) and you are up and running.

## Setup once
1. Install deps and browsers:
   - `npm install`
   - `npx playwright install chromium`
2. Choose an environment: copy `.env.example` to `.env` or edit `.env.dev` (default) / `.env.demo` / `.env.stage` / `.env.prod`.
3. Run with `QA_ENV=<profile>` (defaults to `dev`): `npm run demo:web` or `npx cross-env QA_ENV=stage npm run test:web`.

### Required env keys
- Web: `BASE_URL` (default `https://playwright.dev`), optional `BROWSER`.
- API: `API_BASE_URL`, optional `API_TOKEN`.
- Mobile: `APPIUM_HOST`, `APPIUM_PORT`, `DEVICE_NAME`, `PLATFORM_VERSION`, `MOBILE_APP_PATH` (or browser capability).
- DB: `DB_TYPE` (`mock` by default), plus host/port/name/user/pass for real DBs.

## Copy/paste demos
- Web: `npm run demo:web` (hits `https://playwright.dev`, takes a screenshot).  
  If it fails: run `npx playwright install chromium` or set `BASE_URL` to a reachable site.
- API: `npm run demo:api` (GET `/posts/1` on `jsonplaceholder.typicode.com` and schema-validate).  
  If it fails: check your network/VPN, or set `API_BASE_URL` to any reachable API.
- DB: `npm run demo:db` (uses mock adapter, no database needed).  
  If it fails: confirm `DB_TYPE=mock` or set real DB creds.
- Mobile: `npm run demo:mobile` (Appium + emulator/device).  
  If it fails: ensure Appium is installed (`npm install -g appium`), emulator running, and `DEVICE_NAME`/`PLATFORM_VERSION` match.

## Reporting & gates
- Allure HTML: `npm run qa:report`.
- Governance check: `npm run qa:validate`.
- Pre-merge checklist:
  - `npm run build`
  - `npm run demo:web` (and `demo:api` / `demo:db` / `demo:mobile` as relevant)
  - `npm run qa:validate`
  - Capture Allure report if needed.

## Examples & templates
- Web: `tests/example-playwright.test.ts`; template at `templates/web/tests/example.spec.ts`.
- API: `tests/api.playwright.spec.ts`; template at `templates/api/tests/api.spec.ts`.
- Mobile: `tests/mobile/sample.test.ts`; template at `templates/mobile/tests/mobile.test.ts`.
- DB: `tests/db.playwright.spec.ts` uses the mock adapter by default.
- Bootstrap a new project: `npx qa create-project my-suite --type web|api|mobile` (templates live under `templates/*/tests`).
