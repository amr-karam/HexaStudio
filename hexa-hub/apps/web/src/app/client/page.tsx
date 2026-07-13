'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Briefcase, Bell, FileText } from 'lucide-react';

export default function ClientDashboard() {
  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-serif font-light text-white mb-2">Welcome back, <span className="text-gold">Client</span></h1>
        <p className="text-neutral-500 font-light text-lg">Here is an overview of your active projects.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="p-8 bg-surface border border-border rounded-3xl">
          <Briefcase className="text-gold mb-4" size={32} />
          <h3 className="text-neutral-400 text-sm uppercase tracking-widest mb-1">Active Projects</h3>
          <div className="text-3xl font-serif text-white">0</div>
        </div>
        <div className="p-8 bg-surface border border-border rounded-3xl">
          <Bell className="text-gold mb-4" size={32} />
          <h3 className="text-neutral-400 text-sm uppercase tracking-widest mb-1">Recent Notifications</h3>
          <div className="text-3xl font-serif text-white">0</div>
        </div>
        <div className="p-8 bg-surface border border-border rounded-3xl">
          <FileText className="text-gold mb-4" size={32} />
          <h3 className="text-neutral-400 text-sm uppercase tracking-widest mb-1">Pending Invoices</h3>
          <div className="text-3xl font-serif text-white">0</div>
        </div>
      </div>

      <div className="p-12 bg-surface border border-border rounded-3xl text-center">
        <p className="text-neutral-500 font-light italic text-lg">
          No active projects found. Contact your account manager to start a new project.
        </p>
      </div>
    </div>
  );
}
