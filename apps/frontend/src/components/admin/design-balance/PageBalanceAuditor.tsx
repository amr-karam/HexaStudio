'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Target, AlertCircle, CheckCircle2, Upload, RefreshCw } from 'lucide-react';

interface BalanceResult {
  distribution: {
    void: number;
    obsidian: number;
    gold: number;
    other: number;
  };
  balanceScore: number;
  leaks: Array<{
    color: string;
    location: string;
    issue: string;
  }>;
  recommendation: string;
}

export default function PageBalanceAuditor() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<BalanceResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const runBalanceAudit = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const base64 = preview?.split(',')[1] || '';
      const response = await fetch('/api/audit/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: { data: base64, mimeType: image.type } 
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Balance audit failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between border-b border-slate pb-6">
        <div>
          <p className="font-['JetBrains_Mono'] text-[10px] text-accent uppercase tracking-[0.3em] mb-1">
            Architecture Check
          </p>
          <h2 className="font-['Bodoni_Moda'] text-3xl text-text-primary italic">
            60-30-10 Balance Auditor
          </h2>
        </div>
        <button
          onClick={runBalanceAudit}
          disabled={!image || isAnalyzing}
          className="px-6 py-2 bg-accent text-void text-[10px] font-bold uppercase tracking-wider hover:bg-accent-light disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {isAnalyzing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Target className="w-3 h-3" />}
          {isAnalyzing ? 'Calculating...' : 'Analyze Distribution'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Screenshot Upload */}
        <div className="flex flex-col gap-4">
          <div 
            className={`relative aspect-video rounded-lg border-2 border-dashed transition-all flex items-center justify-center overflow-hidden ${
              preview ? 'border-slate' : 'border-slate hover:border-accent/30 bg-obsidian/30'
            }`}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Viewport Preview" className="w-full h-full object-contain" />
            ) : (
              <label className="flex flex-col items-center gap-3 cursor-pointer group">
                <Upload className="w-8 h-8 text-text-muted group-hover:text-accent transition-colors" />
                <span className="text-xs text-text-muted font-['JetBrains_Mono'] tracking-wider uppercase">
                  Upload Full-Page Screenshot
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>
          <p className="text-text-muted text-[10px] font-['JetBrains_Mono'] tracking-wider text-center">
            Upload a high-resolution viewport capture for accurate color mapping
          </p>
        </div>

        {/* Analysis Results */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {!result && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 border border-slate rounded-lg flex flex-col items-center justify-center p-12 text-center bg-obsidian/20"
              >
                <PieChart className="w-12 h-12 text-text-muted mb-4 opacity-20" />
                <p className="text-text-secondary font-['Bodoni_Moda'] italic text-lg">
                  Awaiting visual data...
                </p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 border border-slate rounded-lg flex flex-col items-center justify-center p-12 bg-obsidian/50"
              >
                <div className="relative w-12 h-12 mb-4">
                  <motion.div 
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="absolute inset-0 border-2 border-accent/20 border-t-accent rounded-full" 
                  />
                </div>
                <p className="text-text-primary font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.3em] animate-pulse">
                  Mapping Color Distribution...
                </p>
              </motion.div>
            )}

            {result && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-6"
              >
                {/* Balance Score Card */}
                <div className="bg-obsidian border border-slate p-6 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.3em] text-text-muted mb-1">
                      Balance Score
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-['Bodoni_Moda'] ${result.balanceScore > 85 ? 'text-accent' : 'text-text-primary'}`}>
                        {result.balanceScore}
                      </span>
                      <span className="text-text-muted font-mono text-xs">/ 100</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${
                    result.balanceScore > 85 ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {result.balanceScore > 85 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {result.balanceScore > 85 ? 'Balanced' : 'Imbalanced'}
                  </div>
                </div>

                {/* Distribution Visualization */}
                <div className="bg-obsidian border border-slate p-6 rounded-lg">
                  <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.3em] text-text-muted mb-6">
                    Visual Distribution
                  </p>
                  <div className="flex h-4 w-full rounded-full overflow-hidden bg-void border border-slate mb-6">
                    <div style={{ width: `${result.distribution.void}%` }} className="bg-void h-full border-r border-white/5" title="Void" />
                    <div style={{ width: `${result.distribution.obsidian}%` }} className="bg-obsidian h-full border-r border-white/5" title="Obsidian" />
                    <div style={{ width: `${result.distribution.gold}%` }} className="bg-gold h-full" title="Gold" />
                    <div style={{ width: `${result.distribution.other}%` }} className="bg-slate-500 h-full" title="Other" />
                  </div>
                  <div className="grid grid-cols-2 gap-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <div className="w-2 h-2 rounded-full bg-void border border-white/20" />
                      <span className="text-text-muted">Void: {result.distribution.void}% (Target 60%)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <div className="w-2 h-2 rounded-full bg-obsidian border border-white/20" />
                      <span className="text-text-muted">Obsidian: {result.distribution.obsidian}% (Target 30%)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <div className="w-2 h-2 rounded-full bg-gold" />
                      <span className="text-text-muted">Gold: {result.distribution.gold}% (Target 10%)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <span className="text-text-muted">Leaks: {result.distribution.other}% (Target 0%)</span>
                    </div>
                  </div>
                </div>

                {/* Leaks & Recommendations */}
                <div className="flex flex-col gap-4">
                  <div className="bg-obsidian border border-slate p-6 rounded-lg">
                    <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.3em] text-text-muted mb-3">
                      Detected Color Leaks
                    </p>
                    <div className="flex flex-col gap-3">
                      {result.leaks.length > 0 ? result.leaks.map((leak, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs">
                          <AlertCircle className="w-3 h-3 mt-0.5 text-red-500 shrink-0" />
                          <p className="text-text-secondary">
                            <span className="text-text-primary font-bold">{leak.color}</span> at {leak.location}: {leak.issue}
                          </p>
                        </div>
                      )) : (
                        <p className="text-xs text-green-500 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" /> No significant color leaks detected.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="bg-obsidian border border-slate p-6 rounded-lg">
                    <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.3em] text-text-muted mb-3">
                      Correction Strategy
                    </p>
                    <p className="text-text-secondary font-['Bodoni_Moda'] italic text-md leading-relaxed">
                      "{result.recommendation}"
                    </p>
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
