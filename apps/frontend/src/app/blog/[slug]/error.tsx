'use client';

import { useEffect } from 'react';
import { captureException } from '@sentry/nextjs';

export default function BlogSlugError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <h2 className="mb-4 text-3xl font-light tracking-tight text-sl-alabaster">
        Article unavailable
      </h2>
      <p className="mb-10 max-w-md text-sm text-sl-mist/60 leading-relaxed">
        We couldn’t load this article. It may have been moved or the connection
        dropped. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="border border-sl-gold-subtle/30 px-8 py-3 text-xs uppercase tracking-widest text-sl-gold-hover transition-all duration-300 hover:bg-sl-gold-subtle hover:text-background"
      >
        Retry
      </button>
    </div>
  );
}
