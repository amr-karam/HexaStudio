import React from 'react';
import { AgentStudio } from '@/features/agents';

export const metadata = {
  title: 'Multi-Agent Executive Studio | HEXA Client Portal',
  description: 'Consult specialized AI executive and engineering personas.',
};

export default function PortalAgentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-light tracking-tight">Executive Agent Studio</h1>
        <p className="text-sm text-neutral-400">
          Collaborate with specialized autonomous AI personas for strategy, sales, delivery, and code review.
        </p>
      </div>

      <AgentStudio />
    </div>
  );
}
