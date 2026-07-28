'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  RefreshCw,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
} from 'lucide-react';

interface SyncService {
  name: string;
  icon: React.ElementType;
  status: 'synced' | 'syncing' | 'error' | 'pending';
  lastSync: string;
  description: string;
}

const services: SyncService[] = [
  {
    name: 'Odoo CRM',
    icon: Database,
    status: 'synced',
    lastSync: '2 minutes ago',
    description: 'Leads, contacts, and pipeline data',
  },
  {
    name: 'Odoo Projects',
    icon: Database,
    status: 'synced',
    lastSync: '5 minutes ago',
    description: 'Projects, milestones, and tasks',
  },
  {
    name: 'Odoo Sales',
    icon: Database,
    status: 'synced',
    lastSync: '3 minutes ago',
    description: 'Quotations, invoices, and orders',
  },
  {
    name: 'Odoo Contacts',
    icon: Cloud,
    status: 'synced',
    lastSync: '10 minutes ago',
    description: 'Partners and client records',
  },
  {
    name: 'Email Sync',
    icon: Cloud,
    status: 'pending',
    lastSync: '—',
    description: 'Mail messages and communications',
  },
  {
    name: 'Document Storage',
    icon: Cloud,
    status: 'pending',
    lastSync: '—',
    description: 'MinIO document bridge',
  },
];

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  synced: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Synced' },
  syncing: { icon: RefreshCw, color: 'text-blue-400', label: 'Syncing...' },
  error: { icon: XCircle, color: 'text-red-400', label: 'Error' },
  pending: { icon: Clock, color: 'text-neutral-600', label: 'Pending' },
};

export default function SyncStatusPage() {
  return (
    <div className="p-8 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <h1 className="text-4xl font-serif font-light mb-2">
          Sync <span className="text-gold">Status</span>
        </h1>
        <p className="text-neutral-500 font-light">
          Monitor data synchronization across connected services.
        </p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent"
        />
      </motion.div>

      {/* Overall Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex items-center gap-4 p-5 mb-8 bg-surface border border-border rounded-xl"
      >
        <Activity size={20} className="text-emerald-400" />
        <div>
          <p className="text-sm text-white/80 font-light">All systems operational</p>
          <p className="text-xs text-neutral-600">4 of 6 services connected</p>
        </div>
        <button className="ml-auto flex items-center gap-2 px-4 py-2 text-xs text-gold border border-gold/30 rounded-lg hover:bg-gold/5 transition-all">
          <RefreshCw size={12} />
          Sync All
        </button>
      </motion.div>

      {/* Service List */}
      <div className="space-y-3">
        {services.map((service, i) => {
          const StatusIcon = statusConfig[service.status].icon;
          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-center gap-4 p-5 bg-surface border border-border rounded-xl hover:border-border/80 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center">
                <service.icon size={16} className="text-neutral-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 font-light">{service.name}</p>
                <p className="text-xs text-neutral-600">{service.description}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 justify-end">
                  <StatusIcon size={12} className={statusConfig[service.status].color} />
                  <span className={`text-xs font-medium ${statusConfig[service.status].color}`}>
                    {statusConfig[service.status].label}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-600 mt-0.5">{service.lastSync}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}