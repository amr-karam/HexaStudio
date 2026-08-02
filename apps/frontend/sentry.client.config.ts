import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_RELEASE = process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: process.env.NODE_ENV === 'production',
    release: SENTRY_RELEASE,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    tunnel: '/api/sentry',
  });

  // Split Sentry Replay: load lazily after idle / window load in production
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
