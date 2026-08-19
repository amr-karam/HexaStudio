// ─── ToolCallIndicator ─────────────────────────────────────────────────────
// Visual indicator showing when an agent is calling a tool.

'use client';

import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';

interface ToolCallIndicatorProps {
  toolName: string;
  agentName: string;
  isActive: boolean;
}

export function ToolCallIndicator({ toolName, agentName, isActive }: ToolCallIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 px-3 py-2 bg-border/50 rounded-lg text-xs"
    >
      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Wrench size={12} className="text-tertiary" />
      </motion.div>
      <span className="text-tertiary">
        {agentName.replace(/-/g, ' ')}
      </span>
      <span className="text-secondary">→ calling</span>
      <span className="font-mono text-info">{toolName}</span>
      {isActive && (
        <motion.span
          className="w-1 h-3 bg-info rounded"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
