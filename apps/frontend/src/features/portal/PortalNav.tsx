'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth';
import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/lib/utils';
import { CurrencySelector } from '@/features/currency';

const NAV_ITEMS = [
  { labelKey: 'portal.nav.dashboard', href: '/portal' },
  { labelKey: 'portal.nav.settings', href: '/portal/settings' },
] as const;

export function PortalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/portal/login');
  };

  // Don't show nav on login page
  if (pathname?.startsWith('/portal/login')) return null;

  return (
    <nav
      className="fixed top-0 inset-x-0 z-40 border-b border-border/30 bg-background/80 backdrop-blur-2xl"
      role="navigation"
      aria-label="Portal navigation"
    >
      <div className="mx-auto flex h-16 items-center justify-between px-6 md:px-12">
        {/* Logo / Brand */}
        <Link
          href="/portal"
          className="flex items-center gap-3 group"
          aria-label="Portal Dashboard"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 border border-accent/30">
            <span className="text-xs font-serif italic text-accent">H</span>
          </div>
          <span className="hidden sm:inline text-sm uppercase tracking-[0.3em] text-foreground font-light">
            Client <span className="text-accent font-normal">Portal</span>
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative py-1 text-xs uppercase tracking-[0.25em] transition-colors duration-500',
                  isActive
                    ? 'text-accent'
                    : 'text-neutral-500 hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {t(item.labelKey)}
                {isActive && (
                  <motion.span
                    layoutId="portal-nav-indicator"
                    className="absolute -bottom-1 inset-x-0 h-[1px] bg-accent"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right section: user info + logout */}
        <div className="flex items-center gap-3">
          {/* Currency selector */}
          <div className="hidden md:block">
            <CurrencySelector />
          </div>

          {user && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-accent uppercase">
                    {user.email?.charAt(0) ?? 'U'}
                  </span>
                </div>
                <span className="text-xs text-neutral-400 hidden lg:inline">
                  {user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 hover:text-red-400 transition-colors duration-300 font-mono"
              >
                {t('portal.nav.logout')}
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileOpen}
          >
            <motion.span
              animate={isMobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className="block w-5 h-[1px] bg-foreground"
            />
            <motion.span
              animate={isMobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-5 h-[1px] bg-foreground"
            />
            <motion.span
              animate={isMobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              className="block w-5 h-[1px] bg-foreground"
            />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-6 py-6 space-y-4">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'block py-2 text-sm uppercase tracking-[0.25em] transition-colors duration-300',
                      isActive ? 'text-accent' : 'text-neutral-500'
                    )}
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}
              {/* Mobile currency selector */}
              <div className="pt-4 border-t border-border/20">
                <CurrencySelector />
              </div>

              {user && (
                <>
                  <div className="pt-4 border-t border-border/20">
                    <span className="text-xs text-neutral-500 block mb-2">{user.email}</span>
                    <button
                      onClick={() => {
                        setIsMobileOpen(false);
                        handleLogout();
                      }}
                      className="text-xs uppercase tracking-[0.25em] text-red-400/70 hover:text-red-400 transition-colors"
                    >
                      {t('portal.nav.logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
