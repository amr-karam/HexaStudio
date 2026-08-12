'use client';

/**
 * HEXA Portal — "The Client Command" Navigation
 *
 * A luxury executive-command top bar: obsidian glass, serif brand mark with a
 * rotating diamond accent, mono uppercase section markers, and a fine-instrument
 * control-bar feel.
 *
 * Layout strategy (never overflows @1024px):
 *  - Desktop (lg+): brand + 4 primary items (Dashboard, Projects, Documents,
 *    Approvals) with gold spring underline, then a "More" dropdown holding the
 *    remaining sections (Finance, Analytics, Notifications, Support, Settings).
 *  - Mobile (<lg): animated hamburger opens a full-screen staggered obsidian
 *    overlay with large serif links and mono index markers.
 *
 * Accessibility: aria-current="page", aria-expanded/aria-controls on all toggles,
 * focus-luxury rings, Escape-to-close, click-outside dismissal, focus restoration,
 * and full `prefers-reduced-motion` support via useHEXAMotion.
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAuth } from '@/features/auth';
import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/lib/utils';
import { EASE, DURATION, STAGGER } from '@/lib/motion';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';
import { CurrencySelector } from '@/features/currency';
import { Icon, type IconName } from './components/PortalIcons';

/* -------------------------------------------------------------------------- */
/*  Types & shared helpers                                                    */
/* -------------------------------------------------------------------------- */

interface NavItemConfig {
  label: string;
  href: string;
  icon: IconName;
}

/**
 * Route matching — `/portal` is exact (root), every other section matches its
 * own subtree so `/portal/projects/[id]` stays lit on Projects.
 */
function isActiveRoute(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/portal') return pathname === '/portal';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Closes a floating surface on outside pointer-down or the Escape key.
 */
function useDismissible<T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void,
  ref: RefObject<T | null>,
) {
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (ref.current && target && !ref.current.contains(target)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose, ref]);
}

/* -------------------------------------------------------------------------- */
/*  Dropdown surfaces                                                         */
/* -------------------------------------------------------------------------- */

