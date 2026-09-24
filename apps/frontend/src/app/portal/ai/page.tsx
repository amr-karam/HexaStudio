import React from 'react';
import { MultimodalAnalyzer, ModelFusionStudio } from '@/features/ai';
import { ResearchHub } from '@/components/ai/ResearchHub';

export const metadata = {
  title: 'AI Multimodal Studio | HEXA Client Portal',
  description: 'Instant architectural analysis, 3D render QA, and BIM metadata extraction.',
};

export default function PortalAIPage() {
  return (
    <div className="space-y-8 h-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-light tracking-tight">AI Multimodal Studio</h1>
        <p className="text-sm text-sl-mist/60">
          Leverage Hermes Agent vision intelligence to audit architectural designs, 3D renders, and material textures.
        </p>
      </div>

      <div className="h-[600px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <ResearchHub />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MultimodalAnalyzer />
        <ModelFusionStudio />
      </div>
    </div>
  );
}
