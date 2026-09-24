"use client";

import dynamic from "next/dynamic";

/**
 * S-023 deferral: WebGLContextProvider initializes a WebGL context and
 * pulls in Three.js / R3F / drei — a ~1.5MB shared runtime.
 *
 * This wrapper dynamically imports the provider with ssr: false so its
 * bundle is deferred until after critical paint, keeping LCP and TBT low.
 */
const WebGLContextProvider = dynamic(
  () =>
    import("@/providers/webgl-context-provider").then((m) => ({
      default: m.WebGLContextProvider,
    })),
  { ssr: false },
);

export function LazyWebGLContextProvider({
  children,
  autoRecover = true,
  maxRecoveryAttempts = 3,
  recoveryDelayMs = 1000,
  enableMetrics = true,
}: {
  children: React.ReactNode;
  autoRecover?: boolean;
  maxRecoveryAttempts?: number;
  recoveryDelayMs?: number;
  enableMetrics?: boolean;
}) {
  return (
    <WebGLContextProvider
      autoRecover={autoRecover}
      maxRecoveryAttempts={maxRecoveryAttempts}
      recoveryDelayMs={recoveryDelayMs}
      enableMetrics={enableMetrics}
    >
      {children}
    </WebGLContextProvider>
  );
}