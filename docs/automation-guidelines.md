# Automation Guidelines

Use this document to align cross-project automation practices.

## Test Design
- Prefer business-readable test names and Allure steps.
- Reuse base page and client abstractions from `@yourorg/qa-core`.
- Keep fixtures lightweight; share through the utils module when applicable.

## Data Management
- Generate test data through `DataFactory` when possible.
- Reset database state via `DBManager` helpers between suites.
- Protect secrets using the environment profile system (`QA_PROFILE`).

## Reporting
- Collect Playwright traces on failure and publish Allure reports via `npm run qa:report`.
- Store raw `allure-results` for 14 days to unblock investigations.

## Quality Gates
- Web: >= 80% coverage on critical journeys.
- API: Validate contract and status codes for success and failure states.
- Mobile: Smoke run must cover authentication, navigation, and offline fallbacks.
