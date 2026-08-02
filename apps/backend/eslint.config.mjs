import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // TypeScript handles undefined variables via tsc --noEmit
      "no-undef": "off",
    },
  },
  {
    files: ["test/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      // The root tsconfig excludes test/, so lint without type information.
      parserOptions: {
        project: null,
      },
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // Test files use relaxed rules: mocks routinely rely on `any` and the
      // `Function` type, and scaffolded test variables may go unused. Full
      // type-safety and strictness remain enforced on src/.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unused-vars": "off",
      // TypeScript handles undefined variables via tsc --noEmit
      "no-undef": "off",
    },
  },
];
