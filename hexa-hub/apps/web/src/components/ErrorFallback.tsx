'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorFallbackProps {
  error?: Error | null;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

export function ErrorFallback({
  error,
  message,
  onRetry,
  showHomeButton = true,
}: ErrorFallbackProps) {
  const router = useRouter();

  const errorMessage =
    message || error?.message || 'An unexpected error occurred. Please try again.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-[400px] flex items-center justify-center p-8"
    >
      <div className="text-center max-w-md">
        {/* Error icon with gold accent */}
        <div className="relative mx-auto mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#D4A843]/10 border border-[#D4A843]/20 flex items-center justify-center">
            <AlertTriangle size={32} className="text-[#D4A843]" />
          </div>
        </div>

        <h2 className="text-xl font-serif font-light text-white mb-3">
          Something went wrong
        </h2>

        <p className="text-sm text-[#888] font-light mb-8 max-w-xs mx-auto leading-relaxed">
          {errorMessage}
        </p>

        <div className="flex items-center justify-center gap-3">
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A843] text-[#0A0A0A] rounded-xl text-sm font-medium hover:bg-[#D4A843]/90 hover:shadow-[0_0_24px_rgba(212,168,67,0.2)] transition-all duration-200"
            >
              <RefreshCw size={15} />
              Try Again
            </motion.button>
          )}

          {showHomeButton && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F1F1F] text-[#888] rounded-xl text-sm font-medium border border-[#262626] hover:text-white hover:border-[#444] transition-all duration-200"
            >
              <Home size={15} />
              Go Home
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
