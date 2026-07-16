/**
 * Validated public environment variables for the frontend.
 * Centralizes access to NEXT_PUBLIC_* vars with safe defaults.
 */
import { API_BASE_URL, CMS_BASE_URL, SITE_URL } from '@/config/constants';

export const env = {
  apiUrl: API_BASE_URL,
  cmsUrl: CMS_BASE_URL,
  siteUrl: SITE_URL,
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  sentryRelease: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
} as const;
