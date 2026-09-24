import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      ".turbo/**",
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
      "no-useless-catch": "off",
    },
  },
  {
    files: ["test/**/*.ts", "test/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["scripts/**/*.mjs", "next.config.ts"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
