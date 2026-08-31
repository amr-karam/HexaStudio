'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion';

interface PortalLayoutContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PortalLayoutContent({ children, className }: PortalLayoutContentProps) {

  return (
    <main
      className={cn(
        'flex-1 lg:ml-64 min-h-screen bg-sl-void transition-all duration-500',
        className
      )}
      id="portal-main-content"
      role="main"
    >
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: EASE.entrance }}
        className="relative min-h-screen"
      >
        {/* Top bar spacer for mobile */}
        <div className="lg:hidden h-16" aria-hidden="true" />

        {/* Page content with subtle entrance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE.entrance }}
          className="pt-6 lg:pt-8 pb-12 lg:pb-16 px-4 lg:px-8 xl:px-12 max-w-[1400px] mx-auto"
        >
          {children}
        </motion.div>

        {/* Bottom spacing for mobile nav */}
        <div className="lg:hidden h-20" aria-hidden="true" />
      </motion.div>
    </main>
  );
}

export default PortalLayoutContent;