'use client';

import { Agent } from "@/registry/blocks/agent/agent";

export default function AIPage() {
  return (
    <Agent
      proxyUrl="/api/inference/proxy"
      agentConfig={{
        core_app: { ref: 'openrouter/claude-haiku-45@0fkg6xwb' },
        description: 'HEXA STUDIO AI Assistant',
        system_prompt: 'You are a helpful AI assistant for HEXA STUDIO, specialized in architectural design, 3D modeling, and project management.',
      }}
    />
  );
}