'use client';

/**
 * HEXA Portal — Sidebar Navigation
 *
 * Fixed sidebar (240px) with logo, nav items, and user profile.
 * On mobile, slides out from left with backdrop overlay.
 * Active state uses gold accent indicator.
 */

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth';
import { cn } from '@/lib/utils';
import { usePortalStore } from '../store';
import { Icon, type IconName } from './PortalIcons';
import { EASE, DURATION } from '@/lib/motion';
import type { PortalNavItem } from '../types';

const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  { label: 'Dashboard', href: '/portal', icon: 'layout-dashboard' },
  { label: 'Projects', href: '/portal/projects', icon: 'folder-kanban' },
  { label: 'Approvals', href: '/portal/approvals', icon: 'check-circle' },
  { label: 'Documents', href: '/portal/documents', icon: 'file-text' },
  { label: 'Finance', href: '/portal/finance', icon: 'receipt' },
  { label: 'Support', href: '/portal/support', icon: 'help-circle' },
  { label: 'Analytics', href: '/portal/analytics', icon: 'bar-chart' },
  { label: 'Settings', href: '/portal/settings', icon: 'settings' },
];

/* -------------------------------------------------------------------------- */
/*  Sidebar Content (shared between desktop & mobile)                          */
/* -------------------------------------------------------------------------- */

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleNavigation = (href: string) => {
    router.push(href);
    onNavigate?.();
  };

  const handleLogout = async () => {
    await logout();
    router.push('/portal/login');
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col bg-surface border-r border-border/30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border/20">
        <button
          onClick={() => handleNavigation('/portal')}
          className="flex items-center gap-3 group"
          aria-label="Go to portal home"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 border border-accent/30 transition-colors duration-300 group-hover:bg-accent/20">
            <span className="text-xs font-serif italic text-accent">H</span>
          </div>
          <span className="text-sm uppercase tracking-[0.3em] text-foreground font-light">
            Client <span className="text-accent font-normal">Portal</span>
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto" aria-label="Portal navigation">
        {PORTAL_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/portal'
              ? pathname === '/portal'
              : pathname?.startsWith(item.href);

          return (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                isActive
                  ? 'text-accent bg-accent/5'
                  : 'text-neutral-500 hover:text-foreground hover:bg-white/[0.03]',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-accent"
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}

              <Icon
                name={item.icon as IconName}
                size={18}
                className={cn(
                  'transition-colors duration-300',
                  isActive ? 'text-accent' : 'text-neutral-600 group-hover:text-neutral-400',
                )}
              />

              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="border-t border-border/20 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-mono text-accent uppercase">
                {user.email?.charAt(0) ?? 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-foreground truncate">{user.email}</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                {user.role ?? 'Client'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs uppercase tracking-widest text-neutral-600 hover:text-red-400 hover:bg-red-500/5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Icon name="log-out" size={14} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Desktop Sidebar                                                           */
/* -------------------------------------------------------------------------- */

export function PortalSidebar() {
  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 z-40"
      aria-label="Portal sidebar"
    >
      <SidebarContent />
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile Sidebar (slide-out drawer)                                         */
/* -------------------------------------------------------------------------- */

export function PortalMobileSidebar() {
  const { isSidebarOpen, setSidebarOpen } = usePortalStore();

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.micro, ease: EASE.entrance }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: DURATION.component, ease: EASE.entrance }}
            className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden"
            aria-label="Portal sidebar"
          >
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
