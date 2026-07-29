'use client';

import { useApiErrorListener } from '@/lib/hooks/use-api-error-listener';

/**
 * Invisible component that listens for API errors and shows toast notifications.
 * Must be rendered inside ToastProvider.
 */
export function ApiErrorListener() {
  useApiErrorListener();
  return null;
}
