'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, CornerDownRight } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useThread, useSendThreadReply } from '@/lib/hooks/use-threads';
import type { ChatMessage } from '@hexa-hub/types';

// ─── Animation Variants ─────────────────────────────────────────────────────

const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const replyVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  }),
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface ThreadPanelProps {
  parentMessage: ChatMessage & { replyCount?: number };
  channelId?: string; // For channel threads
  onClose: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ThreadPanel({ parentMessage, channelId, onClose }: ThreadPanelProps) {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: threadData, isLoading } = useThread(parentMessage.id, channelId);
  const sendReplyMutation = useSendThreadReply(parentMessage.id, channelId);

  const replies = threadData?.replies ?? [];
  const totalReplies = threadData?.replyCount ?? parentMessage.replyCount ?? replies.length;

  // Auto-scroll to bottom when new replies arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies.length]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await sendReplyMutation.mutateAsync({ content: input });
      setInput('');
    } catch {
      // Silent
    }
  };

  const isOwnMessage = parentMessage.senderId === user?.id;

  return (
    <AnimatePresence>
      {true && (
        <div className="absolute inset-0 z-20 flex">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-0 bottom-0 w-[420px] max-w-[85vw] bg-[#0E0E0E] border-l border-[#1F1F1F] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1F1F1F] shrink-0">
              <div className="flex items-center gap-2.5">
                <MessageCircle size={18} className="text-[#D4A843]" />
                <span className="text-white font-serif font-light">
                  Thread
                </span>
                <span className="text-[11px] text-[#555]">
                  {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#555] hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Thread Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Parent Message */}
              <div className="p-5 border-b border-[#1F1F1F]/50">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#1F1F1F] flex items-center justify-center text-xs text-[#888] shrink-0 font-medium">
                    {parentMessage.sender?.fullName?.[0] ?? '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {parentMessage.sender?.fullName ?? 'Unknown'}
                      </span>
                      <span className="text-[10px] text-[#555]">
                        {formatTimestamp(parentMessage.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300 font-light leading-relaxed break-words">
                      {parentMessage.content}
                    </p>
                  </div>
                </div>
              </div>

              {/* Replies */}
              <div className="py-2">
                {isLoading ? (
                  <div className="py-12 flex items-center justify-center">
                    <span className="text-[12px] text-[#555] font-light">
                      Loading replies...
                    </span>
                  </div>
                ) : replies.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <CornerDownRight size={20} className="text-[#333]" />
                    <span className="text-[12px] text-[#555] font-light">
                      No replies yet
                    </span>
                    <span className="text-[10px] text-[#444]">
                      Be the first to reply
                    </span>
                  </div>
                ) : (
                  replies.map((reply, i) => {
                    const isOwnReply = reply.senderId === user?.id;
                    return (
                      <motion.div
                        key={reply.id ?? i}
                        variants={replyVariants}
                        initial="hidden"
                        animate="visible"
                        custom={i}
                        className="px-5 py-3 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[10px] text-[#888] shrink-0 font-medium">
                            {reply.sender?.fullName?.[0] ?? '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-0.5">
                              <span
                                className={`text-xs font-medium ${
                                  isOwnReply ? 'text-[#D4A843]' : 'text-white'
                                }`}
                              >
                                {reply.sender?.fullName ?? 'Unknown'}
                              </span>
                              <span className="text-[9px] text-[#555]">
                                {formatTimestamp(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-[13px] text-neutral-400 font-light leading-relaxed break-words">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Reply Input */}
            <form
              onSubmit={handleSendReply}
              className="p-4 border-t border-[#1F1F1F] shrink-0"
            >
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Reply to thread...`}
                  className="flex-1 bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#555] font-light outline-none focus:border-[#D4A843]/40 transition-all"
                />
                <button
                  type="submit"
                  disabled={sendReplyMutation.isPending || !input.trim()}
                  className="bg-[#D4A843] text-[#0A0A0A] p-2.5 rounded-lg hover:bg-[#D4A843]/90 transition-all disabled:opacity-40 shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
