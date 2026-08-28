// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

export default tseslint.config({
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    ".turbo/**",
    "dist/**",
    "coverage/**",
    "**/__stories__/**",
    "src/stories/**",
  ],
}, js.configs.recommended, ...tseslint.configs.recommended, {
  plugins: { "@next/next": nextPlugin },
  rules: {
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs["core-web-vitals"].rules,
  },
}, {
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    // "no-useless-catch" is too strict — synchronous throws from browser
    // extensions (e.g. Chrome Money Helper intercepting window.fetch) bypass
    // async/await and require a catch to propagate correctly to callers.
    "no-useless-catch": "off",
  },
}, {
  files: ["test/**/*.ts", "test/**/*.tsx"],
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "@next/next/no-img-element": "off",
  },
}, storybook.configs["flat/recommended"]);
