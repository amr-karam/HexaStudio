import React from 'react';
import { MultimodalAnalyzer } from '@/features/ai';

export const metadata = {
  title: 'AI Multimodal Studio | HEXA Client Portal',
  description: 'Instant architectural analysis, 3D render QA, and BIM metadata extraction.',
};

export default function PortalAIPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-light tracking-tight">AI Multimodal Studio</h1>
        <p className="text-sm text-neutral-400">
          Leverage Gemini 3.5 Flash vision intelligence to audit architectural designs, 3D renders, and material textures.
        </p>
      </div>

      <MultimodalAnalyzer />
    </div>
  );
}
