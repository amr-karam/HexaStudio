import routesConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

// Override: remove webServer, point to production
export default defineConfig({
  ...routesConfig,
  webServer: undefined,
  use: {
    ...routesConfig.use,
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://hexastudio.net',
  },
});
