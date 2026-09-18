'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Zap, CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResearchStep {
  id: string;
  type: 'thought' | 'research' | 'audit' | 'pdf';
  content: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'error';
}

interface ResearchResult {
  query: string;
  synthesis: string;
  audit: string;
  auditOk: boolean;
  toolCalls: number;
  sessionId: string;
}

type AgentCallResult =
  | { ok: true; response: string; toolCalls: number }
  | { ok: false; status?: number; error: string };

const buildResearchPrompt = (brief: string): string =>
  `Research brief: "${brief}".
Scan high-authority architectural and material sources, extract the technical specs that matter,
and synthesize the findings into an "Absolute Zero" luxury design narrative.
Save the key findings as durable facts for this session.`;

const buildAuditPrompt = (synthesis: string): string =>
  `Audit the following research synthesis against the Absolute Zero luxury standards
(Void Black #050505, Obsidian #0F0F10, Signature Gold #D4AF37, Cormorant Garamond headlines, Jost body).
Report any deviations from the standard and a final compliance verdict.

SYNTHESIS:
${synthesis.slice(0, 6000)}`;

const excerpt = (text: string): string => {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > 180 ? `${clean.slice(0, 180)}...` : clean;
};

const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (ch) => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[ch] ?? ch));

const buildBrandedReportHtml = (result: ResearchResult): string => {
  const issued = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>HEXA Research Intelligence — ${escapeHtml(result.query)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Jost:wght@200..500&display=swap" rel="stylesheet">
<style>
  :root { color-scheme: light; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Jost', sans-serif; color: #1a1a1a; background: #ffffff; padding: 56px 64px; }
  .brand { font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #b08d2f; }
  h1 { font-family: 'Cormorant Garamond', serif; font-weight: 500; font-size: 34px; line-height: 1.15; margin-top: 10px; }
  .meta { font-size: 12px; color: #6b6b6b; margin-top: 6px; }
  .rule { height: 2px; background: #d4af37; width: 64px; margin: 24px 0 28px; }
  h2 { font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 20px; margin: 32px 0 12px; }
  .section { white-space: pre-wrap; font-size: 13.5px; line-height: 1.75; color: #333333; }
  .audit { border-left: 2px solid #d4af37; padding-left: 16px; white-space: pre-wrap; font-size: 13px; line-height: 1.7; color: #444444; }
  footer { margin-top: 48px; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #9a9a9a; border-top: 1px solid #e5e5e5; padding-top: 16px; display: flex; justify-content: space-between; }
  @media print { body { padding: 32px 40px; } }
</style>
</head>
<body>
  <div class="brand">HEXA Studio — Research Intelligence</div>
  <h1>${escapeHtml(result.query)}</h1>
  <p class="meta">Session ${escapeHtml(result.sessionId)} · ${result.toolCalls} tool executions · ${issued}</p>
  <div class="rule"></div>
  <h2>Research Synthesis</h2>
  <div class="section">${escapeHtml(result.synthesis)}</div>
  <h2>Absolute Zero Compliance Audit</h2>
  <div class="audit">${escapeHtml(result.audit)}</div>
  <footer><span>Absolute Zero Standard</span><span>hexastudio.net</span></footer>
</body>
</html>`;
};

export const ResearchHub = () => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<ResearchStep[]>([]);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const sessionIdRef = useRef<string>(`research-${Date.now()}`);

  const addStep = (step: Omit<ResearchStep, 'timestamp'>) =>
    setSteps((prev) => [...prev, { ...step, timestamp: new Date() }]);

  const settleStep = (id: string, status: 'completed' | 'error', content: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status, content } : s)));

  const postAgent = async (
    persona: 'researcher' | 'director',
    message: string,
  ): Promise<AgentCallResult> => {
    try {
      const resp = await fetch(`/api/v1/agents/${persona}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId: sessionIdRef.current }),
      });
      if (!resp.ok) {
        const detail = (await resp.json().catch(() => null)) as { error?: string } | null;
        return { ok: false, status: resp.status, error: detail?.error ?? 'Upstream request failed.' };
      }
      const data = (await resp.json()) as { response?: string; toolCalls?: number };
      return { ok: true, response: data.response ?? '', toolCalls: data.toolCalls ?? 0 };
    } catch {
      return { ok: false, error: 'Network error — the research agent is unreachable.' };
    }
  };

  const startResearch = async () => {
    const brief = query.trim();
    if (!brief || isProcessing) return;
    setIsProcessing(true);
    setSteps([]);
    setResult(null);

    addStep({
      id: 'step-thought',
      type: 'thought',
      content: `Analyzing request: "${brief}". Initiating discovery phase.`,
      status: 'pending',
    });
    await new Promise((resolve) => setTimeout(resolve, 600));
    settleStep('step-thought', 'completed', `Request parsed — dispatching high-authority research.`);

    addStep({
      id: 'step-research',
      type: 'research',
      content: 'Scanning sources and extracting technical specs...',
      status: 'pending',
    });
    const research = await postAgent('researcher', buildResearchPrompt(brief));
    if (!research.ok) {
      settleStep(
        'step-research',
        'error',
        `Research agent failed${research.status ? ` (${research.status})` : ''}: ${research.error}`,
      );
      setIsProcessing(false);
      return;
    }
    settleStep('step-research', 'completed', excerpt(research.response));

    addStep({
      id: 'step-audit',
      type: 'audit',
      content: 'Auditing synthesis against Absolute Zero standards...',
      status: 'pending',
    });
    const audit = await postAgent('director', buildAuditPrompt(research.response));
    const auditOk = audit.ok;
    settleStep(
      'step-audit',
      auditOk ? 'completed' : 'error',
      auditOk
        ? excerpt(audit.response)
        : `Design audit failed${'status' in audit && audit.status ? ` (${audit.status})` : ''}: ${'error' in audit ? audit.error : ''}`,
    );

    addStep({
      id: 'step-pdf',
      type: 'pdf',
      content: 'PDF Forge armed — Download Luxury PDF produces the branded deliverable.',
      status: 'completed',
    });

    setResult({
      query: brief,
      synthesis: research.response,
      audit: auditOk ? audit.response : `Design audit unavailable: ${'error' in audit ? audit.error : 'unknown failure'}`,
      auditOk,
      toolCalls: research.toolCalls + (auditOk ? audit.toolCalls : 0),
      sessionId: sessionIdRef.current,
    });
    setIsProcessing(false);
  };

  const downloadPdf = () => {
    if (!result) return;
    const html = buildBrandedReportHtml(result);
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.srcdoc = html;
    iframe.onload = () => {
      const win = iframe.contentWindow;
      if (!win) return;
      win.focus();
      win.print();
      const cleanup = () => iframe.remove();
      win.addEventListener('afterprint', cleanup, { once: true });
      window.setTimeout(cleanup, 60000);
    };
    document.body.appendChild(iframe);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full p-6 bg-sl-void text-white font-sans">
      {/* Control Panel */}
      <div className="col-span-4 flex flex-col gap-6">
        <div className="p-6 rounded-2xl bg-sl-obsidian border border-white/10 shadow-2xl">
          <h2 className="text-xl font-light mb-4 tracking-tight text-white/90">Research Intelligence</h2>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter design brief or material query..."
              aria-label="Research query"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sl-gold-subtle/50 transition-colors placeholder:text-white/20"
            />
            <button
              type="button"
              onClick={startResearch}
              disabled={isProcessing}
              aria-label={isProcessing ? 'Research in progress' : 'Start research'}
              className="absolute right-2 top-2 p-1.5 bg-sl-gold-subtle text-black rounded-lg hover:bg-sl-gold-ink transition-colors disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Cognitive Stream */}
        <div className="flex-1 rounded-2xl bg-sl-obsidian border border-white/10 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-white/40 font-medium">Cognitive Stream</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="w-1 h-1 rounded-full bg-white/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {steps.length === 0 && (
                <div className="h-full flex items-center justify-center text-white/20 text-sm italic">
                  Awaiting intelligence trigger...
                </div>
              )}
              {steps.map((step) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 items-start group"
                >
                  <div
                    className={cn(
                      'mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors',
                      step.status === 'completed' ? 'bg-sl-gold-subtle' : 'bg-white/10',
                    )}
                  >
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-2.5 h-2.5 text-black" />
                    ) : step.status === 'error' ? (
                      <XCircle className="w-2.5 h-2.5 text-white/50" />
                    ) : (
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-white/40" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-tighter text-white/30 mb-0.5">{step.type}</span>
                    <p
                      className={cn(
                        'text-sm group-hover:text-white transition-colors leading-relaxed',
                        step.status === 'error' ? 'text-white/90' : 'text-white/70',
                      )}
                    >
                      {step.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Results Canvas */}
      <div className="col-span-8 rounded-2xl bg-sl-obsidian border border-white/10 relative overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-white/40 font-medium">Analysis Canvas</span>
          {result && (
            <button
              type="button"
              onClick={downloadPdf}
              aria-label="Download Luxury PDF"
              className="text-xs px-3 py-1 rounded-full bg-sl-gold-subtle/10 text-sl-gold-subtle border border-sl-gold-subtle/20 hover:bg-sl-gold-subtle/20 transition-colors flex items-center gap-2"
            >
              <FileText className="w-3 h-3" /> Download Luxury PDF
            </button>
          )}
        </div>

        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center overflow-y-auto scrollbar-hide">
          {!isProcessing && !result && (
            <div className="max-w-md space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Search className="w-6 h-6 text-white/20" />
              </div>
              <h3 className="text-2xl font-light text-white/80">Ready for Intelligence Synthesis</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Enter a design brief to trigger the autonomous research loop. The AI will scan high-authority sources, synthesize findings, and forge a branded PDF.
              </p>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-sl-gold-subtle/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-sl-gold-subtle animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-sl-gold-subtle" />
                </div>
              </div>
              <p className="text-sm tracking-widest uppercase text-white/40 animate-pulse">Synthesizing Luxury Intelligence...</p>
            </div>
          )}

          {result && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl space-y-8 text-left"
            >
              <div className="border-l-2 border-sl-gold-subtle pl-6 py-2">
                <h4 className="text-xs uppercase tracking-widest text-sl-gold-subtle mb-2">Synthesis Complete</h4>
                <p className="text-2xl font-light leading-tight text-white">{result.query}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <Zap className="w-4 h-4 text-sl-gold-subtle mb-2" />
                  <p className="text-xs text-white/60">Tool Executions</p>
                  <p className="text-lg font-medium">{result.toolCalls} autonomous calls</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-sl-gold-subtle mb-2" />
                  <p className="text-xs text-white/60">Design Audit</p>
                  <p className="text-lg font-medium">{result.auditOk ? 'HEXA-Director Verified' : 'Audit Unavailable'}</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white/70 leading-relaxed max-h-72 overflow-y-auto scrollbar-hide whitespace-pre-wrap">
                {result.synthesis}
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-white/50 leading-relaxed max-h-40 overflow-y-auto scrollbar-hide whitespace-pre-wrap">
                <span className="block text-[10px] uppercase tracking-widest text-sl-gold-subtle mb-2">
                  Absolute Zero Audit
                </span>
                {result.audit}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
