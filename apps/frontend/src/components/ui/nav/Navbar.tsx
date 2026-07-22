'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLocale } from '@/i18n/LocaleProvider';
import { CurrencySelector } from '@/features/currency';
import { makeTransition, REDUCED_TRANSITION, EASE } from '@/lib/motion';
import { EASING, DUR, STAGGER_TOKENS } from '@/lib/motion/tokens';
import { Magnetic } from '@/components/ui/Magnetic';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';

interface NavItemProps {
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ label, href, active, onClick }: NavItemProps) => (
  <Magnetic>
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative block py-2 text-xs uppercase tracking-[0.3em] transition-colors duration-500',
        active ? 'text-accent' : 'text-neutral-500 hover:text-foreground'
      )}
    >
      {label}
      {!active && (
        <span
          aria-hidden="true"
          className="nav-underline absolute -bottom-1 inset-x-0 h-[1px] bg-accent"
        />
      )}
      {active && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute -bottom-1 inset-x-0 h-[1px] w-full bg-accent"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  </Magnetic>
);

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { reduced } = useHEXAMotion();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      if (currentScrollY < 20) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body scroll lock + background inert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Make main content inert
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.setAttribute('inert', '');
        mainContent.setAttribute('aria-hidden', 'true');
      }
      // Move focus into the dialog
      requestAnimationFrame(() => {
        const menu = document.getElementById('mobile-menu');
        if (menu) {
          const firstFocusable = menu.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
          firstFocusable?.focus();
        }
      });
    } else {
      document.body.style.overflow = '';
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.removeAttribute('inert');
        mainContent.removeAttribute('aria-hidden');
      }
    }
    return () => {
      document.body.style.overflow = '';
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.removeAttribute('inert');
        mainContent.removeAttribute('aria-hidden');
      }
    };
  }, [isMenuOpen]);

  // Focus trap inside mobile menu
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const menu = document.getElementById('mobile-menu');
      if (!menu) return;
      const focusable = menu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Close menu on route change and restore focus
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      triggerRef.current?.focus();
    }
  }, [pathname]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    // Focus restored by the pathname effect or explicit call
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const { t } = useLocale();

  const navItems = [
    { label: t('navbar.portfolio'), href: '/projects' },
    { label: t('navbar.services'), href: '/services' },
    { label: t('navbar.blog'), href: '/blog' },
    { label: t('navbar.studio'), href: '/about' },
    { label: t('navbar.contact'), href: '/contact' },
  ];

  // Transitions
  const menuTransition = reduced ? REDUCED_TRANSITION : makeTransition('entrance', 'component');

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          'fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 md:px-16 transition-all duration-700 ease-out-expo',
          isScrolled
            ? 'py-4 bg-background/60 backdrop-blur-2xl border-b border-border/50'
            : 'py-8 bg-transparent',
          isVisible ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <Magnetic strength={0.25}>
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              whileHover={reduced ? undefined : { rotate: 90 }}
              transition={reduced ? undefined : { duration: 0.5, ease: EASE.interaction }}
            >
              <Image
                src="/logo.svg"
                alt="HexaStudio Logo"
                width={32}
                height={32}
                className="transition-transform duration-500"
              />
            </motion.div>
            <span className="text-xs font-medium uppercase tracking-[0.4em] text-foreground group-hover:text-accent transition-colors duration-500">
              HexaStudio
            </span>
          </Link>
        </Magnetic>

        <div className="hidden md:flex items-center gap-16">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href)
              }
            />
          ))}
          <div className="ml-4">
            <CurrencySelector />
          </div>
        </div>

        <Magnetic strength={0.25} className="md:hidden">
          <button
            ref={triggerRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col gap-1.5 py-2"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <motion.span
              animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block h-[1px] w-6 bg-foreground transition-transform duration-300"
            />
            <motion.span
              animate={isMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              className="block h-[1px] w-6 bg-foreground transition-all duration-300"
            />
            <motion.span
              animate={isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block h-[1px] w-6 bg-foreground transition-transform duration-300"
            />
          </button>
        </Magnetic>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
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
                  onClick={closeMenu}
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
    </>
  );
};
