'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useToggle } from '@/hooks/useToggle';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useThrottledCallback } from '@/hooks/useThrottledValue';
import dynamic from 'next/dynamic';

const CurrencySelector = dynamic(
  () => import('@/features/currency/CurrencySelector').then((m) => ({ default: m.CurrencySelector })),
  { ssr: false },
);
import { NavbarMobileMenu } from '@/components/ui/nav/NavbarMobileMenu';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';
import { cn } from '@/lib/utils';

export interface NavLinkItem {
  label: string;
  href: string;
  dropdown?: {
    label: string;
    items: {
      label: string;
      href: string;
      description?: string;
    }[];
  };
  isPremium?: boolean;
}

export function NavbarClient({ navItems }: { navItems: NavLinkItem[] }) {
  const pathname = usePathname();
  const [isMenuOpen, toggleMenu, , closeMenuRaw] = useToggle(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
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

  useScrollLock(isMenuOpen, { inertSelector: '#main-content' });

  useKeyboardShortcut('Escape', () => {
    if (isMenuOpen) closeMenuRaw();
    if (openDropdown) setOpenDropdown(null);
  }, { target: 'document' });

  useFocusTrap(menuTrapRef, isMenuOpen);

  useEffect(() => {
    if (isMenuOpen) {
      closeMenuRaw();
      triggerRef.current?.focus();
    }
    setOpenDropdown(null);
  }, [pathname, isMenuOpen, closeMenuRaw]);

  const closeMenu = useCallback(() => {
    closeMenuRaw();
    setOpenDropdown(null);
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, [closeMenuRaw]);

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname.startsWith(href);

  const dropdown = (item: NavLinkItem) =>
    item.dropdown && (
      <div
        role="region"
        aria-label={`${item.dropdown.label} submenu`}
        className={cn(
          'absolute top-full left-1/2 -translate-x-1/2 pt-4 w-72 origin-top transition-all duration-300',
          openDropdown === item.href
            ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
        )}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <div className="relative bg-[var(--nav-dropdown-bg)]/95 backdrop-blur-2xl border-[var(--nav-dropdown-border)]/20 shadow-2xl shadow-black/50 rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--nav-dropdown-border)]/40 to-transparent" />
          <div className="p-3 space-y-0.5">
            {item.dropdown.items.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                onClick={closeMenu}
                className="group flex flex-col gap-0.5 rounded-xl px-4 py-3 hover:bg-[var(--nav-dropdown-item-hover)]/5 transition-colors duration-300"
              >
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-sl-alabaster group-hover:text-sl-gold-hover transition-colors duration-300">
                  {d.label}
                </span>
                {d.description && (
                  <span className="text-[10px] text-sl-mist/50 leading-relaxed">
                    {d.description}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[var(--nav-dropdown-border)]/20 to-transparent" />
        </div>
      </div>
    );

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          'fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 sm:px-8 lg:px-16 transition-all duration-700',
          isScrolled
            ? 'py-4 bg-sl-void/80 backdrop-blur-2xl border-b border-sl-silver/20'
            : 'py-8 bg-transparent',
          isVisible ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <Link href="/" className="group flex items-center gap-3">
          <div className="transition-transform duration-500 hover:rotate-90">
            <Image
              src="/logo.svg"
              alt="HexaStudio Logo"
              width={32}
              height={32}
              priority
              className="transition-transform duration-500"
              style={{ color: 'transparent' }}
            />
          </div>
          <span className="text-xs sm:text-sm lg:text-base font-medium uppercase tracking-[0.4em] text-sl-alabaster group-hover:text-sl-gold-hover transition-colors duration-500">
            HexaStudio
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navItems.map((item) =>
            item.dropdown ? (
              <div
                key={item.href}
                className="relative"
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  onClick={() =>
                    setOpenDropdown((prev) =>
                      prev === item.href ? null : item.href
                    )
                  }
                  aria-expanded={openDropdown === item.href}
                  aria-haspopup="true"
                  className={cn(
                    'group relative flex items-center gap-1.5 py-2 text-xs uppercase tracking-[0.3em] transition-colors duration-500 cursor-pointer',
                    isActive(item.href)
                      ? 'text-[var(--nav-link-active)]'
                      : 'text-[var(--nav-link-text)] hover:text-[var(--nav-link-hover)]'
                  )}
                >
                  {item.label}
                  <svg
                    className={cn(
                      'w-2.5 h-2.5 transition-transform duration-300',
                      openDropdown === item.href && 'rotate-180'
                    )}
                    viewBox="0 0 10 6"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -bottom-1 inset-x-0 h-[1px] transition-colors duration-500',
                      isActive(item.href) || openDropdown === item.href
                        ? 'bg-[var(--nav-dropdown-border)]'
                        : 'bg-transparent group-hover:bg-[var(--nav-dropdown-border)]/40'
                    )}
                  />
                </button>
                {dropdown(item)}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center gap-1.5 py-2 text-xs uppercase tracking-[0.3em] transition-colors duration-500',
                  isActive(item.href)
                    ? 'text-[var(--nav-link-active)]'
                    : 'text-[var(--nav-link-text)] hover:text-[var(--nav-link-hover)]'
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -bottom-1 inset-x-0 h-[1px] transition-colors duration-500',
                    isActive(item.href)
                      ? 'bg-[var(--nav-dropdown-border)]'
                      : 'bg-transparent group-hover:bg-[var(--nav-dropdown-border)]/40'
                  )}
                />
              </Link>
            )
          )}
          <Link
            href="/premium-chat"
            aria-label="Premium Chat"
            className="group relative inline-flex items-center gap-2 px-5 py-2 border border-sl-gold-subtle/30 text-xs uppercase tracking-[0.3em] text-sl-gold-hover hover:bg-sl-gold-subtle/10 hover:border-sl-gold-subtle/60 transition-all duration-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={12}
              height={12}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 3l1.9 4.1L18 9l-4.1 1.9L12 15l-1.9-4.1L6 9l4.1-1.9z" />
            </svg>
            Premium
          </Link>
          <CurrencySelector />
        </div>

        <button
          onClick={toggleMenu}
          className="flex flex-col gap-1.5 py-2 lg:hidden"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <span
            className={cn(
              'block h-[1px] w-6 bg-sl-alabaster transition-transform duration-300',
              isMenuOpen && 'rotate-45 translate-y-[6px]'
            )}
          />
          <span
            className={cn(
              'block h-[1px] w-6 bg-sl-alabaster transition-all duration-300',
              isMenuOpen && 'opacity-0 -translate-x-2.5'
            )}
          />
          <span
            className={cn(
              'block h-[1px] w-6 bg-sl-alabaster transition-transform duration-300',
              isMenuOpen && '-rotate-45 -translate-y-[6px]'
            )}
          />
        </button>
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
}
