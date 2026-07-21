import * as Sentry from '@sentry/nextjs';
import { replayIntegration } from '@sentry/replay';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_RELEASE = process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: process.env.NODE_ENV === 'production',
    release: SENTRY_RELEASE,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tunnel: '/api/sentry',
  });
}
