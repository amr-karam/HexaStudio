'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8 md:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-4xl font-serif font-light mb-2">
          Welcome back, <span className="text-gold">{user?.fullName || 'User'}</span>
        </h1>
        <p className="text-neutral-500 font-light mb-12">
          Here is what's happening across your workspace today.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-surface border border-border rounded-2xl">
            <span className="text-xs uppercase tracking-widest text-neutral-500 mb-4 block">Active Projects</span>
            <div className="text-4xl font-serif font-light text-white">12</div>
          </div>
          <div className="p-6 bg-surface border border-border rounded-2xl">
            <span className="text-xs uppercase tracking-widest text-neutral-500 mb-4 block">Pending Approvals</span>
            <div className="text-4xl font-serif font-light text-gold">4</div>
          </div>
          <div className="p-6 bg-surface border border-border rounded-2xl">
            <span className="text-xs uppercase tracking-widest text-neutral-500 mb-4 block">Unread Messages</span>
            <div className="text-4xl font-serif font-light text-white">28</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
