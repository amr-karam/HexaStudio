'use client';

import { useMotionPolicyContext } from '@/providers/motion-policy-provider';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { cn } from '@/lib/utils';

interface PauseAnimationsButtonProps {
  className?: string;
}

/**
 * Keyboard-accessible toggle to pause/resume all site animations.
 *
 * - `aria-pressed` reflects the current pause state.
 * - Hidden when reduced-motion is already active (the button would be redundant).
 * - Uses motion tokens for its own styling (no animation on itself).
 */
export function PauseAnimationsButton({ className }: PauseAnimationsButtonProps) {
  const { paused, togglePause } = useMotionPolicyContext();
  const { reducedMotion } = useMotionPolicy();

  // If OS already requests reduced motion, this toggle is redundant.
  if (reducedMotion) return null;

  return (
    <button
      type="button"
      onClick={togglePause}
      aria-pressed={paused}
      aria-label={paused ? 'Resume animations' : 'Pause animations'}
      className={cn(
        'flex items-center justify-center h-8 w-8 rounded-full',
        'border border-border/40 text-neutral-500 hover:text-accent hover:border-accent/40',
        'transition-colors duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      {paused ? (
        /* Play icon */
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M2.5 1.5L10.5 6L2.5 10.5V1.5Z" fill="currentColor" />
        </svg>
      ) : (
        /* Pause icon */
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="2" y="1.5" width="2.5" height="9" rx="0.5" fill="currentColor" />
          <rect x="7.5" y="1.5" width="2.5" height="9" rx="0.5" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}