/** "More" overflow menu — the secondary portal sections. */
function MoreMenu({
  items,
  pathname,
}: {
  items: NavItemConfig[];
  pathname: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hexaMotion = useHEXAMotion();
  const uid = useId();

  const close = useCallback(() => setIsOpen(false), []);
  useDismissible(isOpen, close, containerRef);

  const hasActiveItem = items.some((item) => isActiveRoute(pathname, item.href));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={`${uid}-more-menu`}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          'group relative flex items-center gap-1.5 rounded-full px-2.5 py-2',
          'font-mono text-xs uppercase tracking-[0.25em]',
          'transition-colors duration-500 focus-luxury',
          hasActiveItem
            ? 'text-accent bg-accent/10'
            : 'text-neutral-500 hover:text-accent hover:bg-white/[0.02]',
        )}
      >
        <Icon name="more-horizontal" size={13} />
        <span>More</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={hexaMotion.transition('entrance', 'micro')}
          className={cn('h-3 w-3', isOpen ? 'text-accent' : 'opacity-50')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${uid}-more-menu`}
            role="menu"
            aria-label="More portal sections"
            initial={hexaMotion.reduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={hexaMotion.reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={hexaMotion.transition('entrance', 'micro')}
            className={cn(
              'absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-xl',
              'border border-border/40 bg-surface/95 backdrop-blur-2xl',
              'shadow-2xl shadow-black/40',
            )}
          >
            <div className="border-b border-border/20 p-1.5">
              <span className="block px-3 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-neutral-600">
                Sections
              </span>
            </div>
            <div className="p-1.5">
              {items.map((item) => {
                const isItemActive = isActiveRoute(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    aria-current={isItemActive ? 'page' : undefined}
                    onClick={close}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5',
                      'font-mono text-xs uppercase tracking-[0.2em]',
                      'transition-colors duration-300 focus-luxury',
                      isItemActive
                        ? 'text-accent bg-accent/10'
                        : 'text-neutral-500 hover:bg-white/[0.03] hover:text-foreground',
                    )}
                  >
                    <Icon
                      name={item.icon}
                      size={14}
                      className={cn(
                        'transition-colors duration-300',
                        isItemActive
                          ? 'text-accent'
                          : 'text-neutral-600 group-hover:text-neutral-400',
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Account dropdown — profile, settings, logout in a premium glass panel. */
function UserMenu({
  email,
  onLogout,
}: {
  email: string | null;
  onLogout: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hexaMotion = useHEXAMotion();
  const uid = useId();

  const close = useCallback(() => setIsOpen(false), []);
  useDismissible(isOpen, close, containerRef);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={`${uid}-user-menu`}
        aria-label="Account menu"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full',
          'border border-accent/40 bg-accent/10 ring-1 ring-accent/20',
          'transition-all duration-500 focus-luxury',
          isOpen
            ? 'border-accent/80 bg-accent/20 ring-accent/40'
            : 'hover:border-accent/80 hover:bg-accent/20',
        )}
      >
        <span className="font-mono text-xs uppercase text-accent">
          {email?.charAt(0) ?? 'U'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${uid}-user-menu`}
            role="menu"
            aria-label="Account menu"
            initial={hexaMotion.reduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={hexaMotion.reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={hexaMotion.transition('entrance', 'micro')}
            className={cn(
              'absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-xl',
              'border border-border/40 bg-surface/95 backdrop-blur-2xl',
              'shadow-2xl shadow-black/40',
            )}
          >
            <div className="border-b border-border/20 px-4 pb-3 pt-4">
              <p className="truncate text-xs text-foreground">{email}</p>
              <p className="mt-1 font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-neutral-500">
                Client
              </p>
            </div>

            <div className="p-1.5">
              <Link
                href="/portal/profile"
                role="menuitem"
                onClick={close}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 transition-colors duration-300 hover:bg-white/[0.03] hover:text-foreground focus-luxury"
              >
                <Icon
                  name="user"
                  size={14}
                  className="text-neutral-600 transition-colors duration-300 group-hover:text-accent"
                />
                Profile
              </Link>

              <Link
                href="/portal/settings"
                role="menuitem"
                onClick={close}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 transition-colors duration-300 hover:bg-white/[0.03] hover:text-foreground focus-luxury"
              >
                <Icon
                  name="settings"
                  size={14}
                  className="text-neutral-600 transition-colors duration-300 group-hover:text-accent"
                />
                Settings
              </Link>

              <div
                role="separator"
                className="my-1.5 h-px bg-border/20"
                aria-hidden="true"
              />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  onLogout();
                }}
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 transition-colors duration-300 hover:bg-red-500/5 hover:text-red-400 focus-luxury"
              >
                <Icon
                  name="log-out"
                  size={14}
                  className="text-neutral-600 transition-colors duration-300 group-hover:text-red-400"
                />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  PortalNav                                                                 */
/* -------------------------------------------------------------------------- */

