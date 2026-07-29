'use client';

import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <RefreshCw size={32} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-serif font-light text-white mb-3">Application Error</h1>
        <p className="text-[#888] font-light mb-8">
          A critical error occurred. Please try again or contact support if the issue persists.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4A843] text-[#0A0A0A] rounded-lg text-sm font-medium hover:bg-[#D4A843]/90 transition-all"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      </div>
    </div>
  );
}
