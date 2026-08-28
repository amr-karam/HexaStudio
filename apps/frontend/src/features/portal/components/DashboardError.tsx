'use client';

/**
 * HEXA Portal — Dashboard Error State
 *
 * Honest error display when the dashboard API fails.
 * Provides a retry button with loading state.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from './PortalIcons';

interface DashboardErrorProps {
  onRetry: () => void;
  isRetrying: boolean;
  message?: string;
}

export function DashboardError({ onRetry, isRetrying, message }: DashboardErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={cn(
        'relative rounded-2xl border border-sl-silver/20 bg-sl-obsidian/70',
        'p-8 sm:p-12 flex flex-col items-center justify-center text-center',
      )}
    >
      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-sl-stone/20 border border-sl-silver/10 mb-6">
        <Icon name="alert-circle" size={28} className="text-sl-warm-neutral" />
        <span
          className="absolute -bottom-0.5 -right-0.5 block h-2 w-2 rotate-45 border border-sl-silver/50 bg-sl-obsidian"
          aria-hidden="true"
        />
      </div>

      <h2 className="text-xl font-serif font-light text-sl-alabaster mb-2">
        Unable to Load Dashboard
      </h2>
      <p className="text-sm text-sl-silver max-w-md mb-6">
        {message ??
          'We couldn\'t fetch your project data right now. Please check your connection and try again.'}
      </p>

      <button
        onClick={onRetry}
        disabled={isRetrying}
        className={cn(
          'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl',
          'bg-sl-gold-hover text-sl-obsidian font-semibold',
          'hover:brightness-110 transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-hover',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-sl-obsidian',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {isRetrying ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
            Retrying...
          </>
        ) : (
          <>
            <Icon name="refresh-cw" size={16} />
            Retry
          </>
        )}
      </button>
    </motion.div>
  );
}
