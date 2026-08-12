'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLocale } from '@/i18n/LocaleProvider';
import dynamic from 'next/dynamic';
import { Magnetic } from '@/components/ui/Magnetic';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';

const Sparkle = ({ size = 16 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3l1.9 4.1L18 9l-4.1 1.9L12 15l-1.9-4.1L6 9l4.1-1.9z" />
  </svg>
);

const CurrencySelector = dynamic(() => import('@/features/currency/CurrencySelector').then((m) => ({ default: m.CurrencySelector })), { ssr: false });
const NavbarMobileMenu = dynamic(() => import('./NavbarMobileMenu').then((m) => ({ default: m.NavbarMobileMenu })), { ssr: false });

interface NavItemProps {
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
  isPremium?: boolean;
  badgeCount?: number;
  icon?: React.ReactNode;
}

const NavItem = ({ label, href, active, onClick, isPremium, badgeCount, icon }: NavItemProps) => (
  <Magnetic>
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-1.5 py-2 text-xs uppercase tracking-[0.3em] transition-colors duration-500',
        active ? 'text-accent' : 'text-neutral-500 hover:text-foreground',
        isPremium && 'premium-feature'
      )}
    >
      {icon && <span className="text-accent">{icon}</span>}
      {label}
      {badgeCount && badgeCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs font-bold text-background">
          {badgeCount}
        </span>
      )}
      {!active && (
        <span
          aria-hidden="true"
          className="nav-underline absolute -bottom-1 inset-x-0 h-[1px] bg-accent"
        />
      )}
      {active && (
        <span
          className="absolute -bottom-1 inset-x-0 h-[1px] w-full bg-accent"
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
  const [unreadPremiumCount] = useState(3); // This would typically come from a context or state management
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
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const { t } = useLocale();

  const navItems = [
    { label: t('navbar.portfolio'), href: '/projects' },
    { label: t('navbar.services'), href: '/services' },
    { label: t('navbar.blog'), href: '/blog' },
    { label: t('navbar.studio'), href: '/about' },
    { label: t('navbar.contact'), href: '/contact' },
    {
      label: t('navbar.premiumChat'),
      href: '/premium-chat',
      isPremium: true,
      badgeCount: unreadPremiumCount,
      icon: <Sparkle size={16} />,
    },
  ];

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
            <div className="transition-transform duration-500 hover:rotate-90">
              <Image
                src="/logo.svg"
                alt="HexaStudio Logo"
                width={32}
                height={32}
                priority
                className="transition-transform duration-500"
              />
            </div>
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
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
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
            <span
              className={cn(
                "block h-[1px] w-6 bg-foreground transition-transform duration-300",
                isMenuOpen && "rotate-45 translate-y-[6px]"
              )}
            />
            <span
              className={cn(
                "block h-[1px] w-6 bg-foreground transition-all duration-300",
                isMenuOpen && "opacity-0 -translate-x-2.5"
              )}
            />
            <span
              className={cn(
                "block h-[1px] w-6 bg-foreground transition-transform duration-300",
                isMenuOpen && "-rotate-45 -translate-y-[6px]"
              )}
            />
          </button>
        </Magnetic>
      </nav>

      <NavbarMobileMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        navItems={navItems}
        pathname={pathname}
        reduced={reduced}
      />
    </>
  );
};
