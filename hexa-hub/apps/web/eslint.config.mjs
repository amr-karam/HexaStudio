import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

// Mirrors apps/frontend/eslint.config.mjs so both apps in the monorepo are
// held to the same standard. Deliberately does NOT pull in eslint-plugin-react
// (its transitive es-abstract dependency references an unresolvable package in
// this environment); the root frontend config proves react rules are not needed
// for a green gate.
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
    plugins: { "@next/next": nextPlugin },
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
  },
  {
    files: ["test/**/*.ts", "test/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
