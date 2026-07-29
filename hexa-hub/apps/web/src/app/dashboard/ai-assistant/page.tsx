'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon, Sparkles, Loader2, Settings, History, Star } from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import TypingDots from '@/components/TypingDots';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiResponse {
  id: string;
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  'Summarize my active projects',
  'What tasks are overdue?',
  'Draft a client update email',
  'Find related documents',
  'Analyze team productivity',
  'Generate project timeline',
];

const MOCK_HISTORY: Message[] = [
  { id: '1', role: 'user', content: 'What\'s the status of Project Alpha?', timestamp: '2026-07-28T10:30:00Z' },
  { id: '2', role: 'assistant', content: 'Project Alpha is currently in progress. Design phase is 75% complete, and development has started. The next milestone is the client review scheduled for August 5th.', timestamp: '2026-07-28T10:30:05Z' },
  { id: '3', role: 'user', content: 'Summarize the recent activity', timestamp: '2026-07-28T11:15:00Z' },
  { id: '4', role: 'assistant', content: 'Here are the 5 most recent activities:\n\n1. Invoice #INV-2024-089 was paid ($12,400)\n2. Lead "TechCorp" was converted to client\n3. Task "API Integration" completed by Sarah Chen\n4. Milestone "Design Phase" reached for Project Alpha\n5. New document uploaded: Brand Guidelines v2', timestamp: '2026-07-28T11:15:03Z' },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(MOCK_HISTORY);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `I've processed your request: "${userMessage.content}". Here's what I found...`,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [inputValue, isSending]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-[#1F1F1F] bg-[#0A0A0A] px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#D4A843]/10">
            <Bot size={18} className="text-[#D4A843]" />
          </div>
          <div>
            <h1 className="text-base font-serif font-light text-white">AI Assistant</h1>
            <p className="text-[11px] text-[#555]">Ask me about your projects, tasks, and data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-lg text-[#555] hover:text-white hover:bg-white/[0.03] transition-colors"
            title="History"
          >
            <History size={16} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg text-[#555] hover:text-white hover:bg-white/[0.03] transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex justify-end mb-4"
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    isUser
                      ? 'bg-[#D4A843] text-[#0A0A0A] rounded-br-md'
                      : 'bg-[#141414] border border-[#1F1F1F] rounded-bl-md'
                  )}
                >
                  <p className="text-sm text-white whitespace-pre-line">{msg.content}</p>
                  <div className="flex items-center justify-end gap-2 mt-2 text-[10px] text-[#888]">
                    <span>{new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    {isUser && <Star size={10} className="text-[#D4A843]" />}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {isSending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-4">
              <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl rounded-bl-md px-4 py-3">
                <TypingDots />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Prompts */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 pb-4"
        >
          <p className="text-[11px] text-[#555] mb-3 uppercase tracking-[0.2em]">Ask me to</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <motion.button
                key={prompt}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="px-3 py-1.5 rounded-full text-xs text-[#555] bg-[#141414] border border-[#1F1F1F] hover:bg-[#1F1F1F]/30 transition-colors"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <footer className="border-t border-[#1F1F1F] bg-[#0A0A0A] p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 bg-[#141414] border border-[#1F1F1F] rounded-2xl px-4 py-3 text-sm text-white placeholder-[#555] focus:border-[#D4A843]/50 focus:outline-none resize-none"
              onKeyDownCapture={handleKeyDown}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isSending}
              className="p-3 rounded-2xl bg-[#D4A843] text-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed transition-transform"
            >
              <Send size={18} />
            </motion.button>
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-[#555]">
            <span>⌘K to focus, Shift+Enter for new line</span>
            <span>{inputValue.length}/500</span>
          </div>
        </div>
      </footer>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-y-0 right-0 w-80 bg-[#141414] border-l border-[#1F1F1F] z-40"
          >
            <div className="p-4 border-b border-[#1F1F1F]">
              <h2 className="text-sm font-medium text-white">Recent Chats</h2>
            </div>
            <div className="overflow-y-auto">
              {MOCK_HISTORY.slice().reverse().map((msg, i) => {
                if (msg.role !== 'user') return null;
                return (
                  <motion.button
                    key={msg.id}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                    onClick={() => {
                      setInputValue(msg.content);
                      inputRef.current?.focus();
                    }}
                    className="w-full text-left p-3 border-b border-[#1F1F1F] last:border-0"
                  >
                    <p className="text-xs text-white font-medium truncate">{msg.content}</p>
                    <p className="text-[10px] text-[#555] mt-1">
                      {new Date(msg.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#141414] border border-[#1F1F1F] rounded-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-serif font-light text-white mb-4">AI Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-[#555] block mb-2">Model</label>
                  <select className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-sm text-white">
                    <option>hexa-gpt-4</option>
                    <option>hexa-gpt-3.5</option>
                    <option>hexa-llama-3</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#555] block mb-2">Temperature</label>
                  <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="w-full" />
                </div>
                <div>
                  <label className="text-[11px] text-[#555] block mb-2">Code Mode</label>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#1F1F1F] text-[#555] text-sm">
                    <Star size={14} />
                    <span>Enable</span>
                  </button>
                </div>
              </div>
              <motion.button
                whileHover={{ backgroundColor: 'rgba(212,168,67,0.1)' }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full py-2.5 bg-[#D4A843] text-[#0A0A0A] rounded-lg font-medium"
                onClick={() => setShowSettings(false)}
              >
                Save Settings
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}