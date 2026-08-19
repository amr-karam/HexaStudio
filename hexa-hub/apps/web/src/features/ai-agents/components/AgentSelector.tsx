// ─── AgentSelector ─────────────────────────────────────────────────────────
// Beautiful custom dropdown for selecting which Hermes agent to use.
// Shows agent icon, name, description, and color accent.

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';
import type { AgentPersona } from '../types/agent';

interface AgentSelectorProps {
  agents: AgentPersona[];
  selected: string | null;
  onSelect: (agentName: string | null) => void;
}

const AGENT_LABELS: Record<string, string> = {
  'erp-analyst': 'ERP Analyst',
  'project-assistant': 'Project Assistant',
  'sales-agent': 'Sales Agent',
  'knowledge-agent': 'Knowledge Agent',
};

export function AgentSelector({ agents, selected, onSelect }: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedAgent = selected ? agents.find(a => a.name === selected) : null;
  const displayLabel = selectedAgent ? AGENT_LABELS[selectedAgent.name] || selectedAgent.name.replace(/-/g, ' ') : 'Auto-detect agent';

  const filteredAgents = searchQuery.trim()
    ? agents.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : agents;

  return (
    <div className="relative inline-block" ref={containerRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:border-gold/50 focus:outline-none transition-colors min-w-[160px]"
      >
        {selectedAgent ? (
          <>
            <span className="text-sm">{selectedAgent.icon}</span>
            <span>{displayLabel}</span>
          </>
        ) : (
          <>
            <span className="text-sm">🤖</span>
            <span>{displayLabel}</span>
          </>
        )}
        <ChevronDown size={14} className="ml-auto text-tertiary" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-1 z-50 w-64 bg-surface border border-border rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] overflow-hidden"
          >
            {/* Search */}
            <div className="relative p-2 border-b border-border">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-void-deep border border-border rounded-lg px-8 py-1.5 text-xs text-foreground placeholder:text-tertiary focus:outline-none focus:border-gold/50"
                autoFocus
              />
            </div>

            {/* Auto-detect option */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
                setSearchQuery('');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-sm">🤖</span>
              <div className="flex flex-col flex-1">
                <span className="text-foreground">Auto-detect agent</span>
                <span className="text-xs text-tertiary">Let the system choose based on your query</span>
              </div>
              {selected === null && <Check size={14} className="ml-auto text-gold" />}
            </motion.button>

            {/* Agent list */}
            {filteredAgents.length > 0 ? (
              filteredAgents.map((agent) => {
                const label = AGENT_LABELS[agent.name] || agent.name.replace(/-/g, ' ');
                return (
                  <motion.button
                    key={agent.name}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                    onClick={() => {
                      onSelect(agent.name);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `${agent.color}20`,
                        color: agent.color,
                        border: `1px solid ${agent.color}40`,
                      }}
                    >
                      <span className="text-xs leading-none">{agent.icon}</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-foreground">{label}</span>
                      <span className="text-xs text-tertiary">{agent.description}</span>
                    </div>
                    {selected === agent.name && <Check size={14} className="ml-auto text-gold" />}
                  </motion.button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-tertiary">No agents found</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
