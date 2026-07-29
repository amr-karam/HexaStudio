import React from 'react';
import { BriefGenerator } from '@/features/ai/components/BriefGenerator';

export const metadata = {
  title: 'AI Architectural Brief Generator | HEXA Studio',
  description: 'Generate professional architectural briefs and spatial programs using Gemini AI.',
};

export default function BriefGeneratorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <BriefGenerator />
      </div>
    </div>
  );
}
