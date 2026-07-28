'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Folder,
  FileText,
  Image,
  File,
  Download,
  Search,
  AlertCircle,
} from 'lucide-react';

const folders = [
  { name: 'Contracts', count: 12, icon: FileText, color: 'text-blue-400' },
  { name: 'Blueprints', count: 8, icon: Image, color: 'text-amber-400' },
  { name: 'Reports', count: 24, icon: FileText, color: 'text-emerald-400' },
  { name: 'Proposals', count: 6, icon: File, color: 'text-violet-400' },
];

export default function DocumentsPage() {
  return (
    <div className="p-8 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <h1 className="text-4xl font-serif font-light mb-2">
          <span className="text-gold">Documents</span>
        </h1>
        <p className="text-neutral-500 font-light">
          Centralized document storage for your workspace.
        </p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent"
        />
      </motion.div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
        <input
          type="text"
          placeholder="Search documents..."
          className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/10 transition-all"
        />
      </div>

      {/* Folder Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {folders.map((folder, i) => (
          <motion.div
            key={folder.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className="p-6 bg-surface border border-border rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center ${folder.color}`}>
                <folder.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-serif font-light text-white group-hover:text-gold transition-colors">
                  {folder.name}
                </p>
                <p className="text-xs text-neutral-600">{folder.count} files</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <Download size={12} />
              <span>Access folder</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Documents */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <p className="text-sm text-neutral-400 font-light">Recent Documents</p>
        </div>
        <div className="p-12 text-center">
          <AlertCircle size={32} className="mx-auto text-neutral-700 mb-3" />
          <p className="text-neutral-600 text-sm font-light">
            Document list will appear once connected to Odoo or MinIO storage.
          </p>
        </div>
      </div>
    </div>
  );
}