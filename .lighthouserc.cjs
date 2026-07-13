const { existsSync } = require('fs');
const path = require('path');

// Detect if we're running against the built standalone output or a live dev server
const isCI = process.env.CI === 'true';
const baseUrl = process.env.LHCI_BASE_URL || 'http://localhost:3000';

/** @type {import('@lhci/cli').LHCIConfig} */
module.exports = {
  ci: {
    collect: {
      // Start the Next.js standalone server before collecting
      startServerCommand: isCI
        ? `node ${path.join(__dirname, 'apps/frontend/.next/standalone/apps/frontend/server.js')}`
        : undefined,
      startServerReadyPattern: 'Ready',
      startServerReadyTimeout: 30000,
      url: [
        `${baseUrl}/`,
        `${baseUrl}/about`,
        `${baseUrl}/services`,
        `${baseUrl}/portfolio`,
        `${baseUrl}/contact`,
        `${baseUrl}/blog`,
      ],
      numberOfRuns: 3,
      settings: {
        // Simulate a fast 4G connection for consistent results
        throttlingMethod: 'simulate',
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1440,
          height: 900,
          deviceScaleFactor: 1,
          disabled: false,
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
        // Performance: target >95 for production release
        'categories:performance': ['warn', { minScore: 0.9 }],
        // Accessibility: mandatory
        'categories:accessibility': ['error', { minScore: 0.9 }],
        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        // SEO
        'categories:seo': ['warn', { minScore: 0.9 }],
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: {
      // Store results in temporary public storage for CI visibility
      target: 'temporary-public-storage',
    },
  },
};
