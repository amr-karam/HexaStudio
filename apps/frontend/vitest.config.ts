import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  // @ts-expect-error -- esbuild.jsx overrides tsconfig jsx: 'preserve' for Vitest
  esbuild: { jsx: 'automatic' as const },
  oxc: false,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts'],
    },
  },
});
