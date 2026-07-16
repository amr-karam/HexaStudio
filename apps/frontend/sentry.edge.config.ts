import * as Sentry from '@sentry/nextjs';
import { headers } from 'next/headers';

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_RELEASE = process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined;

export async function register() {
  if (SENTRY_DSN && process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: SENTRY_DSN,
      enabled: process.env.NODE_ENV === 'production',
      release: SENTRY_RELEASE,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
    });
  }
}
