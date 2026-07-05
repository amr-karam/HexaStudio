import type { NextConfig } from 'next';

const sentryOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

const withSentryConfig = (config: NextConfig) => {
  if (!process.env.SENTRY_DSN) {
    return config;
  }

  return {
    ...config,
    sentryOptions,
  };
};

export default withSentryConfig;
