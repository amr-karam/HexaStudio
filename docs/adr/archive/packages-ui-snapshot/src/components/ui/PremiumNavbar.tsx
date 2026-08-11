'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { LUXURY_EASE } from '../../lib/motion';

export interface PremiumNavItem {
  label: string;
  href: string;
}

const DEFAULT_NAV_ITEMS: PremiumNavItem[] = [
  { label: 'Works', href: '/portfolio' },
  { label: 'Studio', href: '/studio' },
  { label: 'Services', href: '/services' },
  { label: 'Journal', href: '/journal' },
  { label: 'Contact', href: '/contact' },
];

/**
 * PremiumNavbar — fixed exhibition-style navigation.
 * Transparent at top; condenses to a blurred Noir bar on scroll.
 * Mobile menu is a full-screen choreographed overlay.
 */
export const PremiumNavbar = ({
  items = DEFAULT_NAV_ITEMS,
  ctaLabel = 'Start Project',
  ctaHref = '/contact',
}: {
  items?: PremiumNavItem[];
  ctaLabel?: string;
  ctaHref?: string;
}) => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  React.useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[var(--z-sticky)] transition-all duration-500',
        isScrolled
          ? 'border-b border-[var(--color-neutral-800)] bg-[var(--color-primary)]/95 py-4 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent py-8',
      )}
      style={{ transitionTimingFunction: LUXURY_EASE.join(', ') }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 lg:px-12">
        {/* Brand */}
        <motion.a
          href="/"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: LUXURY_EASE }}
          className="group flex items-center gap-3"
          aria-label="HEXA STUDIO — home"
        >
          <span className="flex h-8 w-8 items-center justify-center bg-[var(--color-accent)]">
            <span className="h-3 w-3 border border-[var(--color-accent-fg)] transition-transform duration-500 group-hover:rotate-45" />
          </span>
          <span className="font-serif text-lg uppercase tracking-[0.08em] text-[var(--color-primary-fg)]">
            Hexa<span className="text-[var(--color-accent)]">Studio</span>
          </span>
        </motion.a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-10 md:flex" aria-label="Primary">
          {items.map((item, idx) => (
            <motion.a
              key={item.href}
              href={item.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 * idx, ease: LUXURY_EASE }}
              className="group relative text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-neutral-400)] transition-colors duration-300 hover:text-[var(--color-accent)]"
            >
              {item.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-[var(--color-accent)] transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}
          <Button asChild variant="accent" size="sm">
            <a href={ctaHref}>{ctaLabel}</a>
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex flex-col items-end gap-1.5 p-2 md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          <span className={cn('h-px w-7 bg-[var(--color-primary-fg)] transition-all duration-300', isMenuOpen && 'translate-y-[3.5px] rotate-45')} />
          <span className={cn('h-px w-5 bg-[var(--color-primary-fg)] transition-all duration-300', isMenuOpen && 'w-7 -translate-y-[3.5px] -rotate-45')} />
        </button>
      </div>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: LUXURY_EASE }}
            className="fixed inset-0 -z-10 flex flex-col items-center justify-center gap-8 bg-[var(--color-primary)] md:hidden"
          >
            {items.map((item, idx) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 * idx, ease: LUXURY_EASE }}
                onClick={() => setIsMenuOpen(false)}
                className="font-serif text-3xl text-[var(--color-primary-fg)] transition-colors hover:text-[var(--color-accent)]"
              >
                {item.label}
              </motion.a>
            ))}
            <Button asChild variant="accent" size="lg" className="mt-6">
              <a href={ctaHref} onClick={() => setIsMenuOpen(false)}>
                {ctaLabel}
              </a>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
