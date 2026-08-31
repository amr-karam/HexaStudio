'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, DURATION } from '@/lib/motion';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import type { IconName } from './PortalIcons';

interface QuickAction {
  label: string;
  description: string;
  icon: IconName;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  badge?: string;
}

interface QuickActionsGridProps {
  actions?: QuickAction[];
  className?: string;
  title?: string;
  maxItems?: number;
}

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    label: 'New Project',
    description: 'Create a new project from template',
    icon: 'plus-circle',
    href: '/portal/projects/new',
    variant: 'primary',
  },
  {
    label: 'Upload Documents',
    description: 'Add files to your document vault',
    icon: 'upload',
    href: '/portal/documents/upload',
    variant: 'secondary',
  },
  {
    label: 'Submit Approval',
    description: 'Request client sign-off on deliverables',
    icon: 'file-check',
    href: '/portal/approvals/new',
    variant: 'secondary',
  },
  {
    label: 'View Invoices',
    description: 'Check outstanding payments and history',
    icon: 'receipt',
    href: '/portal/finance',
    variant: 'secondary',
  },
  {
    label: 'Start 3D Review',
    description: 'Launch collaborative WebRTC session',
    icon: 'box',
    href: '/portal/review',
    variant: 'ghost',
    badge: 'New',
  },
  {
    label: 'AI Copilot',
    description: 'Ask the AI spatial assistant',
    icon: 'sparkles',
    href: '/portal/copilot',
    variant: 'ghost',
  },
];

export function QuickActionsGrid({ actions = DEFAULT_ACTIONS, className: _className, title = 'Quick Actions', maxItems }: QuickActionsGridProps) {
  const prefersReduced = useReducedMotion();
  const { staticMode } = useMotionPolicy();
  const animate = !(staticMode || prefersReduced);

  const displayActions = maxItems ? actions.slice(0, maxItems) : actions;

  const variantStyles = {
    primary: 'bg-amber-500 text-sl-void hover:bg-amber-400 border-amber-500',
    secondary: 'bg-white/5 text-sl-alabaster hover:bg-white/10 border-sl-silver/30',
    ghost: 'bg-transparent text-sl-mist/60 hover:bg-white/5 hover:text-sl-alabaster border-sl-silver/20',
  };

  return (
    <section className="space-y-6" aria-label={title}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-sl-mist/60">{title}</h2>
        <span className="text-[10px] font-mono text-sl-mist/60">{displayActions.length} actions</span>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          role="list"
          aria-label={title}
        >
          {displayActions.map((action, index) => (
            <motion.article
              key={action.href}
              initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{
                duration: DURATION.component,
                delay: prefersReduced ? 0 : 0.08 * index,
                ease: EASE.entrance,
              }}
              className="group relative"
              role="listitem"
            >
              <a
                href={action.href}
                className={cn(
                  'flex items-start gap-4 p-5 rounded-xl border transition-all duration-300',
                  'hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10',
                  variantStyles[action.variant || 'secondary']
                )}
                aria-label={action.label}
              >
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300',
                    action.variant === 'primary' && 'bg-amber-500/20 text-amber-500 group-hover:bg-amber-500 group-hover:text-sl-void',
                    action.variant === 'secondary' && 'bg-white/5 text-sl-mist/40 group-hover:bg-amber-500/10 group-hover:text-amber-500',
                    action.variant === 'ghost' && 'bg-transparent text-sl-mist/40 group-hover:bg-white/5 group-hover:text-amber-500'
                  )}
                >
                  <Icon name={action.icon} className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sl-alabaster group-hover:text-amber-500 transition-colors">
                      {action.label}
                      {action.badge && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                          className="ml-2 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.1em] rounded bg-amber-500/20 text-amber-500 border border-amber-500/30"
                        >
                          {action.badge}
                        </motion.span>
                      )}
                    </h3>
                  </div>
                  <p className="text-sm text-sl-mist/60 mt-1 line-clamp-2">{action.description}</p>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="flex items-center gap-1 text-[10px] font-mono text-sl-mist/40 group-hover:text-amber-500 transition-colors"
                >
                  <span>Open</span>
                  <Icon name="arrow-up-right" className="w-3 h-3" />
                </motion.div>
              </a>
            </motion.article>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

export default QuickActionsGrid;