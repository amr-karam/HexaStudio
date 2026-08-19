'use client';

// ─── HEXA Hub — AI Assistant Chat Widget ──────────────────────────────────
// Floating chat button (bottom-right gold circle) that expands into a
// cinematic AI chat panel. Uses useAiAssistant hook for Gemini-powered
// conversational AI with full message history.
//
// Design: Dark luxury theme with gold (#D4A843) accents, glass-morphism
// panel, smooth Framer Motion animations, premium typography.
// ───────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  ChevronDown,
  Bot,
  User,
} from 'lucide-react';
import { cn } from '@/components/ui/cn';
import { useAiAssistant } from '@/lib/hooks/use-ai';

// ─── Props ─────────────────────────────────────────────────────────────────

export interface AiAssistantProps {
  /** Optional custom class for the floating button */
  className?: string;
}

// ─── Panel Animation Variants ──────────────────────────────────────────────

const panelVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const messageVariants = {
  hidden: {
    opacity: 0,
    y: 8,
    x: 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// ─── Component ─────────────────────────────────────────────────────────────

export function AiAssistant({ className }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, isLoading, clearConversation, isError } =
    useAiAssistant();

  // ── Auto-scroll to latest message ────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  // ── Focus input when panel opens ─────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      // Small delay for animation to complete
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue);
    setInputValue('');
  }, [inputValue, isLoading, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleClear = useCallback(() => {
    clearConversation();
  }, [clearConversation]);

  // ── Render: Floating Button ──────────────────────────────────────────────

  return (
    <>
      {/* ─ Floating Trigger Button ───────────────────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center justify-center',
          'w-14 h-14 rounded-full shadow-[0_0_30px_rgba(212, 175, 55,0.15)]',
          'transition-all duration-500',
          isOpen
            ? 'bg-surface border border-border'
            : 'bg-gradient-to-br from-gold to-gold-deep hover:shadow-[0_0_40px_rgba(212, 175, 55,0.25)]',
          className,
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X size={20} className="text-foreground" />
            </motion.span>
          ) : (
            <motion.span
              key="sparkle"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
            >
              <Sparkles
                size={22}
                className="text-void-deep"
                strokeWidth={1.5}
              />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ─ Chat Panel ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={cn(
              'fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]',
              'flex flex-col rounded-2xl overflow-hidden',
              'bg-void-deep backdrop-blur-2xl border border-border',
              'shadow-[0_8px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(212, 175, 55,0.05)]',
            )}
          >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-void-deep">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-gold border border-gold/10 flex items-center justify-center">
                  <Sparkles size={16} className="text-gold" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-light text-foreground tracking-wide">
                    AI Assistant
                  </p>
                  <p className="text-[10px] text-tertiary font-light uppercase tracking-[0.1em]">
                    HEXA · Gemini
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClear}
                  disabled={messages.length === 0}
                  aria-label="Clear conversation"
                  className="p-2 rounded-lg text-tertiary hover:text-gold hover:bg-white/[0.03] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close assistant"
                  className="p-2 rounded-lg text-tertiary hover:text-foreground hover:bg-white/[0.05] transition-colors"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* ── Messages Area ──────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-h-[420px] scrollbar-thin">
              {/* Empty state */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center mb-4">
                    <Bot size={22} className="text-gold/40" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-tertiary font-light max-w-[250px] leading-relaxed">
                    Ask me anything about your projects, tasks, leads, or get
                    insights from your data.
                  </p>
                </motion.div>
              )}

              {/* Message bubbles */}
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    layout
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {/* Assistant avatar */}
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot size={14} className="text-gold" strokeWidth={1.5} />
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={cn(
                        'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm font-light leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-gold text-void-deep rounded-tr-md'
                          : 'bg-surface border border-border text-secondary rounded-tl-md',
                      )}
                    >
                      {msg.content}
                    </div>

                    {/* User avatar */}
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-border border border-border-hover flex items-center justify-center shrink-0 mt-0.5">
                        <User size={13} className="text-tertiary" strokeWidth={1.5} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/10 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <div className="flex gap-1.5 px-4 py-3 rounded-2xl rounded-tl-md bg-surface border border-border">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce [animation-delay:300ms]" />
                  </div>
                </motion.div>
              )}

              {/* Error state */}
              {isError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-3"
                >
                  <p className="text-xs text-error font-light">
                    Something went wrong. Please try again.
                  </p>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ─────────────────────────────────────────────── */}
            <div className="px-4 py-3 border-t border-border bg-void-deep">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask HEXA anything..."
                  disabled={isLoading}
                  className={cn(
                    'flex-1 bg-surface border border-border rounded-xl px-4 py-2.5',
                    'text-sm text-foreground placeholder:text-tertiary font-light',
                    'focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20/20',
                    'transition-all duration-300',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                  )}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Send message"
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    'transition-all duration-300',
                    inputValue.trim() && !isLoading
                      ? 'bg-gold text-void-deep hover:bg-gold/90'
                      : 'bg-border text-tertiary',
                    'disabled:cursor-not-allowed',
                  )}
                >
                  <Send size={16} strokeWidth={1.5} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AiAssistant;
