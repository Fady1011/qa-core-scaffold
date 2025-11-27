# Publishing to GitHub Packages

This package is scoped (`@yourorg/qa-core`) and configured to publish to GitHub Packages.

## Prereqs
- GitHub Personal Access Token (classic) with `read:packages` and `write:packages`, or `GITHUB_TOKEN` in CI with the same scopes.
- npm 7+ logged in: `npm login --registry=https://npm.pkg.github.com --scope=@yourorg` (username = GitHub handle, password = PAT, email = any).

## Publish (manual)
```bash
npm run build
GITHUB_TOKEN=xxxxx npm publish --registry=https://npm.pkg.github.com
```

## Install
Add to your consuming project's `.npmrc` (do not commit tokens):
```
@yourorg:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```
Then install:
```bash
npm install @yourorg/qa-core
```

## CI hints
- Use `NODE_AUTH_TOKEN` or `GITHUB_TOKEN` env var; npm automatically picks it up.
- Set `always-auth=true` if private repos enforce auth for all requests.
- For mixed sources, keep the default registry as npmjs and scope override for `@yourorg`:
  ```
  registry=https://registry.npmjs.org/
  @yourorg:registry=https://npm.pkg.github.com
  ```
