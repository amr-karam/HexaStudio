// Vitest + jest-axe matcher type augmentation.
//
// `@types/jest-axe` augments the Jest (`jest.Matchers`) and `@jest/expect`
// interfaces, but this project runs tests with Vitest, whose `expect()`
// returns a `vitest` `Assertion`. Without an explicit augmentation for
// Vitest's interface, `expect(results).toHaveNoViolations()` fails
// typecheck with: Property 'toHaveNoViolations' does not exist on type
// 'Assertion'.
//
// This file bridges that gap by declaring the matcher on the Vitest
// assertion types. It is picked up automatically because tsconfig
// includes `**/*.ts` under apps/frontend.

import 'vitest';

declare module 'vitest' {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
