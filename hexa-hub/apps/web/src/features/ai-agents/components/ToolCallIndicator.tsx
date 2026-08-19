// ─── ToolCallIndicator ─────────────────────────────────────────────────────
// Visual indicator showing when an agent is calling a tool.
// Shows active spinner when running, success state when complete.

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, CheckCircle } from 'lucide-react';

type ToolStatus = 'running' | 'complete' | 'error';

interface ToolCallIndicatorProps {
  toolName: string;
  agentName: string;
  isActive: boolean;
  status?: ToolStatus;
  result?: string;
}

export function ToolCallIndicator({ toolName, agentName, isActive, status = 'running', result }: ToolCallIndicatorProps) {
  const displayStatus: ToolStatus = !isActive
    ? status === 'error' ? 'error' : 'complete'
    : 'running';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 px-3 py-2 bg-border/50 rounded-lg text-xs"
    >
      <motion.div
        animate={displayStatus === 'running' ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
        transition={{ duration: 1.5, repeat: displayStatus === 'running' ? Infinity : 0 }}
      >
        {displayStatus === 'running' ? (
          <Wrench size={12} className="text-tertiary" />
        ) : displayStatus === 'complete' ? (
          <CheckCircle size={12} className="text-success" />
        ) : (
          <Wrench size={12} className="text-error" />
        )}
      </motion.div>
      <span className="text-tertiary">
        {(agentName || 'agent').replace(/-/g, ' ')}
      </span>
      <span className="text-secondary">→ calling</span>
      <span className="font-mono text-info">{toolName}</span>

      {displayStatus === 'complete' && result && (
        <motion.span
          initial={{ opacity: 0, maxWidth: 0 }}
          animate={{ opacity: 1, maxWidth: '200px' }}
          className="text-tertiary overflow-hidden text-ellipsis whitespace-nowrap"
          title={result}
        >
          • {result.length > 50 ? `${result.substring(0, 50)}...` : result}
        </motion.span>
      )}
    </motion.div>
  );
}
