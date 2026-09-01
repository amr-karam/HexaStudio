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

const PRESET_PROGRAMS: Array<{ label: string; params: BriefParams }> = [
  {
    label: 'Luxury HQ',
    params: {
      projectType: 'Commercial Luxury Headquarters',
      squareFootage: 15000,
      stylePreference: 'Brutalist Minimalist & Bronze Accents',
      sustainabilityGoals: 'Net-zero carbon, LEED Platinum, passive solar thermal mass',
      budgetRange: '$8M - $12M',
    },
  },
  {
    label: 'Atelier Villa',
    params: {
      projectType: 'Private Seaside Residential Villa',
      squareFootage: 8500,
      stylePreference: 'Warm Organic Modernism & Travertine Stone',
      sustainabilityGoals: 'Rainwater harvesting, geothermal HVAC, natural ventilation',
      budgetRange: '$4M - $7M',
    },
  },
  {
    label: 'Cultural Pavilion',
    params: {
      projectType: 'Contemporary Art & Museum Pavilion',
      squareFootage: 22000,
      stylePreference: 'Parametric Fluid Canopy & Exposed Concrete',
      sustainabilityGoals: 'Low-embodied carbon timber, daylight harvesting, BREEAM Outstanding',
      budgetRange: '$15M - $25M',
    },
  },
];

