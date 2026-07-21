import * as Sentry from '@sentry/nextjs';
import { replayIntegration } from '@sentry/replay';
import type { Event, EventHint } from '@sentry/core';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: process.env.NODE_ENV === 'production',
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'production',
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'unknown',
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/hexastudio\.net/],
    integrations: [
      replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.browserTracingIntegration(),
    ],
    ignoreErrors: [
      /ResizeObserver loop limit exceeded/,
      /Non-Error promise rejection captured/,
      /Network request failed/,
    ],
    beforeSend(event: Event, hint: EventHint) {
      if (process.env.NODE_ENV === 'production' && event.exception) {
        const error = hint.originalException;
        if (error instanceof Error && error.message?.includes('hydration')) {
          return null;
        }
      }
      return event;
    },
  });
}
