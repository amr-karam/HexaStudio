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
    console.error("Uncaught error:", error);
    captureException(error);
  }, [error]);
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-8 text-center">
      {" "}
      <h2 className="mb-4 text-3xl font-light tracking-tight text-foreground">
        {" "}
        Something went wrong.{" "}
      </h2>{" "}
      <p className="mb-10 text-sm text-neutral-500 max-w-md leading-relaxed">
        {" "}
        The experience encountered an unexpected error. Please try again.{" "}
      </p>{" "}
      <button
        type="button"
        onClick={reset}
        className="border border-accent/30 px-8 py-3 text-xs uppercase tracking-widest text-accent transition-all duration-300 hover:bg-accent hover:text-background"
      >
        {" "}
        Try Again{" "}
      </button>{" "}
    </div>
  );
}
