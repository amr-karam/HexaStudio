'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, History, Settings, CheckCircle } from 'lucide-react';
import TypingDots from '@/components/TypingDots';
import { useAgentChat } from '@/features/ai-agents/hooks/use-agent-chat';
import { AgentBadge, AgentSelector, ToolCallIndicator, FollowUpSuggestions } from '@/features/ai-agents/components';

// ─── Suggested Prompts ──────────────────────────────────────────────────────

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

// ─── Component ──────────────────────────────────────────────────────────────

export default function AiAssistantPage() {
  const {
    messages,
    agents,
    selectedAgent,
    isProcessing,
    sendMessage,
    selectAgent,
    currentQuery,
    toolCalls,
  } = useAgentChat();

  const [inputValue, setInputValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync inputValue with currentQuery when set externally
  useEffect(() => {
    if (currentQuery) {
      setInputValue(currentQuery);
      inputRef.current?.focus();
    }
  }, [currentQuery]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Keyboard shortcut: ⌘K to focus
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
    if (!inputValue.trim() || isProcessing) return;
    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message, selectedAgent ?? undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
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
          {/* Agent Selector */}
          {agents.length > 0 && (
            <AgentSelector
              agents={agents}
              selected={selectedAgent}
              onSelect={selectAgent}
            />
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-lg text-tertiary hover:text-foreground hover:bg-white/[0.03] transition-colors"
            title="History"
          >
            <History size={16} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg text-tertiary hover:text-foreground hover:bg-white/[0.03] transition-colors"
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

                  <p className="text-sm text-foreground whitespace-pre-line">{msg.content || <TypingDots />}</p>

                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.sources.map((source, s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-info/10 text-info">
                          {source}
                        </span>
                      ))}
                    </div>
                  )}

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
                      <ToolCallIndicator
                        key={`${tool}-${i}`}
                        toolName={tool}
                        agentName="agent"
                        isActive={true}
                      />
                    ))}
                  </div>
                )}
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
                onClick={() => handleSuggestedPrompt(prompt)}
                className="px-3 py-1.5 rounded-full text-xs text-tertiary bg-surface border border-border hover:bg-border transition-colors"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <footer className="border-t border-border bg-void-deep p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
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

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-y-0 right-0 w-80 bg-surface border-l border-border z-40"
          >
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">Recent Chats</h2>
            </div>
            <div className="overflow-y-auto">
              {messages.filter(m => m.role === 'user').map((msg) => (
                <motion.button
                  key={msg.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  onClick={() => {
                    setInputValue(msg.content);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left p-3 border-b border-border last:border-0"
                >
                  <p className="text-xs text-foreground font-medium truncate">{msg.content}</p>
                  <p className="text-[10px] text-tertiary mt-1">
                    {msg.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-void/60 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-surface border border-border rounded-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-serif font-light text-foreground mb-4">AI Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-tertiary block mb-2">Agent</label>
                  <select
                    value={selectedAgent ?? 'auto'}
                    onChange={e => selectAgent(e.target.value === 'auto' ? null : e.target.value)}
                    className="w-full bg-void-deep border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  >
                    <option value="auto">Auto-detect (recommended)</option>
                    {agents.map(agent => (
                      <option key={agent.name} value={agent.name}>
                        {agent.icon} {agent.name.replace(/-/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-tertiary block mb-2">Temperature</label>
                  <input type="range" min="0" max="1" step="0.1" defaultValue="0.4" className="w-full" />
                </div>
                <div>
                  <label className="text-[11px] text-tertiary block mb-2">Code Mode</label>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-tertiary text-sm">
                    <CheckCircle size={14} />
                    <span>Enable</span>
                  </button>
                </div>
              </div>
              <motion.button
                whileHover={{ backgroundColor: 'rgba(212, 175, 55,0.1)' }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full py-2.5 bg-gold text-void-deep rounded-lg font-medium"
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
