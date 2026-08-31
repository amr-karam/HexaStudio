'use client';

/**
 * SentimentUrgencyBadge
 *
 * Cinematic, sentiment-aware urgency beacon for the Signing Chamber.
 *
 * Renders a glowing orb whose color and animation pulse communicate the
 * real-time sentiment inferred from the client's chat history:
 *
 *  - positive  → emerald glow, steady pulse (client is receptive)
 *  - neutral   → amber glow, relaxed pulse (typical waiting tone)
 *  - frustrated → amber-crimson glow, nervous pulse (elevated tension)
 *  - urgent    → crimson beacon, accelerated strobe (requires immediate attention)
 *
 * When no sentiment data is available, a subtle neutral dot is rendered.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { ApprovalSentiment } from '../types';
import { Icon } from './PortalIcons';

interface SentimentUrgencyBadgeProps {
  sentiment?: ApprovalSentiment;
  urgencyScore?: number;
}

const SENTIMENT_CONFIG: Record<NonNullable<ApprovalSentiment>, { color: string; label: string; icon: string }> = {
  positive: { color: 'bg-emerald-400', label: 'Client Receptive', icon: 'smile' },
  neutral: { color: 'bg-amber-400', label: 'Neutral Tone', icon: 'meh' },
  frustrated: { color: 'bg-orange-400', label: 'Elevated Tension', icon: 'frown' },
  urgent: { color: 'bg-red-400', label: 'Urgent Attention', icon: 'alert-triangle' },
};

export function SentimentUrgencyBadge({ sentiment, urgencyScore }: SentimentUrgencyBadgeProps) {
  const reduced = useReducedMotion();

  // No sentiment data — render a subtle neutral dot (graceful degradation).
  if (!sentiment) {
    return (
      <span
        aria-label="No sentiment data"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-neutral-600/40 bg-neutral-700/30"
      />
    );
  }

  const cfg = SENTIMENT_CONFIG[sentiment];
  const pulseSpeed = sentiment === 'urgent' ? 0.9 : sentiment === 'frustrated' ? 1.4 : 2.2;
  const glowIntensity = sentiment === 'urgent' ? 'shadow-[0_0_16px_theme(colors.red.300)]' : 'shadow-[0_0_12px_theme(colors.amber.300)]';
  const urgencyLabel = urgencyScore != null ? `${urgencyScore}% urgency` : cfg.label;

  return (
    <motion.div
      className={cn(
        'relative inline-flex h-6 w-6 items-center justify-center rounded-full border',
        cfg.color,
        'border-white/30',
        glowIntensity,
      )}
      animate={reduced ? undefined : { opacity: [0.7, 1, 0.7] }}
      transition={{ duration: pulseSpeed, repeat: Infinity, ease: 'easeInOut' }}
      role="img"
      aria-label={urgencyLabel}
      title={urgencyLabel}
    >
      <Icon name={cfg.icon as never} className="h-3 w-3 text-white" />
      <span className="sr-only">{urgencyLabel}</span>
    </motion.div>
  );
}
