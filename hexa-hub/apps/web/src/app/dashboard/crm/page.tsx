'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCrmLeads, useCrmStats } from '@/lib/hooks';
import {
  Users,
  Target,
  TrendingUp,
  Search,
  ChevronRight,
  Filter,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';

export default function CrmPage() {
  const [search, setSearch] = useState('');
  const { data: stats, isLoading: statsLoading } = useCrmStats();
  const { data: leads, isLoading: leadsLoading, total } = useCrmLeads(
    search ? { search, limit: 50 } : { limit: 50 },
  );

  const isLoading = statsLoading || leadsLoading;

  return (
    <div className="p-8 md:p-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <h1 className="text-4xl font-serif font-light mb-2">
          CRM <span className="text-gold">Pipeline</span>
        </h1>
        <p className="text-neutral-500 font-light">
          Manage leads, track opportunities, and monitor conversions.
        </p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent"
        />
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-surface border border-border rounded-xl">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Total Leads</p>
          <p className="text-2xl font-serif font-light text-white">
            {statsLoading ? '...' : stats?.total_leads ?? 0}
          </p>
        </div>
        <div className="p-5 bg-surface border border-border rounded-xl">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Conversion Rate</p>
          <p className="text-2xl font-serif font-light text-gold">
            {statsLoading ? '...' : `${stats?.conversion_rate ?? 0}%`}
          </p>
        </div>
        <div className="p-5 bg-surface border border-border rounded-xl">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Avg Deal Size</p>
          <p className="text-2xl font-serif font-light text-emerald-400">
            {statsLoading ? '...' : `€${(stats?.average_deal_size ?? 0).toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/10 transition-all"
        />
      </div>

      {/* Leads Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <p className="text-sm text-neutral-400 font-light">
            {total > 0 ? `${total} lead${total === 1 ? '' : 's'}` : 'Leads'}
          </p>
          <Filter size={14} className="text-neutral-600" />
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-neutral-800 rounded-lg" />
              ))}
            </div>
          </div>
        ) : leads && leads.length > 0 ? (
          <div className="divide-y divide-border/30">
            {leads.map((lead, i) => (
              <motion.div
                key={lead.id ?? i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Users size={14} className="text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-light truncate">
                    {lead.contact_name || lead.name || 'Unnamed Lead'}
                  </p>
                  <p className="text-xs text-neutral-600 truncate">
                    {lead.email_from || 'No email'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-emerald-400 font-light">
                    €{(lead.planned_revenue ?? 0).toLocaleString()}
                  </p>
                </div>
                <ChevronRight size={14} className="text-neutral-700 shrink-0" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertCircle size={32} className="mx-auto text-neutral-700 mb-3" />
            <p className="text-neutral-600 text-sm font-light">No leads found.</p>
          </div>
        )}
      </div>
    </div>
  );
}