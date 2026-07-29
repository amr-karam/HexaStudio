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
    <div className="w-64 border-r border-[#1F1F1F] flex flex-col bg-black/20 shrink-0">
      <div className="p-4 border-b border-[#1F1F1F] flex items-center justify-between">
        <h2 className="text-sm font-medium text-white tracking-wide uppercase">Channels</h2>
        <button onClick={onCreateChannel} className="p-1.5 rounded-lg text-[#555] hover:text-[#D4A843] hover:bg-white/5 transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="p-3 border-b border-[#1F1F1F]">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find channels..."
            className="w-full bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg py-1.5 pl-7 pr-3 text-xs text-white outline-none focus:border-[#D4A843]/40 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {isLoading ? (
          <div className="p-4 text-center text-[11px] text-[#555]">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-[11px] text-[#555]">No channels</div>
        ) : (
          filtered.map((ch) => {
            const isActive = activeChannelId === ch.id;
            return (
              <motion.button
                key={ch.id}
                onClick={() => onSelectChannel(ch)}
                whileHover={{ x: 2 }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive ? 'bg-[#D4A843]/10 text-[#D4A843]' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
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