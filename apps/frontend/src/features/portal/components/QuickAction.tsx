'use client';

/**
 * HEXA Portal — Quick Action Button
 *
 * A premium action button with icon, label, description,
 * hover lift + glow animation. Used in the dashboard quick actions grid.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE, DURATION } from '@/lib/motion';

interface QuickActionProps {
  icon: IconName;
  label: string;
  description: string;
  onClick: () => void;
  className?: string;
}

export function QuickAction({ icon, label, description, onClick, className }: QuickActionProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      whileHover={
        prefersReduced
          ? undefined
          : {
              y: -3,
              boxShadow: '0 12px 40px -12px var(--color-gold-20)',
            }
      }
      whileTap={prefersReduced ? undefined : { scale: 0.98 }}
      transition={{
        duration: DURATION.component,
        ease: EASE.entrance,
      }}
      className={cn(
        'group flex items-start gap-4 p-4 rounded-xl text-left w-full',
        'bg-white/[0.02] border border-sl-silver/20',
        'hover:border-sl-gold-subtle/30 hover:bg-sl-gold-subtle/[0.03]',
        'transition-colors duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        className,
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-sl-gold-subtle/5 border border-sl-gold-subtle/10 flex items-center justify-center shrink-0 group-hover:border-sl-gold-subtle/30 transition-colors duration-300">
        <Icon name={icon} size={18} className="text-sl-gold-hover" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-sl-alabaster font-medium group-hover:text-sl-gold-hover transition-colors duration-300">
          {label}
        </p>
        <p className="text-xs text-sl-mist/60 mt-0.5">{description}</p>
      </div>
    </motion.button>
  );
}
