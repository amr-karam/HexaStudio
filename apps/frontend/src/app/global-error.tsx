"use client";

import { useEffect } from "react";
import { captureException } from "@sentry/nextjs";

export default function GlobalError({
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
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-sl-void text-sl-alabaster antialiased">
        <div role="alert" className="flex h-screen w-full flex-col items-center justify-center p-8 text-center">
          <h2 className="mb-4 text-3xl font-light tracking-tight text-sl-alabaster">
            Critical Error
          </h2>
          <p className="mb-10 text-sm text-sl-mist/60 max-w-md leading-relaxed">
            A critical error occurred. Please refresh the page to continue.
          </p>
          <button
            type="button"
            onClick={reset}
            className="border border-sl-gold-subtle/30 px-8 py-3 text-xs uppercase tracking-widest text-sl-gold-hover transition-all duration-300 hover:bg-sl-gold-subtle hover:text-background"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
