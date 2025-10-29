# QA Project Governance Guide

This document outlines the minimal expectations for automation projects created with `@yourorg/qa-core`.

## Branching
- Use trunk-based development with short-lived feature branches.
- Branch naming must follow `<ticket>/<short-description>` (e.g. `qa-123/add-login-tests`).

## Commit Messages
- Follow Conventional Commit convention (e.g. `feat: add login smoke cases`).
- Prefix commits with one of the allowed types listed in `common.rules.json`.

## Code Review
- Require at least one peer review for every pull request.
- Include evidence of successful test execution in the PR description (screenshots or command output).

## Test Categorisation
- Tag Playwright tests with `@Smoke`, `@Regression`, and business domain tags using the `@Tag` decorator.
- Mobile flows must capture screenshots or videos on failure and attach them to Allure reports.

## CI Expectations
- Execute `npm run build` and all `test:*` scripts for pull requests.
- Publish Allure results as a build artifact and as an HTML report.
- Run `npm run qa:validate` and `npm run lint` to guard governance.
