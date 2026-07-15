'use client';

import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { Providers } from '@/providers/query-provider';
import { AuthProvider } from '@/features/auth';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  usePerformanceMonitor();

  return (
    <MotionConfig reducedMotion="user">
      <Providers>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            theme="dark"
          />
        </AuthProvider>
      </Providers>
    </MotionConfig>
  );
}
