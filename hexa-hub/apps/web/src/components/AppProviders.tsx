'use client';

import React from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { ToastProvider } from '@/components/ToastProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ApiErrorListener } from '@/components/ApiErrorListener';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <SocketProvider>
            <ToastProvider>
              <ApiErrorListener />
              {children}
            </ToastProvider>
          </SocketProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
