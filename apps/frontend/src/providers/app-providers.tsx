"use client";

import { MotionConfig } from "framer-motion";
import { Providers } from "@/providers/query-provider";
import { AuthProvider } from "@/features/auth";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { CurrencyProvider } from "@/features/currency";
import { MotionPolicyProvider } from "@/providers/motion-policy-provider";
import { QualityProvider } from "@/providers/quality-provider";
import { LazyWebGLContextProvider } from "@/providers/lazy-webgl-context-provider";
import type { ReactNode } from "react";

/**
 * Context-only provider tree (no non-deterministic hooks, app-wide widgets, or
 * module-level browser side-effects). Rendered around the *interactive* section
 * of a page (e.g. <HomeClient />); never around the SSR hero so Next can inline
 * the hero's static HTML.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <QualityProvider>
        <LazyWebGLContextProvider
          autoRecover={true}
          maxRecoveryAttempts={3}
          recoveryDelayMs={1000}
          enableMetrics={true}
        >
          <MotionConfig reducedMotion="user">
            <Providers>
              <AuthProvider>
                <CurrencyProvider>
                  <MotionPolicyProvider>{children}</MotionPolicyProvider>
                </CurrencyProvider>
              </AuthProvider>
            </Providers>
          </MotionConfig>
        </LazyWebGLContextProvider>
      </QualityProvider>
    </LocaleProvider>
  );
}
