'use client';

/**
 * HEXA Portal — "The Client Command" Sidebar
 *
 * A fine-instrument executive control rail: obsidian panel with a gold
 * specular top hairline and radial aura, serif "Client Portal" wordmark with
 * a slowly rotating gold diamond, mono section markers, gold-gradient active
 * indicator, and a gold-ring user profile.
 *
 * Fixed sidebar (240px) on desktop; on mobile slides out from left with a
 * backdrop overlay. All motion sources from EASE/DURATION tokens and collapses
 * under `prefers-reduced-motion`.
 */

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { usePortalStore } from '../store';
import { Icon, type IconName } from './PortalIcons';
import { EASE, DURATION } from '@/lib/motion';
import type { PortalNavItem } from '../types';

interface PortalNavSection {
  /** Mono uppercase section marker label. */
  marker: string;
  items: PortalNavItem[];
}

const PORTAL_NAV_SECTIONS: PortalNavSection[] = [
  {
    marker: 'Overview',
    items: [
      { label: 'Dashboard', href: '/portal', icon: 'layout-dashboard' },
      { label: 'Projects', href: '/portal/projects', icon: 'folder-kanban' },
      { label: '3D Live Review', href: '/portal/review', icon: 'box' },
    ],
  },
  {
    marker: 'Workspace',
    items: [
      { label: 'Approvals', href: '/portal/approvals', icon: 'check-circle' },
      { label: 'Documents', href: '/portal/documents', icon: 'file-text' },
      { label: 'Finance', href: '/portal/finance', icon: 'receipt' },
      { label: 'AI Studio', href: '/portal/ai', icon: 'sparkles' },
    ],
  },
  {
    marker: 'System',
    items: [
      { label: 'Support', href: '/portal/support', icon: 'help-circle' },
      { label: 'Analytics', href: '/portal/analytics', icon: 'bar-chart' },
      { label: 'Settings', href: '/portal/settings', icon: 'settings' },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Sidebar Content (shared between desktop & mobile)                          */
/* -------------------------------------------------------------------------- */

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const reducedMotion = useReducedMotion();

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
    <div className="relative flex h-full flex-col bg-sl-obsidian/75 backdrop-blur-2xl border-r border-sl-silver/20 overflow-hidden">
      {/* Gold radial aura — barely visible atelier top-light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_70%)]"
      />

      {/* Gold specular top hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/20 to-transparent"
      />

      {/* Brand */}
      <div className="relative flex items-center gap-3 px-6 h-16 border-b border-sl-silver/20">
        <button
          onClick={() => handleNavigation('/portal')}
          className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          aria-label="Go to portal home"
        >
          <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-sl-gold-subtle/10 border border-sl-gold-subtle/30 transition-colors duration-300 group-hover:bg-sl-gold-subtle/20">
            <span className="text-xs font-serif italic text-sl-gold-hover">H</span>
            {/* Rotating diamond accent — mirror of the preloader motif */}
            <motion.span
              aria-hidden="true"
              animate={reducedMotion ? {} : { rotate: 360 }}
              transition={
                reducedMotion
                  ? undefined
                  : { repeat: Infinity, duration: 12, ease: 'linear' }
              }
              className="absolute -bottom-0.5 -right-0.5 block h-1.5 w-1.5 rotate-45 border border-sl-gold-subtle/50 bg-sl-obsidian"
            />
          </span>
          <span className="text-sm uppercase tracking-[0.3em] text-sl-alabaster font-light">
            <span className="font-serif">Client</span>{' '}
            <span className="font-normal text-sl-gold-hover">Portal</span>
          </span>
        </button>
      </div>

      {/* Navigation — grouped by mono section markers */}
      <nav className="relative flex-1 overflow-y-auto px-3 py-5" aria-label="Portal navigation">
        {PORTAL_NAV_SECTIONS.map((section) => (
          <div key={section.marker} className="mb-5 last:mb-0">
            <div className="flex items-center gap-2 px-3 pb-1.5 pt-1">
              <span
                aria-hidden="true"
                className="block h-1 w-1 rotate-45 bg-sl-gold-subtle/50"
              />
              <span className="font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-sl-mist/60">
                {section.marker}
              </span>
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === '/portal'
                    ? pathname === '/portal'
                    : pathname?.startsWith(item.href);

                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm tracking-[0.02em] transition-all duration-300',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                      isActive
                        ? 'text-sl-gold-hover bg-sl-gold-subtle/5 shadow-[inset_0_1px_0_rgba(212,175,55,0.06)]'
                        : 'text-sl-mist/60 hover:text-sl-alabaster hover:bg-white/[0.03]',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {/* Active indicator bar — gold specular gradient */}
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-gradient-to-b from-sl-gold-hover via-sl-gold-subtle to-sl-gold-subtle-dark"
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
                        isActive
                          ? 'text-sl-gold-hover'
                          : 'text-sl-mist/60 group-hover:text-sl-gold-hover',
                      )}
                    />

                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="relative border-t border-sl-silver/20 p-4">
          <div className="flex items-center gap-3 mb-3">
            {/* Gold-ring avatar */}
            <div className="relative w-10 h-10 rounded-full bg-sl-gold-subtle/10 border border-sl-gold-subtle/40 ring-1 ring-sl-gold-subtle/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-mono text-sl-gold-hover uppercase">
                {user.email?.charAt(0) ?? 'U'}
              </span>
              {/* Rotating diamond accent on the avatar corner */}
              <motion.span
                aria-hidden="true"
                animate={reducedMotion ? {} : { rotate: 360 }}
                transition={
                  reducedMotion
                    ? undefined
                    : { repeat: Infinity, duration: 12, ease: 'linear' }
                }
                className="absolute -bottom-0.5 -right-0.5 block h-1.5 w-1.5 rotate-45 border border-sl-gold-subtle/50 bg-sl-obsidian"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-sl-alabaster truncate">{user.email}</p>
              <p className="flex items-center gap-1.5 text-[10px] text-sl-mist/60 uppercase tracking-wider font-mono">
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-sl-gold-subtle shadow-[0_0_4px_rgba(212,175,55,0.5)]"
                />
                {user.role ?? 'Client'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-sl-mist/60 hover:text-red-400 hover:bg-red-500/5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-subtle"
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
      className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[85vw] max-w-[256px] z-20"
      aria-label="Portal sidebar"
    >
      {/* Glassmorphic backdrop — lets the ambient glow pass through */}
      <div className="absolute inset-0 -z-10 bg-sl-obsidian/70 backdrop-blur-2xl" aria-hidden="true" />
      <SidebarContent />
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile Sidebar (slide-out drawer)                                         */
/* -------------------------------------------------------------------------- */

export function PortalMobileSidebar() {
  const { isSidebarOpen, setSidebarOpen } = usePortalStore();
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: DURATION.micro,
              ease: reducedMotion ? EASE.sharp : EASE.entrance,
            }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Panel — collapses the slide to a fade under reduced motion */}
          <motion.aside
            initial={reducedMotion ? { opacity: 0 } : { x: -280 }}
            animate={reducedMotion ? { opacity: 1 } : { x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { x: -280 }}
            transition={{
              duration: reducedMotion ? DURATION.micro : DURATION.component,
              ease: reducedMotion ? EASE.sharp : EASE.entrance,
            }}
            className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-[280px] z-50 lg:hidden"
            aria-label="Portal sidebar"
          >
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

