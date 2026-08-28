'use client';

/**
 * HEXA Portal — Top Bar
 *
 * Fixed floating glass top bar with:
 * - Mobile hamburger (toggles drawer)
 * - Search / command palette trigger (Cmd+K)
 * - Odoo live sync status widget (desktop)
 * - Theme toggle (dark / light)
 * - WebXR AR quick-look button
 * - Locale switcher (EN / AR)
 * - Notification center (real-time)
 * - User avatar pill
 *
 * Uses the unified `sl-*` token layer. The left edge is offset for desktop
 * sidebar collapse state via `lg:left-[sidebar-width]`.
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
  const { setCommandPaletteOpen, isSidebarCollapsed, toggleSidebar } = usePortalStore();
  const { theme, toggleTheme } = usePortalTheme();
  const prefersReduced = useReducedMotion();

  return (
    <header
      className={cn(
        'fixed top-0 z-30',
        /* Left edge offset — collapsed sidebar is 64px, expanded is 248px */
        'left-0 lg:left-[4rem]',
        isSidebarCollapsed ? 'lg:left-[4rem]' : 'lg:left-[15.5rem]',
        'right-0',
        'h-16 border-b border-sl-silver/20',
        'bg-sl-obsidian/70 backdrop-blur-2xl',
        'flex items-center justify-between px-4 md:px-6',
      )}
      role="banner"
    >
      {/* Ambient gold highlight bar */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sl-gold-hover to-transparent"
      />

      {/* LEFT: hamburger + search/command */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'lg:hidden flex items-center justify-center w-11 h-11 rounded-lg',
            'text-sl-silver hover:text-sl-alabaster hover:bg-sl-stone/50',
            'transition-colors duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-hover'
          )}
          aria-label="Toggle navigation menu"
        >
          <Icon name="menu" size={20} />
        </button>

        {/* Mobile search button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className={cn(
            'sm:hidden flex items-center justify-center w-11 h-11 rounded-lg',
            'text-sl-silver hover:text-sl-alabaster hover:bg-sl-stone/50',
            'transition-colors duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-hover'
          )}
          aria-label="Open search"
        >
          <Icon name="search" size={20} />
        </button>

        {/* Command palette trigger (desktop) */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className={cn(
            'flex items-center gap-3 rounded-xl px-4 py-2',
            'bg-white/[0.02] border border-sl-silver/10',
            'text-sl-silver hover:text-sl-alabaster hover:border-sl-silver/20',
            'transition-all duration-300',
              
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-hover',
            'w-64 hidden sm:flex',
          )}
          aria-label="Open command palette (Ctrl+K)"
        >
          <Icon name="search" size={14} className="text-sl-silver" />
          <span className="text-xs tracking-wide">Search...</span>
          <kbd className="ml-auto text-[10px] font-mono text-sl-silver border border-sl-silver/20 rounded px-1.5 py-0.5">
            <abbr
              title={
                typeof navigator !== 'undefined' && navigator.platform?.includes('Mac')
                  ? 'Command'
                  : 'Control'
              }
            >
              {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}
            </abbr>{' '}
            K
          </kbd>
        </button>

        {/* Odoo Live Sync Status Widget */}
        <div className="hidden xl:block">
          <OdooSyncStatusWidget />
        </div>
      </div>

      {/* RIGHT: theme toggle, notifications, avatar */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center justify-center w-11 h-11 rounded-lg',
            'text-sl-silver hover:text-sl-alabaster hover:bg-sl-stone/50',
            'transition-colors duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-hover'
          )}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {!prefersReduced ? (
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
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
            <div className="relative w-8 h-8 rounded-full bg-sl-gold-subtle/20 border border-sl-gold-hover/20 flex items-center justify-center">
              <span className="text-[10px] font-mono text-sl-gold-hover uppercase">
                {user.email?.charAt(0) ?? 'U'}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