export function PortalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const hexaMotion = useHEXAMotion();
  const uid = useId();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  const dashboardLabel = t('portal.nav.dashboard');
  const projectsLabel = t('portal.nav.projects');
  const settingsLabel = t('portal.nav.settings');

  const navItems = useMemo<NavItemConfig[]>(
    () => [
      { label: dashboardLabel, href: '/portal', icon: 'layout-dashboard' },
      { label: projectsLabel, href: '/portal/projects', icon: 'folder-kanban' },
      { label: 'Documents', href: '/portal/documents', icon: 'file-text' },
      { label: 'Approvals', href: '/portal/approvals', icon: 'check-circle' },
      { label: 'Finance', href: '/portal/finance', icon: 'receipt' },
      { label: 'Analytics', href: '/portal/analytics', icon: 'bar-chart' },
      { label: 'Notifications', href: '/portal/notifications', icon: 'bell' },
      { label: 'Support', href: '/portal/support', icon: 'help-circle' },
      { label: settingsLabel, href: '/portal/settings', icon: 'settings' },
    ],
    [dashboardLabel, projectsLabel, settingsLabel],
  );

  const primaryItems = navItems.slice(0, 4);
  const secondaryItems = navItems.slice(4);

  const handleLogout = useCallback(async () => {
    setIsMobileOpen(false);
    await logout();
    router.push('/portal/login');
  }, [logout, router]);

  /* ---- Mobile overlay: scroll lock + Escape ---- */
  useEffect(() => {
    if (!isMobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileOpen]);

  /* ---- Mobile overlay: focus management ---- */
  useEffect(() => {
    if (isMobileOpen) {
      closeButtonRef.current?.focus();
    } else if (wasOpenRef.current) {
      hamburgerRef.current?.focus();
    }
    wasOpenRef.current = isMobileOpen;
  }, [isMobileOpen]);

  /* ---- Mobile stagger choreography (reduced-motion aware) ---- */
  const overlayVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: hexaMotion.reduced
          ? { duration: DURATION.micro, ease: EASE.sharp }
          : { duration: DURATION.component, ease: EASE.entrance },
      },
      exit: {
        opacity: 0,
        transition: { duration: DURATION.micro, ease: EASE.sharp },
      },
    }),
    [hexaMotion.reduced],
  );

  const listVariants: Variants = useMemo(
    () => ({
      hidden: {},
      visible: hexaMotion.reduced
        ? {}
        : { transition: { staggerChildren: STAGGER.page, delayChildren: 0.05 } },
    }),
    [hexaMotion.reduced],
  );

  const itemVariants: Variants = useMemo(
    () => ({
      hidden: hexaMotion.reduced ? { opacity: 1 } : { opacity: 0, y: 24 },
      visible: hexaMotion.reduced
        ? { opacity: 1, y: 0, transition: { duration: DURATION.micro, ease: EASE.sharp } }
        : {
            opacity: 1,
            y: 0,
            transition: { duration: DURATION.component, ease: EASE.entrance },
          },
      exit: hexaMotion.reduced
        ? { opacity: 0, transition: { duration: DURATION.micro, ease: EASE.sharp } }
        : {
            opacity: 0,
            y: 16,
            transition: { duration: DURATION.component, ease: EASE.entrance },
          },
    }),
    [hexaMotion.reduced],
  );

  // Don't show nav on login page
  if (pathname?.startsWith('/portal/login')) return null;

  return (
    <nav
      className="fixed inset-x-0 top-0 z-40 border-b border-border/30 bg-background/80 backdrop-blur-2xl"
      role="navigation"
      aria-label="Portal navigation"
    >
      <div className="mx-auto flex h-16 items-center justify-between gap-3 px-4 md:px-6">
        {/* Brand mark — gold roundel + rotating diamond accent */}
        <Link
          href="/portal"
          aria-label="Portal Dashboard"
          className="group flex shrink-0 items-center gap-3 rounded-full focus-luxury"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 transition-colors duration-500 group-hover:bg-accent/20">
            <span className="font-serif text-sm italic text-accent">H</span>
            <motion.span
              aria-hidden="true"
              animate={hexaMotion.reduced ? {} : { rotate: 360 }}
              transition={
                hexaMotion.reduced
                  ? undefined
                  : { repeat: Infinity, duration: 12, ease: 'linear' }
              }
              className="absolute -bottom-0.5 -right-0.5 block h-1.5 w-1.5 rotate-45 border border-accent/50 bg-background"
            />
          </span>
          <span className="hidden text-xs uppercase tracking-[0.3em] sm:inline">
            <span className="font-serif text-foreground">Client</span>
            <span className="text-accent"> Portal</span>
          </span>
        </Link>

        {/* Desktop primary navigation (lg+) */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {primaryItems.map((item) => {
            const isItemActive = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isItemActive ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center gap-1.5 rounded-full px-2.5 py-2',
                  'font-mono text-xs uppercase tracking-[0.25em]',
                  'transition-colors duration-500 focus-luxury',
                  isItemActive
                    ? 'text-accent bg-accent/10'
                    : 'text-neutral-500 hover:bg-white/[0.02] hover:text-accent',
                )}
              >
                <Icon
                  name={item.icon}
                  size={13}
                  className={cn(
                    'transition-colors duration-500',
                    isItemActive
                      ? 'text-accent'
                      : 'text-neutral-600 group-hover:text-accent',
                  )}
                />
                <span>{item.label}</span>
                {isItemActive && (
                  <motion.span
                    layoutId="portal-nav-indicator"
                    className="absolute inset-x-0 -bottom-px"
                    transition={
                      hexaMotion.reduced
                        ? { duration: DURATION.micro, ease: EASE.sharp }
                        : { type: 'spring', stiffness: 300, damping: 30 }
                    }
                  >
                    <span className="mx-auto block h-px w-5 bg-accent" />
                  </motion.span>
                )}
              </Link>
            );
          })}

          <MoreMenu items={secondaryItems} pathname={pathname} />
        </div>

        {/* Right utilities */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:block">
            <CurrencySelector />
          </div>

          {user && (
            <div className="hidden md:block">
              <UserMenu email={user.email ?? null} onLogout={handleLogout} />
            </div>
          )}

          {/* Mobile hamburger / close */}
          <button
            ref={hamburgerRef}
            type="button"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              'text-neutral-400 transition-colors duration-300 lg:hidden',
              'hover:bg-white/[0.03] hover:text-foreground focus-luxury',
            )}
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileOpen}
            aria-controls={`${uid}-mobile-menu`}
            onClick={() => setIsMobileOpen((open) => !open)}
          >
            {hexaMotion.reduced ? (
              <Icon name={isMobileOpen ? 'x' : 'menu'} size={20} />
            ) : (
              <span className="relative block h-4 w-5" aria-hidden="true">
                <motion.span
                  animate={{
                    y: isMobileOpen ? 7.5 : 0,
                    rotate: isMobileOpen ? 45 : 0,
                  }}
                  className="absolute left-0 top-0 block h-px w-5 bg-foreground"
                />
                <motion.span
                  animate={{ opacity: isMobileOpen ? 0 : 1 }}
                  className="absolute left-0 top-1/2 block h-px w-5 -translate-y-1/2 bg-foreground"
                />
                <motion.span
                  animate={{
                    y: isMobileOpen ? -7.5 : 0,
                    rotate: isMobileOpen ? -45 : 0,
                  }}
                  className="absolute bottom-0 left-0 block h-px w-5 bg-foreground"
                />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile full-screen obsidian overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="portal-mobile-overlay"
            id={`${uid}-mobile-menu`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            className="fixed inset-0 z-[60] overflow-y-auto bg-background/95 backdrop-blur-2xl lg:hidden"
            aria-label="Portal navigation menu"
          >
            {/* Ambient gold aura */}
            <div
              aria-hidden="true"
              className="gradient-radial-gold pointer-events-none absolute inset-0"
            />

            {/* Overlay header */}
            <div className="relative flex h-16 items-center justify-between px-4 md:px-6">
              <Link
                href="/portal"
                aria-label="Portal Dashboard"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 rounded-full focus-luxury"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                  <span className="font-serif text-sm italic text-accent">H</span>
                </span>
                <span className="text-xs uppercase tracking-[0.3em]">
                  <span className="font-serif text-foreground">Client</span>
                  <span className="text-accent"> Portal</span>
                </span>
              </Link>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-400 transition-colors duration-300 hover:bg-white/[0.03] hover:text-accent focus-luxury"
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            {/* Staggered serif links */}
            <motion.nav
              variants={listVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="relative px-6 pb-8 pt-6 md:px-12"
              aria-label="Mobile portal navigation"
            >
              <motion.span
                variants={itemVariants}
                className="block pb-4 font-mono text-[0.625rem] uppercase tracking-[0.35em] text-neutral-600"
              >
                Executive HQ
              </motion.span>

              {navItems.map((item, index) => {
                const isItemActive = isActiveRoute(pathname, item.href);
                return (
                  <motion.div key={item.href} variants={itemVariants}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      aria-current={isItemActive ? 'page' : undefined}
                      className="group flex items-baseline justify-between gap-6 border-b border-border/20 py-5 focus-luxury"
                    >
                      <span
                        className={cn(
                          'font-serif text-2xl transition-colors duration-500 md:text-3xl',
                          isItemActive
                            ? 'text-accent'
                            : 'text-neutral-400 group-hover:text-foreground',
                        )}
                      >
                        {item.label}
                      </span>
                      <span className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-neutral-600">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* Overlay footer — currency + account */}
            <div className="relative border-t border-border/20 px-6 py-6 md:px-12">
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <CurrencySelector />
                {user && (
                  <>
                    <div className="border-t border-border/20 pt-4">
                      <p className="text-xs text-neutral-500">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-neutral-500 transition-colors duration-300 hover:text-red-400 focus-luxury"
                    >
                      <Icon name="log-out" size={14} />
                      Logout
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}