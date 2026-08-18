"use client";

import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { Providers } from "@/providers/query-provider";
import { AuthProvider } from "@/features/auth";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { CurrencyProvider } from "@/features/currency";
import { MotionPolicyProvider } from "@/providers/motion-policy-provider";
import { QualityProvider } from "@/providers/quality-provider";
import { WebGLContextProvider } from "@/engine/webgl/WebGLContextProvider";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  // Enable performance monitoring for WebGL scenes
  usePerformanceMonitor({ enabled: true });

  return (
    <LocaleProvider>
      <QualityProvider>
        <WebGLContextProvider 
          autoRecover={true}
          maxRecoveryAttempts={3}
          recoveryDelayMs={1000}
          enableMetrics={true}
        >
          <MotionConfig reducedMotion="user">
            <Providers>
              <AuthProvider>
                <CurrencyProvider>
                  <MotionPolicyProvider>
                    {children}
                  </MotionPolicyProvider>
                </CurrencyProvider>
                <Toaster
                  position="bottom-right"
                  richColors
                  closeButton
                  theme="dark"
                />
              </AuthProvider>
            </Providers>
          </MotionConfig>
        </WebGLContextProvider>
      </QualityProvider>
    </LocaleProvider>
  );
}
