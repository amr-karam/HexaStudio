'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SearchOverlay, useSearchHotkey } from '@/components/SearchOverlay';
import { NotificationBell } from '@/components/NotificationBell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isOpen: searchOpen, open: openSearch, close: closeSearch } = useSearchHotkey();

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  return (
    <div className="flex h-screen bg-background text-white">
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:block shrink-0">
        <DashboardSidebar onSearchOpen={openSearch} />
      </div>

      {/* Mobile sidebar — animated overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 z-50 h-full lg:hidden"
            >
              <DashboardSidebar onSearchOpen={openSearch} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top header bar */}
        <div className="sticky top-0 z-30 flex items-center justify-end px-6 py-3 bg-background/80 backdrop-blur-md border-b border-[#1F1F1F]/30">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-auto p-2 rounded-lg bg-[#141414] border border-[#1F1F1F] text-[#888] hover:text-white transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          {/* Notification bell */}
          <NotificationBell />
        </div>

        <ErrorBoundary
          fallback={<ErrorFallback showHomeButton={false} />}
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full min-h-[50vh]">
                <Spinner size="lg" />
              </div>
            }
          >
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Global Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={closeSearch} />
    </div>
  );
}
