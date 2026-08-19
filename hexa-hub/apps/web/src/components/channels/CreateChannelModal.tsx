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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-void/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-serif font-light text-foreground">Create Channel</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg text-tertiary hover:text-foreground hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] text-tertiary mb-2">Channel Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. design-team"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-gold/50 transition-all"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] text-tertiary mb-2">Description (optional)</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this channel about?"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-gold/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] text-tertiary mb-2">Visibility</label>
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
                            ? 'bg-gold/5 border-gold/30 text-gold'
                            : 'bg-surface border-border text-tertiary hover:border-border'
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
                className="w-full py-3 bg-gold text-void-deep rounded-lg text-sm font-medium hover:bg-gold/90 transition-all mt-2"
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
