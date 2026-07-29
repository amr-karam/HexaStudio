'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash, Lock } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; type: 'public' | 'private' }) => void;
}

export function CreateChannelModal({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() || undefined, type });
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-[#141414] border border-[#1F1F1F] rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-serif font-light text-white">Create Channel</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg text-[#555] hover:text-white hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] text-[#666] mb-2">Channel Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. design-team"
                  className="w-full bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#D4A843]/50 transition-all"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] text-[#666] mb-2">Description (optional)</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this channel about?"
                  className="w-full bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#D4A843]/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] text-[#666] mb-2">Visibility</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['public', 'private'] as const).map((t) => {
                    const isSelected = type === t;
                    const Icon = t === 'public' ? Hash : Lock;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm transition-all ${
                          isSelected
                            ? 'bg-[#D4A843]/5 border-[#D4A843]/30 text-[#D4A843]'
                            : 'bg-[#1A1A1A] border-[#1F1F1F] text-[#888] hover:border-[#333]'
                        }`}
                      >
                        <Icon size={15} />
                        <span className="capitalize">{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#D4A843] text-[#0A0A0A] rounded-lg text-sm font-medium hover:bg-[#D4A843]/90 transition-all mt-2"
              >
                Create Channel
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}