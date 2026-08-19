'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, History, Settings, CheckCircle } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Summarize my active projects',
  'What tasks are overdue?',
  'Show me Q3 revenue vs budget',
  'Find related documents',
  'Analyze team productivity',
  'Generate project timeline',
  'Create a lead for Acme Corp',
  'What are our top CRM opportunities?',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentName?: string;
  confidence?: number;
  sources?: string[];
  timestamp: Date;
}

const AGENT_INFO: Record<string, { emoji: string; color: string; label: string }> = {
  'erp-analyst': { emoji: '📊', color: 'var(--color-metric-amber)', label: 'ERP Analyst' },
  'project-assistant': { emoji: '📋', color: 'var(--color-info)', label: 'Project Assistant' },
  'sales-agent': { emoji: '💼', color: 'var(--color-metric-emerald)', label: 'Sales Agent' },
  'knowledge-agent': { emoji: '📚', color: 'var(--color-metric-violet)', label: 'Knowledge Agent' },
};

function AgentBadge({ agentName, size = 'sm' }: { agentName?: string; size?: 'sm' | 'md' }) {
  const info = agentName ? (AGENT_INFO[agentName] ?? AGENT_INFO['knowledge-agent']) : AGENT_INFO['knowledge-agent'];
  const sizeClass = size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs';
  return (
    <div
      className={`rounded-full flex items-center justify-center ${sizeClass}`}
      style={{
        backgroundColor: `${info.color}20`,
        color: info.color,
        border: `1px solid ${info.color}40`,
      }}
    >
      <span className="leading-none">{info.emoji}</span>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <motion.span
        className="w-1.5 h-1.5 bg-tertiary rounded-full"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
      />
      <motion.span
        className="w-1.5 h-1.5 bg-tertiary rounded-full"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
      />
      <motion.span
        className="w-1.5 h-1.5 bg-tertiary rounded-full"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );
}

function ToolCallIndicator({ toolName, isActive = true }: { toolName: string; isActive?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <motion.div
        animate={{ rotate: isActive ? 360 : 0 }}
        transition={{ duration: 1, repeat: isActive ? Infinity : 0, ease: 'linear' }}
      >
        <span className="text-info">🔧</span>
      </motion.div>
      <span className="text-tertiary">agent → calling {toolName}</span>
    </div>
  );
}

export default function DevPreviewPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'user',
      content: 'Show me Q3 revenue vs budget',
      timestamp: new Date(),
    },
    {
      id: '2',
      role: 'assistant',
      content: `Q3 revenue was €1.2M, representing a 5% increase above budget of €1.14M.\nTop performing segments:\n• Enterprise contracts: €850K (exceeded by 12%)\n• Mid-market: €350K (on target)\n\n[Sources: Odoo Accounting, CRM Pipeline]`,
      agentName: 'erp-analyst',
      confidence: 0.95,
      sources: ['odoo.account.move', 'crm.pipeline'],
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolCalls] = useState(['odoo_search_read', 'postgres_query']);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I can help you analyze that data. Would you like me to break it down further?',
        agentName: 'erp-analyst',
        confidence: 0.88,
        sources: ['odoo.account.move'],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-void-deep text-foreground">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border bg-void-deep px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gold/10">
            <Bot size={18} className="text-gold" />
          </div>
          <div>
            <h1 className="text-base font-serif font-light text-foreground">AI Assistant</h1>
            <p className="text-[11px] text-tertiary">Ask me about your projects, tasks, and data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface border border-border">
            <span className="text-xs">📊 erp-analyst</span>
          </div>
          <button className="p-2 rounded-lg text-tertiary hover:text-foreground hover:bg-white/[0.03] transition-colors" title="History">
            <History size={16} />
          </button>
          <button className="p-2 rounded-lg text-tertiary hover:text-foreground hover:bg-white/[0.03] transition-colors" title="Settings">
            <Settings size={16} />
          </button>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end mb-4"
              >
                <div
                  className={[
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    isUser
                      ? 'bg-gold text-void-deep rounded-br-md'
                      : 'bg-surface border border-border rounded-bl-md',
                  ].join(' ')}
                >
                  {!isUser && msg.agentName && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                      <AgentBadge agentName={msg.agentName} size="sm" />
                      <span className="text-xs text-tertiary">
                        {msg.agentName.replace(/-/g, ' ')}
                      </span>
                      {msg.confidence !== undefined && (
                        <span className="text-xs text-tertiary ml-auto">
                          {Math.round(msg.confidence * 100)}% confident
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-foreground whitespace-pre-line">{msg.content}</p>

                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.sources.map((source) => (
                        <span key={source} className="text-[10px] px-2 py-0.5 rounded-full bg-info/10 text-info">
                          {source}
                        </span>
                      ))}
                    </div>
                  ))}

                  <div className="flex items-center justify-end gap-2 mt-2 text-[10px] text-tertiary">
                    <span>{msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    {isUser && <CheckCircle size={10} className="text-gold" />}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-4">
              <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <TypingDots />
                {toolCalls.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {toolCalls.map((tool, i) => (
                      <ToolCallIndicator key={`${tool}-${i}`} toolName={tool} isActive={true} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Follow-up suggestions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 rounded-full text-xs text-tertiary bg-surface border border-border hover:bg-border transition-colors"
            >
              Show expense breakdown
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 rounded-full text-xs text-tertiary bg-surface border border-border hover:bg-border transition-colors"
            >
              Compare with last quarter
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 rounded-full text-xs text-tertiary bg-surface border border-border hover:bg-border transition-colors"
            >
              Export to CSV
            </motion.button>
          </div>

          {/* Suggested Prompts (when no messages) */}
          {messages.length <= 2 && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-4 pb-4"
            >
              <p className="text-[11px] text-tertiary mb-3 uppercase tracking-[0.2em]">Ask me to</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <motion.button
                    key={prompt}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInputValue(prompt)}
                    className="px-3 py-1.5 rounded-full text-xs text-tertiary bg-surface border border-border hover:bg-border transition-colors"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <footer className="border-t border-border bg-void-deep p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 bg-surface border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-tertiary focus:border-gold/50 focus:outline-none resize-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className="p-3 rounded-2xl bg-gold text-void-deep disabled:opacity-50 disabled:cursor-not-allowed transition-transform"
            >
              <Send size={18} />
            </motion.button>
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-tertiary">
            <span>⌘K to focus, Shift+Enter for new line</span>
            <span>{inputValue.length}/500</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
