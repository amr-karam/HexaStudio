'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextReveal } from '@/components/ui/TextReveal';
import { EASE } from '@/lib/motion';
import { useLocale } from '@/i18n/LocaleProvider';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

type Provider = 'openai' | 'gemini';

export default function AIPage() {
  const { t } = useLocale();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t('ai.welcome'),
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<Provider>('openai');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, provider }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || t('ai.noResponse'),
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: t('ai.errorMessage'),
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background relative overflow-hidden">
      {/* Ambient gold aura */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-accent/3 blur-[180px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[30%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* ── Atelier Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE.entrance }}
          className="text-center mb-12 relative"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-neutral-500">
              § 01 — Intelligence
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-foreground">
            <TextReveal>
              HEXA <span className="italic text-accent">Intelligence</span>
            </TextReveal>
          </h1>

          <p className="text-neutral-400 font-light mt-4 max-w-xl mx-auto leading-relaxed">
            {t('ai.subtitle')}
          </p>
        </motion.div>

        {/* ── Artisan-Glass Chat Container ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE.entrance, delay: 0.15 }}
          className="artisan-glass artisan-specular-top rounded-2xl overflow-hidden relative"
        >
          {/* Gold radial aura */}
          <div
            className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-neutral-400">
                {t('ai.brand')}
              </span>
            </div>
            <select
              aria-label="AI provider"
              value={provider}
              onChange={e => setProvider(e.target.value as Provider)}
              className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] bg-white/[0.03] border border-border/20 rounded-lg px-3 py-1.5 text-neutral-400 focus:outline-none focus:border-accent/30 transition-colors duration-500 cursor-pointer"
            >
              <option value="openai">{t('ai.providerOpenAI')}</option>
              <option value="gemini">{t('ai.providerGemini')}</option>
            </select>
          </div>

          {/* Messages area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE.entrance }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'user' ? (
                    /* User message — gold accent */
                    <div className="max-w-[75%] rounded-2xl rounded-br-md px-4 py-3 bg-accent/10 border border-accent/20 text-foreground text-sm leading-relaxed">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className="block font-mono text-[0.5625rem] text-neutral-500 mt-1.5 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ) : (
                    /* Assistant message — obsidian glass */
                    <div className="max-w-[75%] rounded-2xl rounded-bl-md px-4 py-3 bg-white/[0.03] border border-white/5 text-foreground text-sm leading-relaxed">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className="block font-mono text-[0.5625rem] text-neutral-500 mt-1.5">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-white/[0.03] border border-white/5">
                    <div className="flex gap-1.5 px-1">
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleSubmit} className="border-t border-border/30 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                aria-label="Chat message"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={t('ai.placeholder')}
                disabled={isLoading}
                className="flex-1 bg-white/[0.03] border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-accent/40 focus:bg-white/[0.05] transition-all duration-500 disabled:opacity-40 font-light"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-5 py-3 bg-accent text-background rounded-xl text-sm font-medium hover:bg-accent-light active:scale-[0.97] transition-all duration-300 disabled:opacity-40 disabled:scale-100 font-mono uppercase tracking-[0.1em] text-[0.6875rem]"
              >
                {t('ai.send')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
