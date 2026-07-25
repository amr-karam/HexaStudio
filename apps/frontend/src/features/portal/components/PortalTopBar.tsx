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

interface PortalTopBarProps {
  unreadCount?: number;
}

export function PortalTopBar({ unreadCount = 0 }: PortalTopBarProps) {
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
      {/* Left: hamburger (mobile) + search trigger */}
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

        {/* Mobile search icon */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg text-neutral-400 hover:text-foreground hover:bg-white/[0.03] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Open search"
        >
          <Icon name="search" size={18} />
        </button>
      </div>

      {/* Right: theme toggle, notifications, avatar */}
      <div className="flex items-center gap-2">
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

        {/* Notifications bell */}
        <button
          className="relative flex items-center justify-center w-10 h-10 rounded-lg text-neutral-400 hover:text-foreground hover:bg-white/[0.03] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Icon name="bell" size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent ring-2 ring-background" />
          )}
        </button>

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
