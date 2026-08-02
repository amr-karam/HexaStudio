'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { REDUCED_TRANSITION, makeTransition } from '@/lib/motion';
import { EASING, DUR, STAGGER_TOKENS } from '@/lib/motion/tokens';
import { CurrencySelector } from '@/features/currency/CurrencySelector';

interface NavItemData {
  label: string;
  href: string;
}

interface NavbarMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItemData[];
  pathname: string;
  reduced: boolean;
}

export function NavbarMobileMenu({
  isOpen,
  onClose,
  navItems,
  pathname,
  reduced,
}: NavbarMobileMenuProps) {
  const menuTransition = reduced ? REDUCED_TRANSITION : makeTransition('entrance', 'component');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0 }}
          transition={menuTransition}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-16 bg-background/98 backdrop-blur-3xl"
        >
          {navItems.map((item, idx) => (
            <motion.div
              key={item.href}
              initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
              transition={
                reduced
                  ? REDUCED_TRANSITION
                  : {
                      delay: idx * STAGGER_TOKENS.lines,
                      duration: DUR.transition,
                      ease: EASING.easeOutExpo,
                    }
              }
            >
              <Link
                href={item.href}
                onClick={onClose}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={cn(
                  'block text-3xl sm:text-4xl font-light tracking-tighter transition-colors duration-500 py-2 min-h-[44px] flex items-center justify-center',
                  pathname === item.href
                    ? 'text-accent'
                    : 'text-neutral-500 hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
          <motion.div
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            transition={
              reduced
                ? REDUCED_TRANSITION
                : {
                    delay: navItems.length * STAGGER_TOKENS.lines,
                    duration: DUR.transition,
                    ease: EASING.easeOutExpo,
                  }
            }
            className="mt-8"
          >
            <CurrencySelector />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
