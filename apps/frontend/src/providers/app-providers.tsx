'use client';

import { Providers } from '@/providers/query-provider';
import { AuthProvider } from '@/features/auth';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  usePerformanceMonitor();

  return (
    <Providers>
      <AuthProvider>{children}</AuthProvider>
    </Providers>
  );
}
