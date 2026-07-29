'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { consultAgent, AgentPersonaType } from '../api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: number;
}

const PERSONAS: Array<{ id: AgentPersonaType; name: string; subtitle: string; description: string; badge: string }> = [
  {
    id: 'ceo',
    name: 'HEXA-CEO',
    subtitle: 'Executive Strategy & Growth',
    description: 'High-level KPIs, financial forecasting, risk mitigation, and enterprise vision.',
    badge: 'Strategy',
  },
  {
    id: 'sales',
    name: 'HEXA-Sales',
    subtitle: 'Business Development & Leads',
    description: 'Lead qualification, tailored proposal drafting, and CRM pipeline optimization.',
    badge: 'Growth',
  },
  {
    id: 'pm',
    name: 'HEXA-PM',
    subtitle: 'Project Management & Velocity',
    description: 'Sprint planning, milestone tracking, resource allocation, and bottleneck prediction.',
    badge: 'Delivery',
  },
  {
    id: 'code-review',
    name: 'HEXA-Reviewer',
    subtitle: 'Technical Architecture & Security',
    description: 'Code quality audits, TypeScript strictness, OWASP security, and performance tuning.',
    badge: 'Engineering',
  },
];

export function AgentStudio() {
  const [selectedPersona, setSelectedPersona] = useState<AgentPersonaType>('ceo');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Record<AgentPersonaType, Message[]>>({
    ceo: [{ role: 'assistant', content: 'Greeting. I am HEXA-CEO. How may I assist with executive strategy, project valuation, or studio growth today?' }],
    sales: [{ role: 'assistant', content: 'Hello! I am HEXA-Sales. Ready to qualify leads, draft proposals, or review pricing structures.' }],
    pm: [{ role: 'assistant', content: 'Project Management online. Ready to analyze milestone velocity, team capacity, or schedule risks.' }],
    'code-review': [{ role: 'assistant', content: 'HEXA-Reviewer initialized. Standing by for architecture audits, security checks, and code reviews.' }],
  });

  const activePersonaMeta = PERSONAS.find((p) => p.id === selectedPersona)!;
  const messages = conversations[selectedPersona] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setConversations((prev) => ({ ...prev, [selectedPersona]: newMessages }));

    try {
      const res = await consultAgent(selectedPersona, userMsg);
      setConversations((prev) => ({
        ...prev,
        [selectedPersona]: [
          ...newMessages,
          { role: 'assistant', content: res.response, toolCalls: res.toolCalls },
        ],
      }));
    } catch {
      setConversations((prev) => ({
        ...prev,
        [selectedPersona]: [
          ...newMessages,
          { role: 'assistant', content: 'An error occurred while communicating with the agent. Please verify API configuration.' },
        ],
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-12 bg-background text-foreground border border-neutral-800 rounded-2xl shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-neutral-800 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-mono">Autonomous AI Swarm</span>
          <h2 className="text-3xl font-light tracking-tight mt-1">Multi-Agent Executive Studio</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Consult specialized AI personas for strategy, sales, project management, and engineering audits.
          </p>
        </div>
      </div>

      {/* Persona Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {PERSONAS.map((p) => {
          const isSelected = selectedPersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPersona(p.id)}
              className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-accent/10 border-accent text-foreground shadow-lg'
                  : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded ${
                    isSelected ? 'bg-accent text-background font-medium' : 'bg-neutral-800 text-neutral-300'
                  }`}>
                    {p.badge}
                  </span>
                </div>
                <h3 className="text-base font-medium text-foreground">{p.name}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{p.subtitle}</p>
              </div>
              <p className="text-xs text-neutral-500 mt-4 line-clamp-2">{p.description}</p>
            </button>
          );
        })}
      </div>

      {/* Chat Box */}
      <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-6 flex flex-col h-[550px]">
        {/* Chat Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-neutral-800">
          <div>
            <h3 className="text-lg font-medium text-foreground">{activePersonaMeta.name}</h3>
            <p className="text-xs text-neutral-400">{activePersonaMeta.subtitle}</p>
          </div>
          <span className="text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
            Active Persona
          </span>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-neutral-800">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent text-background rounded-br-none font-medium'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.toolCalls !== undefined && msg.toolCalls > 0 && (
                  <span className="text-[10px] font-mono text-neutral-500 mt-1">
                    ⚡ Executed {msg.toolCalls} tool call{msg.toolCalls > 1 ? 's' : ''}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex items-center gap-2 text-neutral-500 text-xs font-mono p-3 bg-neutral-900/40 rounded-xl w-fit">
              <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span>{activePersonaMeta.name} is processing query...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t border-neutral-800">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${activePersonaMeta.name}...`}
            className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-accent text-foreground px-4 py-3 rounded-xl text-sm outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-accent text-background font-mono text-xs uppercase tracking-widest rounded-xl hover:opacity-90 disabled:opacity-40 transition-all shadow-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
