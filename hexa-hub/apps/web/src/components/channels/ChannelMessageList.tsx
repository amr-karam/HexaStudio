'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { MessageCircle } from 'lucide-react';
import type { ChannelMessage } from '@/lib/hooks/use-channels';

interface Props {
  messages: ChannelMessage[];
  isLoading?: boolean;
  onOpenThread?: (msg: ChannelMessage) => void;
}

function highlightMentions(text: string): React.ReactNode {
  const parts = text.split(/(@[a-zA-Z0-9_.-]+(?::[a-zA-Z0-9_.-]+)?)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const name = part.slice(1);
      const isSpecial = ['all', 'here', 'everyone', 'channel'].includes(name.toLowerCase());
      return (
        <span key={i} className={`font-medium ${isSpecial ? 'text-[#D4A843] bg-[#D4A843]/10 px-1 rounded' : 'text-[#D4A843]'}`}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ChannelMessageList({ messages, isLoading, onOpenThread }: Props) {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><span className="text-[12px] text-[#555]">Loading messages...</span></div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-3">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-[12px] text-[#555] font-light">
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((msg, idx) => {
          const isOwn = msg.senderId === user?.id;
          return (
            <motion.div
              key={msg.id ?? idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.01, 0.3) }}
              className="group"
            >
              <div className={`flex items-start gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {!isOwn && (
                  <div className="w-7 h-7 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[10px] text-[#888] shrink-0 mt-1">
                    {msg.sender?.fullName?.[0] ?? '?'}
                  </div>
                )}
                <div className={`max-w-lg px-4 py-2.5 rounded-2xl text-sm ${
                  isOwn ? 'bg-[#D4A843] text-[#0A0A0A] rounded-tr-none' : 'bg-[#1A1A1A] text-neutral-300 rounded-tl-none border border-[#1F1F1F]'
                }`}>
                  {!isOwn && msg.sender?.fullName && (
                    <p className="text-[11px] font-medium text-[#D4A843] mb-0.5">{msg.sender.fullName}</p>
                  )}
                  {highlightMentions(msg.content)}
                </div>
                {isOwn && (
                  <div className="w-7 h-7 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[10px] text-[#888] shrink-0 mt-1">
                    {user?.fullName?.[0] ?? '?'}
                  </div>
                )}
              </div>
              {onOpenThread && (
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} pl-9`}>
                  <button
                    onClick={() => onOpenThread(msg)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-[#555] hover:text-[#D4A843] mt-0.5"
                  >
                    <MessageCircle size={10} />
                    <span>{msg.replyCount ? `${msg.replyCount} replies` : 'Reply'}</span>
                  </button>
                </div>
              )}
            </motion.div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}