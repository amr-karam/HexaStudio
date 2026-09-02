import { defineConfig } from 'vitest/config';
import path from 'path';

// The shell environment exports NODE_ENV=production, which makes React resolve
// to react.production.js — a build that does NOT export `act`. RTL 16 relies on
// `react.act`, so every component test fails with "React.act is not a function".
// Force the development/test React build before any module (including React
// itself) is imported by setting NODE_ENV here, at config-eval time.
if (process.env.NODE_ENV !== 'test') {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'test',
    configurable: true,
    enumerable: true,
    writable: true,
  });
}

export default defineConfig({
  esbuild: { jsx: 'automatic' as const },
  oxc: false,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/constants': path.resolve(__dirname, './node_modules/next/constants.js'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/_corrupted_node_modules_stubs/**',
    ],
    css: false,
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts'],
    },
  },
});