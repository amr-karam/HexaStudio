# ⚙️ HEXA STUDIO — ENGINEERING STANDARDS

**Version:** 1.0.0  
**Authority Level:** 5  
**Scope:** TypeScript Strictness, Code Formatting, Testing Standards, & Definition of Done  

---

## 1. TYPESCRIPT STRICTNESS RULES

1. **Zero `any` Types Allowed**: Use explicit types, interfaces, or generics. If an external API returns untyped data, type it with `unknown` and validate via Zod schema parsing.
2. **Strict Null Checks**: Always handle `null` and `undefined` explicitly before dereferencing properties.
3. **Workspace Workspace Imports**: Always consume monorepo packages via NPM workspace imports (`@hexastudio/types`, `@hexastudio/utils`, `@hexastudio/ui`).
4. **No `@ts-ignore` or `@ts-nocheck`**: Suppressing TypeScript type checking is forbidden unless fixing an un-typed third-party library with an explicit comment explaining why.

---

## 2. CODE FORMATTING & LINTING

- **ESLint**: Standard `--max-warnings=0` policy across all workspaces (`apps/frontend`, `apps/backend`, `apps/mobile`).
- **Formatting**: Prettier configuration with 2 spaces indentation, single quotes, trailing commas, and 100 max line length.
- **Imports**: Group imports by:
  1. Built-in Node/React modules
  2. Third-party packages (`framer-motion`, `@tanstack/react-query`)
  3. Internal monorepo workspaces (`@hexastudio/*`)
  4. Relative components & utilities (`./`, `../`)

---

## 3. TESTING & VERIFICATION STANDARDS

- **Unit & Integration Tests**: Vitest for `apps/frontend` and `apps/backend`; Jest for `apps/mobile`.
- **E2E Testing**: Playwright for end-to-end user journey tests (`apps/frontend/e2e/`).
- **Mocking**: External APIs (Odoo, Strapi, S3, OpenAI) MUST be mocked in test environments using MSW or Vitest mocks.

---

## 4. QUALITY GATE EXECUTION COMMANDS

```bash
# Run complete verification sweep
npm run lint --workspace=apps/frontend
npm run typecheck --workspace=apps/frontend
npm run test --workspace=apps/frontend

npm run lint --workspace=apps/backend
npm run typecheck --workspace=apps/backend
npm run test --workspace=apps/backend
```
