'use client';

import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { Providers } from '@/providers/query-provider';
import { AuthProvider } from '@/features/auth';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { CurrencyProvider } from '@/features/currency';
import { MotionPolicyProvider } from '@/providers/motion-policy-provider';
import { QualityProvider } from '@/providers/quality-provider';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  usePerformanceMonitor({ enabled: false });

  return (
    <LocaleProvider>
      <QualityProvider>
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
      </QualityProvider>
    </LocaleProvider>
  );
}
