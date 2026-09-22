import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_RELEASE = process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined;

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

if (SENTRY_DSN && process.env.NODE_ENV === 'production') {
  const initSentry = async () => {
    const mod = await import('@sentry/nextjs');
    mod.init({
      dsn: SENTRY_DSN,
      enabled: process.env.NODE_ENV === 'production',
      release: SENTRY_RELEASE,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      tunnel: '/api/sentry',
    });

    const loadReplay = () => {
      import('@sentry/replay').then(({ replayIntegration }) => {
        Sentry.addIntegration(
          replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
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
  };

  if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
      initSentry();
    } else {
      window.addEventListener('load', initSentry, { once: true });
    }
  }
}
