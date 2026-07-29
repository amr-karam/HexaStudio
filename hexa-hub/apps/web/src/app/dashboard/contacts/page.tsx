'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useContacts, useClients } from '@/lib/hooks';
import {
  Contact,
  Search,
  ChevronRight,
  Building2,
  User,
  AlertCircle,
} from 'lucide-react';
import { ExportButton } from '@/components/ExportButton';
import type { ExportColumn } from '@/components/ExportButton';

export default function ContactsPage() {
  const [tab, setTab] = useState<'all' | 'clients'>('all');
  const [search, setSearch] = useState('');
  const { data: allContacts, isLoading: allLoading, total } = useContacts(
    search ? { search, limit: 50 } : { limit: 50 },
  );
  const { data: clients, isLoading: clientsLoading } = useClients();

  const contacts = tab === 'clients' ? clients : allContacts;
  const isLoading = tab === 'clients' ? clientsLoading : allLoading;
  const displayTotal = tab === 'clients' ? (clients?.length ?? 0) : total;

  // ─── Export Columns ─────────────────────────────────────────────────────
  const contactExportColumns: ExportColumn[] = [
    { header: 'Name', key: 'name', format: (val: unknown) => String(val ?? 'Unnamed') },
    { header: 'Email', key: 'email', format: (val: unknown) => String(val ?? '—') },
    { header: 'Phone', key: 'phone', format: (val: unknown) => String(val ?? '—') },
    { header: 'Type', key: 'is_company', format: (val: unknown) =>
      val ? 'Company' : 'Individual' },
    { header: 'Street', key: 'street', format: (val: unknown) => String(val ?? '—') },
    { header: 'City', key: 'city', format: (val: unknown) => String(val ?? '—') },
    { header: 'Country', key: 'country_id', format: (val: unknown) => {
      if (Array.isArray(val) && val.length > 1) return String(val[1]);
      return String(val ?? '—');
    }},
  ];

  return (
    <div className="p-8 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <h1 className="text-4xl font-serif font-light mb-2">
          <span className="text-gold">Contacts</span>
        </h1>
        <p className="text-neutral-500 font-light">
          Manage your network of partners, clients, and collaborators.
        </p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent"
        />
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-light transition-all ${
            tab === 'all'
              ? 'bg-gold/10 text-gold border border-gold/30'
              : 'text-neutral-500 border border-transparent hover:text-neutral-300'
          }`}
        >
          All Contacts
        </button>
        <button
          onClick={() => setTab('clients')}
          className={`px-4 py-2 rounded-lg text-sm font-light transition-all ${
            tab === 'clients'
              ? 'bg-gold/10 text-gold border border-gold/30'
              : 'text-neutral-500 border border-transparent hover:text-neutral-300'
          }`}
        >
          Clients
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/10 transition-all"
            />
          </div>
          <ExportButton
            data={(contacts as unknown as Record<string, unknown>[]) ?? []}
            columns={contactExportColumns}
            filename="contacts-export"
            format="csv"
            label="Export"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <p className="text-sm text-neutral-400 font-light">
            {displayTotal > 0 ? `${displayTotal} contact${displayTotal === 1 ? '' : 's'}` : 'Contacts'}
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-neutral-800 rounded-lg" />
              ))}
            </div>
          </div>
        ) : contacts && contacts.length > 0 ? (
          <div className="divide-y divide-border/30">
            {contacts.map((contact, i) => (
              <motion.div
                key={contact.id ?? i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                  <User size={15} className="text-neutral-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-light truncate">
                    {contact.name || 'Unnamed'}
                  </p>
                  <p className="text-xs text-neutral-600 truncate">{contact.email || '—'}</p>
                </div>
                <span className="text-xs text-neutral-600 shrink-0">
                  {contact.is_company ? 'Company' : 'Individual'}
                </span>
                <ChevronRight size={14} className="text-neutral-700 shrink-0" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertCircle size={32} className="mx-auto text-neutral-700 mb-3" />
            <p className="text-neutral-600 text-sm font-light">No contacts found.</p>
          </div>
        )}
      </div>
    </div>
  );
}