export function BriefGenerator() {
  const [params, setParams] = useState<BriefParams>(PRESET_PROGRAMS[0].params);
  const [copied, setCopied] = useState(false);
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

  const handleCopyMarkdown = () => {
    if (!result) return;
    const md = `# Architectural Brief: ${params.projectType}\n\n## Executive Summary\n${result.executiveSummary}\n\n## Scope & Parameters\n- Square Footage: ${params.squareFootage.toLocaleString()} sq ft\n- Style: ${params.stylePreference}\n- Sustainability: ${params.sustainabilityGoals}\n- Budget: ${params.budgetRange}\n- Timeline: ${result.estimatedTimelineMonths} Months\n- LEED Target: ${(result.sustainabilityScoreEstimate * 100).toFixed(0)}%\n\n## Spatial Program\n${result.spatialRequirements.map(s => `- **${s.space}** (${s.areaSqFt.toLocaleString()} sq ft): ${s.notes}`).join('\n')}\n\n## Recommended Materials\n${result.recommendedMaterials.map(m => `- ${m}`).join('\n')}\n`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-12 bg-obsidian/85 backdrop-blur-2xl text-sl-alabaster border border-white/10 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.8),0_0_40px_rgba(212,175,55,0.08)] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-sl-gold-subtle/5 blur-[180px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sl-gold-subtle/3 blur-[140px] rounded-full pointer-events-none" aria-hidden="true" />

      {/* Header */}
      <div className="mb-8 pb-6 border-b border-sl-silver/20 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rotate-45 bg-sl-gold-subtle" aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-sl-gold-hover font-mono">
                Hermes Spatial Intelligence
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-sl-alabaster">
              AI Architectural <span className="italic text-sl-gold-hover">Brief Generator</span>
            </h2>
          </div>

          {/* Preset Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-text-sl-mist/60 uppercase tracking-widest mr-1">Presets:</span>
            {PRESET_PROGRAMS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setParams(preset.params)}
                className="px-3 py-1.5 rounded-full border border-white/10 hover:border-sl-gold-subtle/40 bg-white/[0.02] hover:bg-sl-gold-subtle/10 text-xs font-mono text-text-secondary hover:text-sl-gold-hover transition-all duration-300"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-text-secondary mt-3 max-w-3xl font-light leading-relaxed">
          Define spatial scope parameters and synthesize an executive architectural brief, spatial program schedule, and LEED sustainability forecast.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Form Column */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 flex flex-col gap-5">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">
                Project Type
              </label>
              <input
                type="text"
                value={params.projectType}
                onChange={(e) => setParams({ ...params, projectType: e.target.value })}
                className="w-full bg-obsidian-raised border border-white/10 focus:border-sl-gold-subtle focus:ring-1 focus:ring-sl-gold-subtle text-sl-alabaster px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">
                Square Footage (sq ft)
              </label>
              <input
                type="number"
                value={params.squareFootage}
                onChange={(e) => setParams({ ...params, squareFootage: Number(e.target.value) })}
                className="w-full bg-obsidian-raised border border-white/10 focus:border-sl-gold-subtle focus:ring-1 focus:ring-sl-gold-subtle text-sl-alabaster px-4 py-3 rounded-xl text-sm outline-none font-mono transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">
                Style Preference
              </label>
              <input
                type="text"
                value={params.stylePreference}
                onChange={(e) => setParams({ ...params, stylePreference: e.target.value })}
                className="w-full bg-obsidian-raised border border-white/10 focus:border-sl-gold-subtle focus:ring-1 focus:ring-sl-gold-subtle text-sl-alabaster px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">
                Sustainability Goals
              </label>
              <textarea
                value={params.sustainabilityGoals}
                onChange={(e) => setParams({ ...params, sustainabilityGoals: e.target.value })}
                rows={3}
                className="w-full bg-obsidian-raised border border-white/10 focus:border-sl-gold-subtle focus:ring-1 focus:ring-sl-gold-subtle text-sl-alabaster p-4 rounded-xl text-sm outline-none resize-none transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">
                Budget Range
              </label>
              <input
                type="text"
                value={params.budgetRange}
                onChange={(e) => setParams({ ...params, budgetRange: e.target.value })}
                className="w-full bg-obsidian-raised border border-white/10 focus:border-sl-gold-subtle focus:ring-1 focus:ring-sl-gold-subtle text-sl-alabaster px-4 py-3 rounded-xl text-sm outline-none font-mono transition-all duration-300"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-sl-gold-subtle text-background font-mono text-xs uppercase tracking-[0.25em] font-semibold rounded-xl hover:bg-sl-gold-subtle-light disabled:opacity-40 transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.25)] flex items-center justify-center gap-3 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Synthesizing Brief...
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rotate-45 bg-sl-void" aria-hidden="true" />
                Generate Architectural Brief
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">
              {error}
            </div>
          )}
        </form>

        {/* Output Column */}
        <div className="lg:col-span-7 bg-obsidian/90 border border-white/10 rounded-2xl p-6 md:p-8 min-h-[520px] flex flex-col justify-between backdrop-blur-xl shadow-inner">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-32 text-text-sl-mist/60"
              >
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 text-sl-gold-hover/50">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-xs font-mono uppercase tracking-[0.3em]">Awaiting scope parameters</p>
                <p className="text-xs text-text-sl-mist/60/70 mt-2 font-light max-w-sm">
                  Select a preset program or input custom parameters and trigger generation.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-32 text-text-secondary gap-4"
              >
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-sl-gold-subtle/20 rounded-full" />
                  <div className="w-12 h-12 border-2 border-sl-gold-subtle border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-xs font-mono uppercase tracking-[0.35em] text-sl-gold-hover">
                  Synthesizing spatial intelligence...
                </p>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sl-silver/20">
                  <div>
                    <span className="text-[10px] font-mono text-sl-gold-hover uppercase tracking-[0.3em]">
                      Executive Summary
                    </span>
                    <p className="text-sm text-text-secondary mt-2 leading-relaxed font-light">
                      {result.executiveSummary}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyMarkdown}
                      className="px-3 py-1.5 rounded-lg border border-sl-silver/20/40 hover:border-sl-gold-subtle/60 bg-obsidian-raised text-[11px] font-mono text-text-secondary hover:text-sl-gold-hover transition-all duration-200"
                    >
                      {copied ? '✓ Copied' : 'Copy MD'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const md = `# Architectural Brief: ${params.projectType}\n\n## Executive Summary\n${result.executiveSummary}\n\n## Scope & Parameters\n- Square Footage: ${params.squareFootage.toLocaleString()} sq ft\n- Style: ${params.stylePreference}\n- Sustainability: ${params.sustainabilityGoals}\n- Budget: ${params.budgetRange}\n- Timeline: ${result.estimatedTimelineMonths} Months\n- LEED Target: ${(result.sustainabilityScoreEstimate * 100).toFixed(0)}%\n\n## Spatial Program\n${result.spatialRequirements.map(s => `- **${s.space}** (${s.areaSqFt.toLocaleString()} sq ft): ${s.notes}`).join('\n')}\n\n## Recommended Materials\n${result.recommendedMaterials.map(m => `- ${m}`).join('\n')}\n`;
                        const blob = new Blob([md], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Architectural_Brief_${params.projectType.replace(/\s+/g, '_')}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-sl-silver/20/40 hover:border-sl-gold-subtle/60 bg-obsidian-raised text-[11px] font-mono text-text-secondary hover:text-sl-gold-hover transition-all duration-200"
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
                      className="px-3 py-1.5 rounded-lg border border-sl-gold-subtle/40 bg-sl-gold-subtle/10 text-[11px] font-mono text-sl-gold-hover hover:bg-sl-gold-subtle/20 transition-all duration-200"
                    >
                      Export JSON
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-obsidian-raised rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-text-sl-mist/60 uppercase tracking-widest block mb-1">
                      Estimated Timeline
                    </span>
                    <p className="text-xl font-mono text-sl-alabaster font-light">
                      {result.estimatedTimelineMonths} Months
                    </p>
                  </div>
                  <div className="p-4 bg-obsidian-raised rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-text-sl-mist/60 uppercase tracking-widest block mb-1">
                      Sustainability Index
                    </span>
                    <p className="text-xl font-mono text-sl-gold-hover font-light">
                      {(result.sustainabilityScoreEstimate * 100).toFixed(0)}% LEED Target
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-text-sl-mist/60 uppercase tracking-widest mb-3">
                    Spatial Program Schedule
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {result.spatialRequirements.map((req, i) => (
                      <div
                        key={i}
                        className="p-3.5 bg-obsidian-raised/80 border border-white/5 rounded-xl flex justify-between items-center hover:border-sl-gold-subtle/20 transition-colors duration-200"
                      >
                        <div>
                          <span className="text-sm font-medium text-sl-alabaster">{req.space}</span>
                          <p className="text-xs text-text-sl-mist/60 mt-0.5 font-light">{req.notes}</p>
                        </div>
                        <span className="text-xs font-mono text-sl-gold-hover bg-sl-gold-subtle/10 px-3 py-1 rounded-lg border border-sl-gold-subtle/20">
                          {req.areaSqFt.toLocaleString()} sq ft
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-text-sl-mist/60 uppercase tracking-widest mb-2">
                    Recommended Materials Palette
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.recommendedMaterials.map((mat, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-obsidian-raised border border-white/10 rounded-lg text-xs font-mono text-text-secondary"
                      >
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

