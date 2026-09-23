'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, XCircle, Sparkles, Code2, ImageIcon, ArrowRight, Copy, Zap } from 'lucide-react';

interface Violation {
  token: string;
  issue: string;
  severity: 'critical' | 'warning';
  correction: string;
}

interface AuditResult {
  luxuryScore: number;
  violations: Violation[];
  editorialAssessment: string;
  isApproved: boolean;
  luxuryTrend?: 'improving' | 'declining' | 'stable';
  previousScore?: number;
  suggestedRefactor?: string;
}

export default function DesignCritic() {
  const [tsx, setTsx] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [showRefactor, setShowRefactor] = useState(false);

  const handleAudit = async () => {
    setIsAnalyzing(true);
    setShowRefactor(false);
    try {
      const response = await fetch('/api/audit/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tsx, context: 'UI Component' }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Input Panel */}
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.3em] text-accent">
              Design Critic AI
            </span>
          </div>
          <button
            onClick={handleAudit}
            disabled={isAnalyzing || !tsx}
            className="px-4 py-1.5 bg-accent text-void text-[10px] font-bold uppercase tracking-wider hover:bg-accent-light disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isAnalyzing ? 'Analyzing...' : 'Run Luxury Audit'}
            {!isAnalyzing && <ArrowRight className="w-3 h-3" />}
          </button>
        </div>

        <div className="relative flex-1 group">
          <div className="absolute -inset-px bg-gradient-to-b from-accent/20 to-transparent rounded-lg pointer-events-none group-focus-within:from-accent/40 transition-all" />
          <textarea
            value={tsx}
            onChange={(e) => setTsx(e.target.value)}
            placeholder="Paste TSX code here to purge design slop..."
            className="w-full h-full bg-obsidian border border-slate p-6 font-mono text-xs text-text-secondary leading-relaxed focus:outline-none focus:border-accent transition-colors rounded-lg resize-none"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-text-muted font-mono text-[9px]">
            <Code2 className="w-3 h-3" />
            <span>TSX Input</span>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="flex flex-col gap-6 h-full">
        <AnimatePresence mode="wait">
          {!result && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 border border-dashed border-slate rounded-lg flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-void border border-slate flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-text-muted" />
              </div>
              <p className="text-text-secondary font-['Bodoni_Moda'] italic text-lg">
                Awaiting submission for luxury validation
              </p>
              <p className="text-text-muted text-xs font-['JetBrains_Mono'] mt-2 tracking-wide">
                Input TSX to evaluate against DESIGN_SYSTEM.md
              </p>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 border border-slate rounded-lg flex flex-col items-center justify-center p-12 bg-obsidian/50"
            >
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-2 border-accent/20 rounded-full" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="absolute inset-0 border-t-2 border-accent rounded-full"
                />
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-accent animate-pulse" />
              </div>
              <p className="text-text-primary font-['JetBrains_Mono'] text-xs uppercase tracking-[0.3em] animate-pulse">
                Purging Design Slop...
              </p>
            </motion.div>
          )}

          {result && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2"
            >
              {/* Score Card */}
              <div className="bg-obsidian border border-slate p-6 rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.3em] text-text-muted mb-1">
                    Luxury Score
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-['Bodoni_Moda'] ${result.luxuryScore > 90 ? 'text-accent' : 'text-text-primary'}`}>
                      {result.luxuryScore}
                    </span>
                    <span className="text-text-muted font-mono text-xs">/ 100</span>
                    
                    {result.luxuryTrend && (
                      <div className="ml-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-void border border-slate">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          result.luxuryTrend === 'improving' ? 'bg-green-500' : 
                          result.luxuryTrend === 'declining' ? 'bg-red-500' : 'bg-slate-400'
                        }`} />
                        <span className="text-[9px] font-mono uppercase tracking-wider text-text-muted">
                          {result.luxuryTrend}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${
                  result.isApproved ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {result.isApproved ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {result.isApproved ? 'Approved' : 'Rejected'}
                </div>
              </div>

              {/* Critique */}
              <div className="bg-obsidian border border-slate p-6 rounded-lg">
                <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.3em] text-text-muted mb-3">
                  Editorial Assessment
                </p>
                <p className="text-text-secondary font-['Bodoni_Moda'] italic text-md leading-relaxed">
                  "{result.editorialAssessment}"
                </p>
              </div>

              {/* Violations */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.3em] text-text-muted">
                    Audit Violations ({result.violations.length})
                  </p>
                  {result.suggestedRefactor && (
                    <button 
                      onClick={() => setShowRefactor(!showRefactor)}
                      className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1 hover:underline"
                    >
                      <Zap className="w-3 h-3" />
                      {showRefactor ? 'Hide Refactor' : 'View Luxury Refactor'}
                    </button>
                  )}
                </div>
                {result.violations.map((v, i) => (
                  <div key={i} className="bg-obsidian border border-slate p-4 rounded-lg flex gap-4 group hover:border-accent/30 transition-colors">
                    <div className={`mt-1 ${v.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>
                      {v.severity === 'critical' ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[11px] text-accent font-bold">{v.token}</span>
                        <span className={`text-[9px] uppercase font-bold ${v.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>
                          {v.severity}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mb-3">{v.issue}</p>
                      <div className="bg-void border border-slate p-3 rounded font-mono text-[10px] text-text-muted">
                        <span className="text-accent mr-2">FIX:</span>
                        {v.correction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Refactor View */}
              <AnimatePresence>
                {showRefactor && result.suggestedRefactor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-obsidian border-2 border-accent/30 rounded-lg overflow-hidden"
                  >
                    <div className="bg-accent/10 px-4 py-2 border-b border-accent/20 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Luxury Refactored Code
                      </span>
                      <button 
                        onClick={() => copyToClipboard(result.suggestedRefactor!)}
                        className="p-1 hover:bg-accent/20 rounded transition-colors text-accent"
                        title="Copy Refactored Code"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="p-0 bg-void">
                      <pre className="p-6 font-mono text-[11px] text-text-secondary leading-relaxed overflow-x-auto">
                        <code>{result.suggestedRefactor}</code>
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
