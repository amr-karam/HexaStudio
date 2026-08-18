'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FusionCandidateUI {
  model: string;
  provider: string;
  content: string;
  score: number;
  rank: number;
  latencyMs: number;
  failure?: boolean;
  error?: string;
}

interface FusionResponseUI {
  fused: {
    content: string;
    model: string;
    provider: string;
    mode: 'best' | 'merge';
  };
  candidates: FusionCandidateUI[];
  winnerScore: number;
  telemetry: {
    totalCandidates: number;
    successfulCandidates: number;
    failedCandidates: number;
    totalLatencyMs: number;
    winnerLatencyMs: number;
  };
}

export function ModelFusionStudio() {
  const [query, setQuery] = useState('');
  const [models, setModels] = useState('gemma-4-12b-it-qat, gpt-4o-mini');
  const [mode, setMode] = useState<'best' | 'merge'>('best');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<FusionResponseUI | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  const runFusion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    setSelectedCandidate(null);

    try {
      const res = await fetch('/api/v1/ai/fusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a HEXA STUDIO architectural intelligence assistant.' },
            { role: 'user', content: query },
          ],
          models: models.split(',').map(m => m.trim()).filter(Boolean),
          mode,
          maxTokens: 1200,
        }),
      });

      if (!res.ok) throw new Error('Fusion request failed');
      const data = (await res.json()) as FusionResponseUI;
      setResponse(data);
      setSelectedCandidate(data.fused.model);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fusion failed');
    } finally {
      setLoading(false);
    }
  };

  const activeCandidate = response?.candidates.find(c => c.model === selectedCandidate);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-12 artisan-glass text-foreground border border-border/30 rounded-2xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[160px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="mb-8 pb-6 border-b border-border/20 relative z-10">
        <span className="text-[10px] uppercase tracking-[0.4em] text-accent font-mono">Model Fusion Engine</span>
        <h2 className="text-3xl md:text-4xl font-serif font-light tracking-tight mt-2 text-foreground">
          Multi-Model <span className="italic text-accent">Analysis Studio</span>
        </h2>
        <p className="text-sm text-text-secondary mt-2 max-w-2xl font-light leading-relaxed">
          Run multiple models side-by-side, analyze outputs, and fuse the best result.
        </p>
      </div>

      <form onSubmit={runFusion} className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        <div className="lg:col-span-4 space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">Query</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              className="w-full bg-obsidian border border-border/30 focus:border-accent/60 text-foreground p-4 rounded-xl text-sm outline-none resize-none transition-colors duration-300"
              placeholder="Enter an architectural analysis request..."
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">Models</label>
            <input
              type="text"
              value={models}
              onChange={(e) => setModels(e.target.value)}
              className="w-full bg-obsidian border border-border/30 focus:border-accent/60 text-foreground px-4 py-3 rounded-xl text-sm outline-none font-mono transition-colors duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'best' | 'merge')}
              className="w-full bg-obsidian border border-border/30 focus:border-accent/60 text-foreground px-4 py-3 rounded-xl text-sm outline-none font-mono transition-colors duration-300"
            >
              <option value="best">Best</option>
              <option value="merge">Merge</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-background font-mono text-xs uppercase tracking-[0.25em] font-medium rounded-xl hover:opacity-90 disabled:opacity-40 transition-all duration-300 shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Fusing Models...
              </>
            ) : (
              'Run Fusion'
            )}
          </button>
          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">{error}</div>}
        </div>

        <div className="lg:col-span-8 space-y-4">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-32 text-text-secondary gap-4">
                <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono uppercase tracking-[0.35em] text-accent">Running multi-model analysis...</p>
              </motion.div>
            )}

            {!loading && !response && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center py-32 text-text-muted">
                <p className="text-xs font-mono uppercase tracking-[0.3em]">Awaiting fusion request</p>
                <p className="text-xs text-text-muted/70 mt-2 font-light">Submit a query to compare model outputs.</p>
              </motion.div>
            )}

            {!loading && response && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-obsidian-raised rounded-xl border border-border/20">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest block mb-1">Mode</span>
                    <p className="text-xl font-mono text-foreground">{response.fused.mode}</p>
                  </div>
                  <div className="p-3 bg-obsidian-raised rounded-xl border border-border/20">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest block mb-1">Winner Score</span>
                    <p className="text-xl font-mono text-accent">{response.winnerScore}</p>
                  </div>
                  <div className="p-3 bg-obsidian-raised rounded-xl border border-border/20">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest block mb-1">Latency</span>
                    <p className="text-xl font-mono text-foreground">{response.telemetry.totalLatencyMs} ms</p>
                  </div>
                  <div className="p-3 bg-obsidian-raised rounded-xl border border-border/20">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest block mb-1">Candidates</span>
                    <p className="text-xl font-mono text-foreground">{response.telemetry.successfulCandidates}/{response.telemetry.totalCandidates}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {response.candidates.map((candidate) => (
                    <button
                      key={candidate.model}
                      type="button"
                      onClick={() => setSelectedCandidate(candidate.model)}
                      className={`text-left p-3 rounded-xl border transition-colors ${selectedCandidate === candidate.model ? 'border-accent bg-accent/10' : 'border-border/30 bg-obsidian-raised hover:border-accent/50'}`}
                    >
                      <span className="text-[11px] font-mono text-accent uppercase tracking-widest block mb-1">{candidate.model}</span>
                      <span className="text-[10px] font-mono text-text-muted block mb-2">{candidate.provider}</span>
                      <span className="text-[10px] font-mono text-text-secondary block">Score: {candidate.score}</span>
                      <span className="text-[10px] font-mono text-text-secondary block">Latency: {candidate.latencyMs} ms</span>
                      {candidate.failure && <span className="text-[10px] font-mono text-red-400 block">Failed</span>}
                    </button>
                  ))}
                </div>

                <div className="p-6 bg-obsidian/80 border border-border/30 rounded-2xl backdrop-blur-md">
                  <span className="text-[10px] font-mono text-accent uppercase tracking-[0.3em] block mb-2">{activeCandidate?.model ?? response.fused.model}</span>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap font-light">
                    {activeCandidate?.content ?? response.fused.content}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}
