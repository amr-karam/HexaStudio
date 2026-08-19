import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    // Root project unit tests only. Other suites have their own runners:
    //   e2e/     -> Playwright  (npx playwright test)
    //   apps/api -> Jest        (npm test inside apps/api, jest.config.js)
    //   apps/web -> own vitest.config.ts (jsdom, scoped to src/**)
    include: ['tests/**/*.spec.ts', 'tests/**/*.test.ts'],
  },
});