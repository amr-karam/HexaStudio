'use client';

import { useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';

interface ApiErrorDetail {
  message: string;
  status: number;
  url: string;
  timestamp: number;
}

// Debounce to avoid toast spam from multiple parallel failures
const shownErrors = new Set<string>();
const DEBOUNCE_MS = 5000;

export function useApiErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ApiErrorDetail>).detail;
      const key = `${detail.status}-${detail.url}`;

      // Skip duplicate toasts within debounce window
      if (shownErrors.has(key)) return;
      shownErrors.add(key);
      setTimeout(() => shownErrors.delete(key), DEBOUNCE_MS);

      toast.error(`Error ${detail.status}`, detail.message);
    };

    window.addEventListener('api:error', handler);
    return () => window.removeEventListener('api:error', handler);
  }, [toast]);
}
