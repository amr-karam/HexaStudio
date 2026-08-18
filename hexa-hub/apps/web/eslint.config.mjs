import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

// Mirrors apps/frontend/eslint.config.mjs — same rule set so both apps in the
// monorepo are held to the same standard (no strict react-hooks v7 rules like
// set-state-in-effect/purity/static-components/immutability, which the root
// stack does not enable).
/** @type {import("eslint").Linter.Config[]} */
export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // "no-useless-catch" is too strict — synchronous throws from browser
      // extensions (e.g. Chrome Money Helper intercepting window.fetch) bypass
      // async/await and require a catch to propagate correctly to callers.
      "no-useless-catch": "off",
    },
  }
);
