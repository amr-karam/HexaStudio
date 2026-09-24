'use client';

import DesignCritic from '@/components/admin/design-critic/DesignCritic';
import PageBalanceAuditor from '@/components/admin/design-balance/PageBalanceAuditor';
import { useState } from 'react';

export default function DesignView() {
  const [activeTab, setActiveTab] = useState<'critic' | 'balance'>('critic');

  return (
    <main className="flex-1 p-8 overflow-hidden h-full">
      <div className="max-w-7xl mx-auto h-full flex flex-col gap-8">
        <header className="flex items-end justify-between border-b border-slate pb-6">
          <div className="flex items-center gap-12">
            <div>
              <p className="font-['JetBrains_Mono'] text-[10px] text-accent uppercase tracking-[0.3em] mb-2">
                Governance Module
              </p>
              <h1 className="font-['Bodoni_Moda'] text-4xl text-text-primary italic">
                Design Critic AI
              </h1>
            </div>

            <nav className="flex gap-1 bg-obsidian p-1 rounded-lg border border-slate">
              <button
                onClick={() => setActiveTab('critic')}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-md ${
                  activeTab === 'critic'
                    ? 'bg-accent text-void'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Component Audit
              </button>
              <button
                onClick={() => setActiveTab('balance')}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-md ${
                  activeTab === 'balance'
                    ? 'bg-accent text-void'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Color Balance
              </button>
            </nav>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted font-['JetBrains_Mono'] tracking-wider">
              Standard: DESIGN_SYSTEM.md v1.0.0
            </p>
            <p className="text-[10px] text-text-muted font-['JetBrains_Mono'] tracking-wider">
              Engine: Gemini 2.0 Flash (Multimodal)
            </p>
          </div>
        </header>

        <div className="flex-1 min-h-0">
          {activeTab === 'critic' ? <DesignCritic /> : <PageBalanceAuditor />}
        </div>
      </div>
    </main>
  );
}
