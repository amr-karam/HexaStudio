/**
 * Chromatic configuration for visual regression testing
 * Runs on CI to catch visual changes in UI components
 */

module.exports = {
  // Project token (set via CHROMATIC_PROJECT_TOKEN env var in CI)
  projectToken: process.env.CHROMATIC_PROJECT_TOKEN,

  // Only run on specific branches
  onlyChanged: true,

  // Stories to test
  storyStoreV7: true,

  // Auto-accept changes on main branch
  autoAcceptChanges: 'main',

  // Exit codes
  exitZeroOnChanges: false,
  exitOnceUploaded: true,

  // Build configuration
  buildScriptName: 'build-storybook',
  storybookBuildDir: 'storybook-static',

  // Test configuration
  testScriptName: 'test-storybook',
  testUrl: 'http://localhost:6006',

  // Viewport sizes to test
  viewports: [
    'mobile1',  // 320px
    'mobile2',  // 375px
    'tablet',   // 768px
    'desktop',  // 1024px
    'large',    // 1440px
  ],

  // Diff threshold (0-1, lower = more sensitive)
  diffThreshold: 0.2,

  // Ignore certain stories
  ignoreStories: [
    '*/ReducedMotion',
    '*/NoWebGL',
  ],

  // Chrome flags for 3D rendering
  chromeFlags: [
    '--enable-webgl',
    '--enable-webgl2',
    '--use-gl=swiftshader',
    '--ignore-gpu-blocklist',
    '--enable-unsafe-webgpu',
  ],

  // Delay for 3D scene to settle
  delay: 3000,

  // Capture delay per story
  captureDelay: 2000,

  // Retry flaky stories
  retries: 2,

  // Only run on specific branches
  branches: ['main', 'develop', 'feat/*'],

  // Exit codes
  exitCodeOnChanges: 1,
};