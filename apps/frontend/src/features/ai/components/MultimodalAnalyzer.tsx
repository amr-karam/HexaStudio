'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  analyzeArchitecture,
  analyze3DScene,
  analyzeMaterial,
  extractBIM,
} from '../api';
import {
  ArchitecturalAnalysis,
  Scene3DAnalysis,
  MaterialAnalysis,
  BIMExtraction,
} from '../types';

type AnalysisMode = 'architecture' | 'render' | 'material' | 'bim';

export function MultimodalAnalyzer() {
  const [mode, setMode] = useState<AnalysisMode>('architecture');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [archResult, setArchResult] = useState<ArchitecturalAnalysis | null>(null);
  const [renderResult, setRenderResult] = useState<Scene3DAnalysis | null>(null);
  const [materialResult, setMaterialResult] = useState<MaterialAnalysis | null>(null);
  const [bimResult, setBimResult] = useState<BIMExtraction | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const base64 = result.split(',')[1];
      setImageBase64(base64);
      setError(null);
      clearResults();
    };
    reader.readAsDataURL(file);
  };

  const clearResults = () => {
    setArchResult(null);
    setRenderResult(null);
    setMaterialResult(null);
    setBimResult(null);
  };

  const handleRunAnalysis = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);
    clearResults();

    try {
      if (mode === 'architecture') {
        const res = await analyzeArchitecture(imageBase64);
        setArchResult(res);
      } else if (mode === 'render') {
        const res = await analyze3DScene(imageBase64);
        setRenderResult(res);
      } else if (mode === 'material') {
        const res = await analyzeMaterial(imageBase64);
        setMaterialResult(res);
      } else if (mode === 'bim') {
        const res = await extractBIM(imageBase64);
        setBimResult(res);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-12 bg-background text-foreground border border-neutral-800 rounded-2xl shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-neutral-800 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-mono">Gemini 3.5 Flash Vision</span>
          <h2 className="text-3xl font-light tracking-tight mt-1">AI Multimodal Studio</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Instant architectural critique, 3D render quality audits, and BIM metadata extraction.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2 bg-neutral-900/80 p-1.5 rounded-xl border border-neutral-800">
          {(['architecture', 'render', 'material', 'bim'] as AnalysisMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); clearResults(); }}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-mono rounded-lg transition-all ${
                mode === m
                  ? 'bg-accent text-background font-medium shadow-lg'
                  : 'text-neutral-400 hover:text-foreground hover:bg-neutral-800'
              }`}
            >
              {m === 'render' ? '3D QA' : m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload & Preview Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="border-2 border-dashed border-neutral-800 hover:border-accent/50 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-neutral-950/50 min-h-[300px] relative overflow-hidden group">
            {imagePreview ? (
              <div className="relative w-full h-full min-h-[260px] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="max-h-[300px] object-contain rounded-xl shadow-md"
                />
                <button
                  onClick={() => { setImagePreview(null); setImageBase64(null); clearResults(); }}
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur text-foreground px-3 py-1 text-xs uppercase rounded-lg border border-neutral-700 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full py-12">
                <svg className="w-12 h-12 text-neutral-500 mb-4 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-neutral-300">Drop architectural render or floorplan</span>
                <span className="text-xs text-neutral-500 mt-1">PNG, JPG, WEBP up to 10MB</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          <button
            disabled={!imageBase64 || loading}
            onClick={handleRunAnalysis}
            className="w-full py-4 bg-accent text-background font-mono text-xs uppercase tracking-widest rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing via Gemini...
              </>
            ) : (
              `Run ${mode.toUpperCase()} Analysis`
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 bg-neutral-950/40 border border-neutral-800/80 rounded-2xl p-6 min-h-[400px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {!archResult && !renderResult && !materialResult && !bimResult && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-20 text-neutral-500"
              >
                <p className="text-sm font-mono uppercase tracking-wider">Awaiting input image and analysis trigger</p>
                <p className="text-xs text-neutral-600 mt-2">Select mode, upload architectural asset, and click run.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-20 text-neutral-400 gap-4"
              >
                <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono uppercase tracking-widest text-accent">Extracting visual intelligence...</p>
              </motion.div>
            )}

            {archResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-800">
                  <div>
                    <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Detected Style</span>
                    <h3 className="text-xl font-medium mt-0.5">{archResult.style}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Confidence</span>
                    <p className="text-lg font-mono text-accent">{(archResult.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-2">Key Materials</h4>
                  <div className="flex flex-wrap gap-2">
                    {archResult.materials.map((m, i) => (
                      <span key={i} className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/80">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Lighting Analysis</span>
                    <p className="text-sm text-neutral-200">{archResult.lighting}</p>
                  </div>
                  <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/80">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Spatial Composition</span>
                    <p className="text-sm text-neutral-200">{archResult.spatialComposition}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-2">Design Suggestions</h4>
                  <ul className="space-y-2">
                    {archResult.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                        <span className="text-accent font-mono">0{i + 1}.</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {renderResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="pb-4 border-b border-neutral-800">
                  <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Render Audit</span>
                  <h3 className="text-xl font-medium mt-0.5">3D Scene Quality & Realism</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/80">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Visual Quality</span>
                    <p className="text-sm text-neutral-200">{renderResult.visualQuality}</p>
                  </div>
                  <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/80">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Lighting Quality</span>
                    <p className="text-sm text-neutral-200">{renderResult.lightingQuality}</p>
                  </div>
                  <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/80">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Material Realism</span>
                    <p className="text-sm text-neutral-200">{renderResult.materialRealism}</p>
                  </div>
                  <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/80">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Composition</span>
                    <p className="text-sm text-neutral-200">{renderResult.composition}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-2">Improvement Suggestions</h4>
                  <ul className="space-y-2">
                    {renderResult.improvements.map((imp, i) => (
                      <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                        <span className="text-accent font-mono">•</span> {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {materialResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-800">
                  <div>
                    <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Material Type</span>
                    <h3 className="text-xl font-medium mt-0.5">{materialResult.materialType}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Sustainability</span>
                    <p className="text-lg font-mono text-accent">{(materialResult.sustainabilityScore * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-2">Color Palette</h4>
                  <div className="flex gap-2">
                    {materialResult.colorPalette.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono">
                        <span className="w-3 h-3 rounded-full border border-neutral-700" style={{ backgroundColor: c.startsWith('#') ? c : '#888' }} />
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Characteristics</span>
                  <p className="text-sm text-neutral-200">{materialResult.textureCharacteristics.join(', ')}</p>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-2">Suitable Applications</h4>
                  <ul className="space-y-1">
                    {materialResult.suitableApplications.map((app, i) => (
                      <li key={i} className="text-sm text-neutral-300">• {app}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {bimResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-800">
                  <div>
                    <span className="text-[10px] font-mono text-accent uppercase tracking-widest">BIM View Type</span>
                    <h3 className="text-xl font-medium mt-0.5">{bimResult.viewType}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Scale</span>
                    <p className="text-lg font-mono text-accent">{bimResult.scale || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-2">Detected Elements</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {bimResult.detectedElements.map((el, i) => (
                      <div key={i} className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                        <span className="text-xs font-medium text-foreground">{el.type}</span>
                        <div className="flex justify-between items-center mt-1 text-xs text-neutral-400 font-mono">
                          <span>Qty: {el.count}</span>
                          <span className="text-accent">{(el.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {bimResult.potentialIssues.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono text-red-400 uppercase tracking-widest mb-2">Potential Issues Detected</h4>
                    <ul className="space-y-1">
                      {bimResult.potentialIssues.map((issue, i) => (
                        <li key={i} className="text-sm text-red-300/90">• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
