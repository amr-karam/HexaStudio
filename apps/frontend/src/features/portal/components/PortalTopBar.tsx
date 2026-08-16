'use client';

/**
 * HEXA Portal — Top Bar
 *
 * Fixed top bar with hamburger (mobile), search/command trigger,
 * theme toggle, notifications bell, and user avatar.
 */

import { useAuth } from '@/features/auth';
import { cn } from '@/lib/utils';
import { usePortalStore } from '../store';
import { Icon } from './PortalIcons';
import { usePortalTheme } from './PortalThemeProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from 'framer-motion';
import { EASE, DURATION } from '@/lib/motion';
import { createDynamicComponent } from '@/lib/dynamic-component';

// Heavy/3D widgets are lazy-loaded so the portal chrome stays cheap to parse
// and hydrate. Each renders inline via next/dynamic with an empty fallback to
// avoid layout flash in the top bar.
const NotificationCenter = createDynamicComponent<Record<string, never>>(
  () =>
    import('@/features/notifications/components/NotificationCenter').then((m) => ({
      default: m.NotificationCenter,
    })),
  { ssr: false, loading: <span aria-hidden="true" /> },
);

const OdooSyncStatusWidget = createDynamicComponent<Record<string, never>>(
  () => import('./OdooSyncStatusWidget').then((m) => ({ default: m.OdooSyncStatusWidget })),
  { ssr: false, loading: <span aria-hidden="true" /> },
);

const WebXRArButton = createDynamicComponent<Record<string, never>>(
  () => import('@/features/scene/components/WebXRArButton').then((m) => ({ default: m.WebXRArButton })),
  { ssr: false, loading: <span aria-hidden="true" /> },
);

import { LocaleSwitcher } from '@/components/LocaleSwitcher';

export function PortalTopBar() {
  const { user } = useAuth();
  const { toggleSidebar, setCommandPaletteOpen } = usePortalStore();
  const { theme, toggleTheme } = usePortalTheme();
  const prefersReduced = useReducedMotion();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30',
        'h-16 border-b border-border/20',
        'bg-background/80 backdrop-blur-2xl',
        'flex items-center justify-between px-4 md:px-6',
        'lg:left-60', /* offset for desktop sidebar */
      )}
      role="banner"
    >
      {/* Left: hamburger (mobile) + search trigger + Odoo Status */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-neutral-400 hover:text-foreground hover:bg-white/[0.03] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Toggle navigation menu"
        >
          <Icon name="menu" size={20} />
        </button>

        {/* Command palette trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className={cn(
            'flex items-center gap-3 rounded-xl px-4 py-2',
            'bg-white/[0.03] border border-border/30',
            'text-neutral-500 hover:text-neutral-400 hover:border-border-light',
            'transition-all duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            'w-64 hidden sm:flex',
          )}
          aria-label="Open command palette (Ctrl+K)"
        >
          <Icon name="search" size={14} />
          <span className="text-xs tracking-wide">Search...</span>
          <kbd className="ml-auto text-[10px] font-mono text-neutral-600 border border-border/30 rounded px-1.5 py-0.5">
            <abbr title={typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? 'Command' : 'Control'}>
              {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}
            </abbr>
            {' '}K
          </kbd>
        </button>

        {/* Odoo Live Sync Status Widget */}
        <div className="hidden xl:block">
          <OdooSyncStatusWidget />
        </div>
      </div>

      {/* Right: theme toggle, notifications, avatar */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-neutral-400 hover:text-foreground hover:bg-white/[0.03] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {!prefersReduced ? (
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: DURATION.micro, ease: EASE.entrance }}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
            </motion.div>
          ) : (
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          )}
        </button>

        {/* WebXR AR QuickLook Projection */}
        <div className="hidden md:block">
          <WebXRArButton />
        </div>

        {/* Luxury Language Switcher (EN/AR) */}
        <LocaleSwitcher />

        {/* Real-time Notification Center */}
        <NotificationCenter />

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2 ml-1">
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-[10px] font-mono text-accent uppercase">
                {user.email?.charAt(0) ?? 'U'}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
