# Coding Standards

- TypeScript strict mode must remain enabled (`tsconfig.json`).
- Prefer async/await and avoid promise chaining.
- Expose shared functionality via module index files for DX.
- Document complex utilities with JSDoc-style comments.
- Keep business logic in tests minimal; move to page objects or clients.
