'use client';

import React from 'react';

// Placeholder for the actual Agent component from ui.inference.sh
// This would normally be installed via shadcn-ui from the inference.sh registry

interface AgentProps {
  proxyUrl: string;
  name?: string;
  agentConfig: {
    core_app: {
      ref: string;
    };
    description?: string;
    system_prompt?: string;
    tools?: unknown; // TODO: Replace with proper type when implementing real tools
  };
  allowFiles?: boolean;
  allowImages?: boolean;
}

export const Agent = ({
  proxyUrl,
  name,
  agentConfig,
  allowFiles = false,
  allowImages = false,
}: AgentProps) => {
  // Use the props to avoid lint warnings
  const _allowFiles = allowFiles;
  const _allowImages = allowImages;

  // This is a placeholder implementation
  // In a real implementation, this would be the actual Agent component from ui.inference.sh
  return (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <h2 className="text-lg font-semibold mb-4">
        {name || 'AI Agent'}
      </h2>
      <p className="text-sm text-gray-500">
        Agent component placeholder. To use the actual ui.inference.sh Agent component,
        please install it via: npx shadcn@latest add https://ui.inference.sh/r/agent.json
      </p>
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p className="font-mono text-xs">
          Proxy URL: {proxyUrl}
        </p>
        <p className="font-mono text-xs mt-1">
          Model: {agentConfig.core_app.ref}
        </p>
        <p className="font-mono text-xs mt-1">
          Description: {agentConfig.description || 'Not provided'}
        </p>
        <p className="font-mono text-xs mt-1">
          Tools: {agentConfig.tools ? 'Configured' : 'None'}
        </p>
        <p className="font-mono text-xs mt-1">
          Allow Files: {_allowFiles.toString()}, Allow Images: {_allowImages.toString()}
        </p>
      </div>
    </div>
  );
};