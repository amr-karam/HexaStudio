const { existsSync } = require('fs');
const path = require('path');

// Detect if we're running against the built standalone output or a live dev server
const isCI = process.env.CI === 'true';
const baseUrl = process.env.LHCI_BASE_URL || 'http://localhost:3000';

/** @type {import('@lhci/cli').LHCIConfig} */
module.exports = {
  ci: {
    collect: {
      // Start the Next.js server before collecting
      startServerCommand: isCI
        ? `node ${path.join(__dirname, 'apps/frontend/.next/standalone/apps/frontend/server.js')}`
        : 'npm run start --workspace=apps/frontend',
      startServerReadyPattern: 'Ready on',
      startServerReadyTimeout: 60000,
      url: [
        `${baseUrl}/`,
        `${baseUrl}/about`,
        `${baseUrl}/projects`,
        `${baseUrl}/contact`,
        `${baseUrl}/legal`,
      ],
      numberOfRuns: 5,
      settings: {
        // Desktop configuration
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,
          throughputKbps: 16384,
          cpuSlowdownMultiplier: 1,
        },
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        // Chrome flags for desktop
        chromeFlags: '--headless --disable-gpu',
        // Mobile configuration
        mobileConfig: {
          formFactor: 'mobile',
          screenEmulation: {
            mobile: true,
            width: 375,
            height: 812,
            deviceScaleFactor: 2,
          },
          throttling: {
            rttMs: 150,
            throughputKbps: 1638.4,
            cpuSlowdownMultiplier: 4,
          },
          chromeFlags: '--headless --disable-gpu --window-size=375,812',
        },
        // Skip audits that require real network/services
        skipAudits: [
          'uses-http2',
          'redirects-http',
        ],
      },
    },
    assert: {
      assertions: {
        // Performance: target 95+ (strict requirement)
        'categories:performance': ['error', { minScore: 0.95 }],
        // Accessibility: target 98+ (strict requirement)
        'categories:accessibility': ['error', { minScore: 0.98 }],
        // Best Practices: target 95+ (strict requirement)
        'categories:best-practices': ['error', { minScore: 0.95 }],
        // SEO: target 90+ (strict requirement)
        'categories:seo': ['error', { minScore: 0.90 }],
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 100 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'speed-index': ['error', { maxNumericValue: 2500 }],
        'interactive': ['error', { maxNumericValue: 3800 }],
      },
    },
    upload: {
      // Store results in temporary public storage for CI visibility
      target: 'temporary-public-storage',
    },
  },
};
