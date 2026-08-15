'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BriefParams {
  projectType: string;
  squareFootage: number;
  stylePreference: string;
  sustainabilityGoals: string;
  budgetRange: string;
}

interface BriefResult {
  executiveSummary: string;
  spatialRequirements: Array<{ space: string; areaSqFt: number; notes: string }>;
  recommendedMaterials: string[];
  estimatedTimelineMonths: number;
  sustainabilityScoreEstimate: number;
}

export function BriefGenerator() {
  const [params, setParams] = useState<BriefParams>({
    projectType: 'Commercial Luxury Headquarters',
    squareFootage: 12000,
    stylePreference: 'Brutalist Minimalist',
    sustainabilityGoals: 'Net-zero carbon, LEED Platinum, passive solar shading',
    budgetRange: '$5M - $10M',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BriefResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/v1/ai/multimodal/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Failed to generate architectural brief');
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-12 artisan-glass text-foreground border border-border/30 rounded-2xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[160px] rounded-full pointer-events-none" aria-hidden="true" />

      <div className="mb-8 pb-6 border-b border-border/20 relative z-10">
        <span className="text-[10px] uppercase tracking-[0.4em] text-accent font-mono">Gemini Generative Architecture</span>
        <h2 className="text-3xl md:text-4xl font-serif font-light tracking-tight mt-2 text-foreground">
          AI Architectural <span className="italic text-accent">Brief Generator</span>
        </h2>
        <p className="text-sm text-text-secondary mt-2 max-w-2xl font-light leading-relaxed">
          Define your project scope and let generative intelligence synthesize an executive architectural brief, spatial program, and milestone forecast.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Form Column */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 flex flex-col gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">Project Type</label>
              <input
                type="text"
                value={params.projectType}
                onChange={(e) => setParams({ ...params, projectType: e.target.value })}
                className="w-full bg-obsidian border border-border/30 focus:border-accent/60 text-foreground px-4 py-3 rounded-xl text-sm outline-none transition-colors duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">Square Footage (sq ft)</label>
              <input
                type="number"
                value={params.squareFootage}
                onChange={(e) => setParams({ ...params, squareFootage: Number(e.target.value) })}
                className="w-full bg-obsidian border border-border/30 focus:border-accent/60 text-foreground px-4 py-3 rounded-xl text-sm outline-none font-mono transition-colors duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">Style Preference</label>
              <input
                type="text"
                value={params.stylePreference}
                onChange={(e) => setParams({ ...params, stylePreference: e.target.value })}
                className="w-full bg-obsidian border border-border/30 focus:border-accent/60 text-foreground px-4 py-3 rounded-xl text-sm outline-none transition-colors duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">Sustainability Goals</label>
              <textarea
                value={params.sustainabilityGoals}
                onChange={(e) => setParams({ ...params, sustainabilityGoals: e.target.value })}
                rows={3}
                className="w-full bg-obsidian border border-border/30 focus:border-accent/60 text-foreground p-4 rounded-xl text-sm outline-none resize-none transition-colors duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">Budget Range</label>
              <input
                type="text"
                value={params.budgetRange}
                onChange={(e) => setParams({ ...params, budgetRange: e.target.value })}
                className="w-full bg-obsidian border border-border/30 focus:border-accent/60 text-foreground px-4 py-3 rounded-xl text-sm outline-none font-mono transition-colors duration-300"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-background font-mono text-xs uppercase tracking-[0.25em] font-medium rounded-xl hover:opacity-90 disabled:opacity-40 transition-all duration-300 shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Synthesizing Brief...
              </>
            ) : (
              'Generate Architectural Brief'
            )}
          </button>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">{error}</div>}
        </form>

        {/* Output Column */}
        <div className="lg:col-span-7 bg-obsidian/60 border border-border/30 rounded-2xl p-6 md:p-8 min-h-[500px] flex flex-col justify-between backdrop-blur-md">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center py-32 text-text-muted">
                <p className="text-xs font-mono uppercase tracking-[0.3em]">Awaiting scope parameters</p>
                <p className="text-xs text-text-muted/70 mt-2 font-light">Fill out project requirements and trigger AI generation.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center py-32 text-text-secondary gap-4">
                <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono uppercase tracking-[0.35em] text-accent">Synthesizing spatial intelligence...</p>
              </motion.div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/20">
                  <div>
                    <span className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">Executive Summary</span>
                    <p className="text-sm text-text-secondary mt-2 leading-relaxed font-light">{result.executiveSummary}</p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const md = `# Architectural Brief: ${params.projectType}\n\n## Executive Summary\n${result.executiveSummary}\n\n## Scope & Parameters\n- Square Footage: ${params.squareFootage} sq ft\n- Style: ${params.stylePreference}\n- Sustainability: ${params.sustainabilityGoals}\n- Budget: ${params.budgetRange}\n- Timeline: ${result.estimatedTimelineMonths} Months\n- LEED Target: ${(result.sustainabilityScoreEstimate * 100).toFixed(0)}%\n\n## Spatial Program\n${result.spatialRequirements.map(s => `- **${s.space}** (${s.areaSqFt} sq ft): ${s.notes}`).join('\n')}\n\n## Recommended Materials\n${result.recommendedMaterials.map(m => `- ${m}`).join('\n')}\n`;
                        const blob = new Blob([md], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Architectural_Brief_${params.projectType.replace(/\s+/g, '_')}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-border/40 hover:border-accent/60 bg-obsidian-raised text-[11px] font-mono text-text-secondary hover:text-accent transition-colors"
                    >
                      Export .MD
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const jsonStr = JSON.stringify({ params, brief: result }, null, 2);
                        const blob = new Blob([jsonStr], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Architectural_Brief_${params.projectType.replace(/\s+/g, '_')}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-accent/40 bg-accent/10 text-[11px] font-mono text-accent hover:bg-accent/20 transition-colors"
                    >
                      Export JSON
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-obsidian-raised rounded-xl border border-border/20">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest block mb-1">Estimated Timeline</span>
                    <p className="text-xl font-mono text-foreground">{result.estimatedTimelineMonths} Months</p>
                  </div>
                  <div className="p-4 bg-obsidian-raised rounded-xl border border-border/20">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest block mb-1">Sustainability Index</span>
                    <p className="text-xl font-mono text-accent">{(result.sustainabilityScoreEstimate * 100).toFixed(0)}% LEED Target</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">Spatial Program</h4>
                  <div className="space-y-2">
                    {result.spatialRequirements.map((req, i) => (
                      <div key={i} className="p-3.5 bg-obsidian-raised/70 border border-border/20 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-foreground">{req.space}</span>
                          <p className="text-xs text-text-muted mt-0.5 font-light">{req.notes}</p>
                        </div>
                        <span className="text-xs font-mono text-accent bg-accent/10 px-3 py-1 rounded-lg border border-accent/20">
                          {req.areaSqFt} sq ft
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Recommended Materials</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.recommendedMaterials.map((mat, i) => (
                      <span key={i} className="px-3 py-1 bg-obsidian-raised border border-border/20 rounded-lg text-xs font-mono text-text-secondary">
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
