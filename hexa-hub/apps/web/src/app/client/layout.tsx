'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
} from 'lucide-react';

// ─── Navigation Config ──────────────────────────────────────────────────────

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/client' },
  { icon: Briefcase, label: 'My Projects', href: '/client/projects' },
  { icon: FileText, label: 'My Invoices', href: '/client/invoices' },
];

// ─── Client Sidebar ─────────────────────────────────────────────────────────

function ClientSidebar({
  isMobileOpen,
  onClose,
}: {
  isMobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 bg-surface border-r border-border
          flex flex-col transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="p-6 flex items-center justify-between">
          <Link href="/client">
            <h2 className="text-xl font-serif font-light tracking-tighter text-white">
              HEXA <span className="text-gold">CLIENT</span>
            </h2>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-neutral-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Accent line */}
        <div className="mx-6 h-px bg-gradient-to-r from-gold/40 via-gold/10 to-transparent" />

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/client'
                ? pathname === '/client'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${
                    isActive
                      ? 'bg-gold/10 text-gold'
                      : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="client-nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gold rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon size={18} />
                <span className="text-sm font-light tracking-wide">{item.label}</span>
                {isActive && (
                  <ChevronRight size={14} className="ml-auto opacity-40" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 border border-border">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user?.fullName || 'Client'}
              </p>
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest">Client Portal</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-neutral-500 hover:text-red-400 transition-colors duration-300 rounded-lg hover:bg-red-500/5"
          >
            <LogOut size={16} />
            <span className="font-light">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Client Top Bar ─────────────────────────────────────────────────────────

function ClientTopBar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const currentPage = navItems.find(
    (item) =>
      item.href === pathname ||
      (item.href !== '/client' && pathname.startsWith(item.href))
  );

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-neutral-500 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="hidden lg:flex items-center gap-2 text-sm text-neutral-600">
          <Link href="/client" className="hover:text-gold transition-colors">
            Portal
          </Link>
          {currentPage && currentPage.href !== '/client' && (
            <>
              <ChevronRight size={12} />
              <span className="text-neutral-400">{currentPage.label}</span>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative p-2.5 text-neutral-500 hover:text-white transition-colors rounded-xl hover:bg-white/5">
          <Bell size={18} />
          {/* Notification dot */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full" />
        </button>

        <div className="hidden md:flex items-center gap-3 pl-3 border-l border-border/50">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 border border-border/50">
            <User size={14} />
          </div>
          <span className="text-xs text-neutral-400 font-light">
            {user?.fullName?.split(' ')[0] || 'Client'}
          </span>
        </div>
      </div>
    </header>
  );
}

// ─── Client Layout ──────────────────────────────────────────────────────────

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          <p className="text-xs text-neutral-600 uppercase tracking-widest">Loading Portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-white overflow-hidden">
      <ClientSidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ClientTopBar onMenuToggle={() => setIsMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
