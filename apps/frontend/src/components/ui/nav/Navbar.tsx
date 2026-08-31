'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLocale } from '@/i18n/LocaleProvider';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useToggle } from '@/hooks/useToggle';
import { useThrottledCallback } from '@/hooks/useThrottledValue';
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
        active ? 'text-sl-gold-hover' : 'text-sl-mist/60 hover:text-sl-alabaster',
        isPremium && 'premium-feature'
      )}
    >
      {icon && <span className="text-sl-gold-hover">{icon}</span>}
      {label}
      {badgeCount && badgeCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-sl-gold-subtle text-xs font-bold text-background">
          {badgeCount}
        </span>
      )}
      {!active && (
        <span
          aria-hidden="true"
          className="nav-underline absolute -bottom-1 inset-x-0 h-[1px] bg-sl-gold-subtle"
        />
      )}
      {active && (
        <span
          className="absolute -bottom-1 inset-x-0 h-[1px] w-full bg-sl-gold-subtle"
        />
      )}
    </Link>
  </Magnetic>
);

export const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, toggleMenu, , closeMenuRaw] = useToggle(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [unreadPremiumCount] = useState(3); // This would typically come from a context or state management
  const lastScrollY = useRef(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuTrapRef = useRef<HTMLDivElement>(null);
  const { reduced } = useHEXAMotion();

  const handleScroll = useThrottledCallback(() => {
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
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Body scroll lock + background inert (was 27 lines of ad-hoc DOM)
  useScrollLock(isMenuOpen, { inertSelector: '#main-content' });

  // Escape closes mobile menu
  useKeyboardShortcut(
    'Escape',
    () => {
      if (isMenuOpen) closeMenuRaw();
    },
    { target: 'document' },
  );

  // Focus trap + initial focus (was 30 lines of duplicated Tab+raf logic)
  useFocusTrap(menuTrapRef, isMenuOpen);

  // Close menu on route change and restore focus
  useEffect(() => {
    if (isMenuOpen) {
      closeMenuRaw();
      triggerRef.current?.focus();
    }
  }, [pathname]);

  const closeMenu = useCallback(() => {
    closeMenuRaw();
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, [closeMenuRaw]);

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
            ? 'py-4 bg-sl-void/60 backdrop-blur-2xl border-b border-sl-silver/20'
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
            <span className="text-xs font-medium uppercase tracking-[0.4em] text-sl-alabaster group-hover:text-sl-gold-hover transition-colors duration-500">
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
            onClick={toggleMenu}
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

      <div ref={menuTrapRef}>
        <NavbarMobileMenu
          isOpen={isMenuOpen}
          onClose={closeMenu}
          navItems={navItems}
          pathname={pathname}
          reduced={reduced}
        />
      </div>
    </>
  );
};
