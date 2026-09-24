"use client";

import { MotionConfig } from "framer-motion";
import { Providers } from "@/providers/query-provider";
import { AuthProvider } from "@/features/auth";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { CurrencyProvider } from "@/features/currency";
import { MotionPolicyProvider } from "@/providers/motion-policy-provider";
import { QualityProvider } from "@/providers/quality-provider";
import type { ReactNode } from "react";

/**
 * Context-only provider tree for pages that need query/auth/locale/etc.
 * Intentionally excludes `LazyWebGLContextProvider` (scoped to the few
 * client-side 3D canvases that actually consume it) and app-wide widgets
 * (handled by `AppLayoutWidgets`), so this boundary stays deterministic and
 * can wrap {children} without forcing a BAILOUT.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <QualityProvider>
        <MotionConfig reducedMotion="user">
          <Providers>
            <AuthProvider>
              <CurrencyProvider>
                <MotionPolicyProvider>{children}</MotionPolicyProvider>
              </CurrencyProvider>
            </AuthProvider>
          </Providers>
        </MotionConfig>
      </QualityProvider>
    </LocaleProvider>
  );
}
