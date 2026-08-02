import { init, browserTracingIntegration, type ErrorEvent, type EventHint } from '@sentry/nextjs';
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  init({
    dsn: SENTRY_DSN,
    enabled: process.env.NODE_ENV === 'production',
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'production',
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'unknown',
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    tracePropagationTargets: ['localhost', /^https:\/\/hexastudio\.net/],
    integrations: [
      browserTracingIntegration(),
    ],
    ignoreErrors: [
      /ResizeObserver loop limit exceeded/,
      /Non-Error promise rejection captured/,
      /Network request failed/,
    ],
    beforeSend(event: ErrorEvent, hint: EventHint) {
      if (process.env.NODE_ENV === 'production' && event.exception) {
        const error = hint.originalException;
        if (error instanceof Error && error.message?.includes('hydration')) {
          return null;
        }
      }
      return event;
    },
  });

  // Split Sentry Replay: lazy load integration
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    const loadReplay = () => {
      import('@sentry/replay').then(({ replayIntegration }) => {
        Sentry.addIntegration(
          replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          })
        );
      }).catch(() => {});
    };

    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(loadReplay, { timeout: 4000 });
    } else {
      window.addEventListener('load', () => {
        setTimeout(loadReplay, 2000);
      });
    }
  }
}
