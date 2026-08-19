// ─── AgentSelector ─────────────────────────────────────────────────────────
// Dropdown to select which Hermes agent to use for a query.

'use client';

import { ChevronDown } from 'lucide-react';
import type { AgentPersona } from '../types/agent';

interface AgentSelectorProps {
  agents: AgentPersona[];
  selected: string | null;
  onSelect: (agentName: string | null) => void;
}

export function AgentSelector({ agents, selected, onSelect }: AgentSelectorProps) {
  return (
    <div className="relative inline-block">
      <select
        value={selected ?? ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="appearance-none bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:border-gold/50 focus:outline-none pr-8 transition-colors"
        style={{ minWidth: '160px' }}
      >
        <option value="">Auto-detect agent</option>
        {agents.map((agent) => (
          <option key={agent.name} value={agent.name}>
            {agent.icon} {agent.name.replace(/-/g, ' ')}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"
      />
    </div>
  );
}
