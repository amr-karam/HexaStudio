'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, Plus, Lock, Search } from 'lucide-react';
import type { Channel } from '@/lib/hooks/use-channels';

interface Props {
  channels: Channel[];
  activeChannelId?: string | null;
  onSelectChannel: (channel: Channel) => void;
  onCreateChannel: () => void;
  isLoading?: boolean;
}

export function ChannelList({ channels, activeChannelId, onSelectChannel, onCreateChannel, isLoading }: Props) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? channels.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : channels;

  return (
    <div className="w-64 border-r border-border flex flex-col bg-void/20 shrink-0">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground tracking-wide uppercase">Channels</h2>
        <button onClick={onCreateChannel} className="p-1.5 rounded-lg text-tertiary hover:text-gold hover:bg-white/5 transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find channels..."
            className="w-full bg-surface border border-border rounded-lg py-1.5 pl-7 pr-3 text-xs text-foreground outline-none focus:border-gold/40 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {isLoading ? (
          <div className="p-4 text-center text-[11px] text-tertiary">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-[11px] text-tertiary">No channels</div>
        ) : (
          filtered.map((ch) => {
            const isActive = activeChannelId === ch.id;
            return (
              <motion.button
                key={ch.id}
                onClick={() => onSelectChannel(ch)}
                whileHover={{ x: 2 }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive ? 'bg-gold/10 text-gold' : 'text-tertiary hover:bg-white/5 hover:text-foreground'
                }`}
              >
                {ch.type === 'private' ? <Lock size={13} /> : <Hash size={13} />}
                <span className="text-sm font-light truncate">{ch.name}</span>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
