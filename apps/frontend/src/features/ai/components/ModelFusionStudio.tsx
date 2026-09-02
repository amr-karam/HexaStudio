'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  runFusion,
  runFusionStream,
  FusionResponseUI,
  FusionStreamEvent,
  type FusionStreamStart,
  type FusionCandidateStreamEvent,
  type FusionCandidateMetaStreamEvent,
  type FusionCandidateDeltaStreamEvent,
  type FusionCandidateDoneStreamEvent,
  type FusionCandidateErrorStreamEvent,
  type FusionResultStreamEvent,
  type FusionErrorStreamEvent,
} from '@/features/ai/api';

interface CandidateState {
  model: string;
  provider: string;
  content: string;
  score: number;
  latencyMs: number;
  failure: boolean;
  error?: string;
  status: 'pending' | 'running' | 'done' | 'error';
  reasoningConfidence?: number;
  reasoningChain?: string[];
  rank?: number;
}

function isCandidateState(candidate: CandidateState | FusionResponseUI['candidates'][number]): candidate is CandidateState {
  return (candidate as CandidateState).status !== undefined;
}

export function ModelFusionStudio() {
  const [query, setQuery] = useState('');
  const [models, setModels] = useState('gemma-4-12b-it-qat, gpt-4o-mini');
  const [mode, setMode] = useState<'best' | 'merge'>('best');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<FusionResponseUI | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [streamEnabled, setStreamEnabled] = useState(true);
  const [candidates, setCandidates] = useState<CandidateState[]>([]);
  const [streamMeta, setStreamMeta] = useState<{ mode: 'best' | 'merge'; models: string[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    setSelectedCandidate(null);
    setCandidates([]);
    setStreamMeta(null);

    const parsedModels = models.split(',').map((m) => m.trim()).filter(Boolean);
    const payload = {
      messages: [
        { role: 'system', content: 'You are a HEXA STUDIO architectural intelligence assistant.' },
        { role: 'user', content: query },
      ],
      models: parsedModels,
      mode,
      maxTokens: 1200,
    };

    if (streamEnabled) {
      try {
        for await (const event of runFusionStream(payload)) {
          handleStreamEvent(event, parsedModels);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Fusion failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const data = await runFusion(payload);
      setResponse(data);
      setSelectedCandidate(data.fused.model);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fusion failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStreamEvent = (event: FusionStreamEvent, parsedModels: string[]) => {
    switch (event.type) {
      case 'meta': {
        const v = event as FusionStreamStart;
        setStreamMeta({ mode: v.payload.mode, models: v.payload.models });
        setCandidates(
          parsedModels.map((model) => ({
            model,
            provider: '',
            content: '',
            score: 0,
            latencyMs: 0,
            failure: false,
            status: 'pending' as const,
            reasoningConfidence: undefined,
            reasoningChain: [],
            rank: undefined,
          })),
        );
        break;
      }
      case 'candidate_start': {
        const v = event as FusionCandidateStreamEvent;
        setCandidates((prev) =>
          prev.map((c) => (c.model === v.payload.model ? { ...c, status: 'running' as const } : c)),
        );
        break;
      }
      case 'candidate_meta': {
        const v = event as FusionCandidateMetaStreamEvent;
        setCandidates((prev) =>
          prev.map((c) => (c.model === v.payload.model ? { ...c, provider: v.payload.provider } : c)),
        );
        break;
      }
      case 'candidate_delta': {
        const v = event as FusionCandidateDeltaStreamEvent;
        setCandidates((prev) =>
          prev.map((c) => (c.model === v.payload.model ? { ...c, content: c.content + v.payload.text } : c)),
        );
        break;
      }
      case 'candidate_done': {
        const v = event as FusionCandidateDoneStreamEvent;
        setCandidates((prev) =>
          prev.map((c) =>
            c.model === v.payload.model
              ? {
                  model: v.payload.model,
                  provider: v.payload.provider,
                  content: v.payload.content,
                  latencyMs: v.payload.latencyMs,
                  score: 0,
                  failure: false,
                  status: 'done' as const,
                  reasoningConfidence: undefined,
                  reasoningChain: [],
                  rank: undefined,
                }
              : c,
          ),
        );
        break;
      }
      case 'candidate_error': {
        const v = event as FusionCandidateErrorStreamEvent;
        setCandidates((prev) =>
          prev.map((c) =>
            c.model === v.payload.model
              ? { ...c, failure: true, error: v.payload.error ?? 'Failed', status: 'error' as const }
              : c,
          ),
        );
        break;
      }
      case 'result': {
        const v = event as FusionResultStreamEvent;
        setResponse({
          fused: v.payload.fused,
          candidates: [],
          winnerScore: v.payload.winnerScore,
          telemetry: v.payload.telemetry,
        });
        setSelectedCandidate(v.payload.fused.model);
        break;
      }
      case 'done': {
        break;
      }
      case 'error': {
        const v = event as FusionErrorStreamEvent;
        setError(v.payload.message ?? 'Fusion failed');
        break;
      }
    }
  };

  const activeCandidate = streamEnabled
    ? candidates.find((c) => c.model === selectedCandidate) ?? candidates[0]
    : response?.candidates.find((c) => c.model === selectedCandidate);

  const renderReasoningChain = (chain: string[] = []) => {
    if (!chain.length) return null;
    return (
      <div className="mt-2">
        <span className="text-[10px] font-mono text-hex-xs uppercase tracking-widest block mb-1">Reasoning Chain</span>
        <ul className="space-y-1">
          {chain.slice(0, 5).map((item, idx) => (
            <li key={idx} className="text-[11px] font-mono text-text-secondary">
              {idx + 1}. {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-12 artisan-glass text-sl-alabaster border border-sl-silver/20 rounded-2xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-sl-gold-subtle/5 blur-[160px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="mb-8 pb-6 border-b border-sl-silver/20 relative z-10">
        <span className="text-[10px] uppercase tracking-[0.4em] text-sl-gold-hover font-mono">Model Fusion Engine</span>
        <h2 className="text-3xl md:text-4xl font-serif font-light tracking-tight mt-2 text-sl-alabaster">
          Multi-Model <span className="italic text-sl-gold-hover">Analysis Studio</span>
        </h2>
        <p className="text-sm text-text-secondary mt-2 max-w-2xl font-light leading-relaxed">
          Run multiple models side-by-side, analyze outputs, and fuse the best result with reasoning-aware scoring.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        <div className="lg:col-span-4 space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">Query</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              className="w-full bg-obsidian border border-sl-silver/20 focus:border-sl-gold-subtle/60 text-sl-alabaster p-4 rounded-xl text-sm outline-none resize-none transition-colors duration-300"
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
              className="w-full bg-obsidian border border-sl-silver/20 focus:border-sl-gold-subtle/60 text-sl-alabaster px-4 py-3 rounded-xl text-sm outline-none font-mono transition-colors duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-2">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'best' | 'merge')}
              className="w-full bg-obsidian border border-sl-silver/20 focus:border-sl-gold-subtle/60 text-sl-alabaster px-4 py-3 rounded-xl text-sm outline-none font-mono transition-colors duration-300"
            >
              <option value="best">Best</option>
              <option value="merge">Merge</option>
            </select>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-sl-silver/20 bg-obsidian-raised px-4 py-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary">Live Stream</p>
              <p className="text-xs text-text-sl-mist/60 mt-1 font-light">Show candidate deltas as they arrive</p>
            </div>
            <button
              type="button"
              onClick={() => setStreamEnabled((value) => !value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors duration-200 ${streamEnabled ? 'bg-sl-gold-subtle text-background' : 'bg-obsidian text-text-secondary border border-sl-silver/20'}`}
            >
              {streamEnabled ? 'On' : 'Off'}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-sl-gold-subtle text-background font-mono text-xs uppercase tracking-[0.25em] font-medium rounded-xl hover:opacity-90 disabled:opacity-40 transition-all duration-300 shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                {streamEnabled ? 'Streaming Fusion...' : 'Fusing Models...'}
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
                <div className="w-10 h-10 border-2 border-sl-gold-subtle border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono uppercase tracking-[0.35em] text-sl-gold-hover">
                  {streamEnabled ? 'Streaming multi-model analysis...' : 'Running multi-model analysis...'}
                </p>
              </motion.div>
            )}

            {!loading && !response && candidates.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center py-32 text-text-sl-mist/60">
                <p className="text-xs font-mono uppercase tracking-[0.3em]">Awaiting fusion request</p>
                <p className="text-xs text-text-sl-mist/60/70 mt-2 font-light">Submit a query to compare model outputs.</p>
              </motion.div>
            )}

            {(streamEnabled ? candidates.length > 0 : !loading && !!response) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {streamEnabled && streamMeta && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-responsive="stack">
                    <div className="p-3 bg-obsidian-raised rounded-xl border border-sl-silver/20">
                      <span className="text-[10px] font-mono text-hex-xs uppercase tracking-widest block mb-1">Mode</span>
                      <p className="text-xl font-mono text-sl-alabaster">{streamMeta.mode}</p>
                    </div>
                    <div className="p-3 bg-obsidian-raised rounded-xl border border-sl-silver/20">
                      <span className="text-[10px] font-mono text-hex-xs uppercase tracking-widest block mb-1">Models</span>
                      <p className="text-xl font-mono text-sl-alabaster">{streamMeta.models.length}</p>
                    </div>
                  </div>
                )}

                {!streamEnabled && response && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-responsive="stack">
                    <div className="p-3 bg-obsidian-raised rounded-xl border border-sl-silver/20">
                      <span className="text-[10px] font-mono text-hex-xs uppercase tracking-widest block mb-1">Mode</span>
                      <p className="text-xl font-mono text-sl-alabaster">{response.fused.mode}</p>
                    </div>
                    <div className="p-3 bg-obsidian-raised rounded-xl border border-sl-silver/20">
                      <span className="text-[10px] font-mono text-hex-xs uppercase tracking-widest block mb-1">Winner Score</span>
                      <p className="text-xl font-mono text-sl-gold-hover">{response.winnerScore}</p>
                    </div>
                    <div className="p-3 bg-obsidian-raised rounded-xl border border-sl-silver/20">
                      <span className="text-[10px] font-mono text-hex-xs uppercase tracking-widest block mb-1">Latency</span>
                      <p className="text-xl font-mono text-sl-alabaster">{response.telemetry.totalLatencyMs} ms</p>
                    </div>
                    <div className="p-3 bg-obsidian-raised rounded-xl border border-sl-silver/20">
                      <span className="text-[10px] font-mono text-hex-xs uppercase tracking-widest block mb-1">Candidates</span>
                      <p className="text-xl font-mono text-sl-alabaster">{response.telemetry.successfulCandidates}/{response.telemetry.totalCandidates}</p>
                    </div>
                    <div className="p-3 bg-obsidian-raised rounded-xl border border-sl-silver/20">
                      <span className="text-[10px] font-mono text-hex-xs uppercase tracking-widest block mb-1">Avg Reasoning</span>
                      <p className="text-xl font-mono text-sl-alabaster">{response.telemetry.avgReasoningConfidence ?? '—'}</p>
                    </div>
                    <div className="p-3 bg-obsidian-raised rounded-xl border border-sl-silver/20">
                      <span className="text-[10px] font-mono text-hex-xs uppercase tracking-widest block mb-1">Winner Reasoning</span>
                      <p className="text-xl font-mono text-sl-gold-hover">{response.telemetry.winnerReasoningConfidence ?? '—'}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(streamEnabled ? candidates : response?.candidates ?? []).map((candidate) => (
                    <button
                      key={candidate.model}
                      type="button"
                      onClick={() => setSelectedCandidate(candidate.model)}
                      className={`text-left p-3 rounded-xl border transition-colors ${selectedCandidate === candidate.model ? 'border-sl-gold-subtle bg-sl-gold-subtle/10' : 'border-sl-silver/20 bg-obsidian-raised hover:border-sl-gold-subtle/50'}`}
                    >
                      <span className="text-[11px] font-mono text-hex-xs uppercase tracking-widest block mb-1">{candidate.model}</span>
                      <span className="text-[10px] font-mono text-text-sl-mist/60 block mb-2">{candidate.provider || '...'}</span>
                      <span className="text-[10px] font-mono text-text-secondary block">Score: {candidate.score}</span>
                      <span className="text-[10px] font-mono text-text-secondary block">Latency: {candidate.latencyMs} ms</span>
                      {streamEnabled && isCandidateState(candidate) && (
                        <span className="text-[10px] font-mono text-text-secondary block mt-1">Status: {candidate.status}</span>
                      )}
                      {candidate.failure && <span className="text-[10px] font-mono text-red-400 block">Failed</span>}
                      {streamEnabled && candidate.error && <span className="text-[10px] font-mono text-red-400 block">{candidate.error}</span>}
                    </button>
                  ))}
                </div>

                <div className="p-6 bg-obsidian/80 border border-sl-silver/20 rounded-2xl backdrop-blur-md">
                  <span className="text-[10px] font-mono text-sl-gold-hover uppercase tracking-[0.3em] block mb-2">
                    {streamEnabled ? (activeCandidate?.model ?? '...') : (activeCandidate?.model ?? response?.fused.model ?? '...')}
                  </span>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap font-light">
                    {streamEnabled ? (activeCandidate?.content ?? '') : (activeCandidate?.content ?? response?.fused.content ?? '')}
                  </p>
                  {!streamEnabled && response && (() => {
                    if (!activeCandidate) return null;
                    const candidate = isCandidateState(activeCandidate) ? activeCandidate : { ...activeCandidate } as CandidateState;
                    return (
                      <div className="mt-4 space-y-3">
                        <div className="flex gap-3">
                          <div className="p-3 bg-obsidian-raised rounded-xl border border-sl-silver/20 flex-1">
                            <span className="text-[10px] font-mono text-hex-xs uppercase tracking-widest block mb-1">Reasoning Confidence</span>
                            <p className="text-xl font-mono text-sl-gold-hover">{candidate.reasoningConfidence ?? '—'}</p>
                          </div>
                          <div className="p-3 bg-obsidian-raised rounded-xl border border-sl-silver/20 flex-1">
                            <span className="text-[10px] font-mono text-hex-xs uppercase tracking-widest block mb-1">Rank</span>
                            <p className="text-xl font-mono text-sl-alabaster">{candidate.rank ?? '—'}</p>
                          </div>
                        </div>
                        {renderReasoningChain(candidate.reasoningChain)}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}