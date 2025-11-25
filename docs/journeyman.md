# Journeyman Guide

## Add a new web page object
1. Create `src/web/pages/MyPage.ts` extending `BasePage`.
2. Expose actions/assertions using `this.page` helpers (`click`, `type`, `waitForElement`).
3. Use it in a spec: `const page = new MyPage(testPage); await page.goto({ url: "/path" });`

## Add an API contract
1. Add a schema beside your spec (JSON Schema).
2. In the test, call `const result = validator.validate(schema, response.data); expect(result.valid).toBe(true);`
3. For stricter failures, use `validator.assertValid(schema, response.data);`

## Add a DB query
1. Define the SQL in `src/db/dbQueries/*.ts`.
2. Call `await manager.runQuery(sql, params);`
3. For local/demo runs, use `DB_TYPE=mock`. For real DBs, set `DB_TYPE=mysql|postgres|mssql` and fill creds in `.env.<env>`.

## Switch environments
- Use `npx cross-env QA_ENV=stage npm run test:web` to load `.env.stage`. Profiles resolve in this order: `.env.<env>.local`, `.env.<env>`, `.env.local`, `.env`.

## Bootstrap a project
- `npx qa create-project my-suite --type web|api|mobile` and edit the generated tests under `templates/*/tests`.
