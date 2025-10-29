# CI Template (GitHub Actions)

```yaml
name: qa-automation

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test:web
      - run: npm run test:api
      - run: npm run test:mobile
      - run: npm run qa:validate
      - run: npm run qa:report
      - uses: actions/upload-artifact@v4
        with:
          name: allure-report
          path: allure-report
```
