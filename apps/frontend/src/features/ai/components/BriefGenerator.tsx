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
    <div className="w-full max-w-6xl mx-auto p-6 md:p-12 bg-background text-foreground border border-neutral-800 rounded-2xl shadow-2xl">
      <div className="mb-8 pb-6 border-b border-neutral-800">
        <span className="text-xs uppercase tracking-widest text-accent font-mono">Gemini Generative Architecture</span>
        <h2 className="text-3xl font-light tracking-tight mt-1">AI Architectural Brief Generator</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Define your project scope and let generative AI produce a professional architectural brief, spatial breakdown, and timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 flex flex-col gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Project Type</label>
              <input
                type="text"
                value={params.projectType}
                onChange={(e) => setParams({ ...params, projectType: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-accent text-foreground px-4 py-3 rounded-xl text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Square Footage (sq ft)</label>
              <input
                type="number"
                value={params.squareFootage}
                onChange={(e) => setParams({ ...params, squareFootage: Number(e.target.value) })}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-accent text-foreground px-4 py-3 rounded-xl text-sm outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Style Preference</label>
              <input
                type="text"
                value={params.stylePreference}
                onChange={(e) => setParams({ ...params, stylePreference: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-accent text-foreground px-4 py-3 rounded-xl text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Sustainability Goals</label>
              <textarea
                value={params.sustainabilityGoals}
                onChange={(e) => setParams({ ...params, sustainabilityGoals: e.target.value })}
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-accent text-foreground p-4 rounded-xl text-sm outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Budget Range</label>
              <input
                type="text"
                value={params.budgetRange}
                onChange={(e) => setParams({ ...params, budgetRange: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-accent text-foreground px-4 py-3 rounded-xl text-sm outline-none font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-background font-mono text-xs uppercase tracking-widest rounded-xl hover:opacity-90 disabled:opacity-40 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Generating Brief...
              </>
            ) : (
              'Generate Architectural Brief'
            )}
          </button>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}
        </form>

        {/* Output Column */}
        <div className="lg:col-span-7 bg-neutral-950/40 border border-neutral-800/80 rounded-2xl p-6 min-h-[500px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center py-32 text-neutral-500">
                <p className="text-sm font-mono uppercase tracking-wider">Awaiting scope parameters</p>
                <p className="text-xs text-neutral-600 mt-2">Fill out project requirements and click generate.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center py-32 text-neutral-400 gap-4">
                <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono uppercase tracking-widest text-accent">Synthesizing spatial intelligence...</p>
              </motion.div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-800">
                  <div>
                    <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Executive Summary</span>
                    <p className="text-sm text-neutral-200 mt-1 leading-relaxed">{result.executiveSummary}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Estimated Timeline</span>
                    <p className="text-xl font-mono text-foreground">{result.estimatedTimelineMonths} Months</p>
                  </div>
                  <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Sustainability Index</span>
                    <p className="text-xl font-mono text-accent">{(result.sustainabilityScoreEstimate * 100).toFixed(0)}% LEED Target</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-3">Spatial Program</h4>
                  <div className="space-y-2">
                    {result.spatialRequirements.map((req, i) => (
                      <div key={i} className="p-3 bg-neutral-900/40 border border-neutral-800/80 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-foreground">{req.space}</span>
                          <p className="text-xs text-neutral-400 mt-0.5">{req.notes}</p>
                        </div>
                        <span className="text-xs font-mono text-accent bg-accent/10 px-3 py-1 rounded-lg border border-accent/20">
                          {req.areaSqFt} sq ft
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-2">Recommended Materials</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.recommendedMaterials.map((mat, i) => (
                      <span key={i} className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300">
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
