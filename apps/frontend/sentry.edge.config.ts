import * as Sentry from '@sentry/nextjs';
import { headers } from 'next/headers';

const SENTRY_DSN = process.env.SENTRY_DSN;

export async function register() {
  if (SENTRY_DSN && process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: SENTRY_DSN,
      enabled: process.env.NODE_ENV === 'production',
      tracesSampleRate: 0.1,
    });
  }
}
