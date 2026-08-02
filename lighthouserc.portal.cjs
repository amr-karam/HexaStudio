const path = require('path');

// Configuration for authenticated portal audits
const baseUrl = process.env.LHCI_BASE_URL || 'http://localhost:3001';
const jwtToken = process.env.PORTAL_JWT_TOKEN || 'test-token';

/** @type {import('@lhci/cli').LHCIConfig} */
module.exports = {
  ci: {
    collect: {
      // Start the Next.js server for the portal
      startServerCommand: 'npm run start --workspace=hexa-hub/apps/web',
      startServerReadyPattern: 'Ready on',
      startServerReadyTimeout: 60000,
      url: [
        `${baseUrl}/dashboard`,
        `${baseUrl}/channels`,
        `${baseUrl}/projects`,
        `${baseUrl}/invoices`,
      ],
      numberOfRuns: 5,
      settings: {
        // Simulate a fast 4G connection for consistent results
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
        // Mobile configuration for portal
        mobileConfig: {
          formFactor: 'mobile',
          screenEmulation: {
            mobile: true,
            width: 414,
            height: 896,
            deviceScaleFactor: 2,
          },
          throttling: {
            rttMs: 150,
            throughputKbps: 1638.4,
            cpuSlowdownMultiplier: 4,
          },
        },
        // Authentication headers
        extraHeaders: {
          'Authorization': `Bearer ${jwtToken}`,
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
        'categories:performance': ['error', { minScore: 0.95 }],
        // Accessibility: mandatory
        'categories:accessibility': ['error', { minScore: 0.95 }],
        // Best Practices
        'categories:best-practices': ['error', { minScore: 0.95 }],
        // SEO
        'categories:seo': ['warn', { minScore: 0.8 }],
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'interactive': ['error', { maxNumericValue: 3800 }],
        'speed-index': ['error', { maxNumericValue: 2500 }],
      },
    },
    upload: {
      // Store results in temporary public storage for CI visibility
      target: 'temporary-public-storage',
    },
  },
};
