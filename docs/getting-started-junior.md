# Getting Started (Junior)

1) Run a demo  
- Web: `npm run demo:web`  
- API: `npm run demo:api`  
- DB: `npm run demo:db`  
- Mobile: `npm run demo:mobile` (needs Appium + emulator/device)

2) Switch environments  
- Use `npm run demo:web` (defaults to `QA_ENV=demo`) or `npx cross-env QA_ENV=stage npm run test:web` to load `.env.<env>`.

3) Make a tiny change  
- Web: open `tests/example-playwright.test.ts`, change the locator in `waitForElement("body")` to something on your site, then rerun `npm run demo:web`.
- API: change the schema in `tests/api.playwright.spec.ts` (add/remove a required field) and rerun `npm run demo:api`.
- DB: with `DB_TYPE=mock`, tweak the query in `tests/db.playwright.spec.ts` and rerun `npm run demo:db`.

4) Add an assertion  
- Web: `await expect(page.getByRole("heading", { name: "Your text" })).toBeVisible();`
- API: add `expect(response.data.title).toBeDefined();`

5) When stuck  
- Re-run with `QA_ENV=demo` and the provided `.env.demo`.
- Install browsers: `npx playwright install chromium`.
- Check quick fixes in `docs/quickstart.md`.
