"use client";
import { useEffect } from "react";
import { captureException } from '@sentry/nextjs';
export default function Error({
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
    <div role="alert" className="flex h-screen w-full flex-col items-center justify-center p-8 text-center">
      {" "}
      <h2 className="mb-4 text-3xl font-light tracking-tight text-sl-alabaster">
        {" "}
        Something went wrong.{" "}
      </h2>{" "}
      <p className="mb-10 text-sm text-sl-mist/60 max-w-md leading-relaxed">
        {" "}
        The experience encountered an unexpected error. Please try again.{" "}
      </p>{" "}
      <button
        type="button"
        onClick={reset}
        className="border border-sl-gold-subtle/30 px-8 py-3 text-xs uppercase tracking-widest text-sl-gold-hover transition-all duration-300 hover:bg-sl-gold-subtle hover:text-background"
      >
        {" "}
        Try Again{" "}
      </button>{" "}
    </div>
  );
}
