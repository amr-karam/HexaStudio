'use client';

/**
 * HEXA Portal — Layout Content Wrapper
 *
 * Dynamically offsets the main content area based on the sidebar's collapsed
 * state (256px expanded / 64px collapsed on desktop). Uses the centralized
 * portal UI store for reactivity.
 */

import { usePortalStore } from '../store';
import { cn } from '@/lib/utils';

export function PortalLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = usePortalStore();

  return (
    <main
      className={cn(
        'flex-1 min-h-screen flex flex-col relative z-10',
        /* Left offset matches sidebar width — collapsed = 64px (4rem), expanded = 256px (16rem) */
        'pt-16 lg:pt-20',
        isSidebarCollapsed ? 'lg:pl-[4rem]' : 'lg:pl-[15.5rem]'
      )}
    >
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-16 py-12 transition-all duration-500 ease-in-out">
        {children}
      </div>
    </main>
  );
}
