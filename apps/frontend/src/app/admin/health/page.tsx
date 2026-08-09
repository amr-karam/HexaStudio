'use client';

/**
 * HEXA Studio — Production Health Dashboard
 *
 * Provides real-time service health checks across all stack layers:
 * - NestJS BFF API
 * - Strapi 5 CMS
 * - Odoo 17 ERP
 * - Gemini AI
 * - Redis / PostgreSQL (via health endpoint)
 * - Traefik v3 Edge Proxy
 * - GitLab CE CI/CD
 */

import React, { useState, useCallback, useEffect } from 'react';

interface ServiceCheck {
  name: string;
  url: string;
  label: string;
  icon: string;
  tier: 'critical' | 'primary' | 'secondary';
}

interface HealthResult {
  name: string;
  label: string;
  icon: string;
  tier: ServiceCheck['tier'];
  status: 'checking' | 'healthy' | 'degraded' | 'down' | 'unknown';
  latencyMs?: number;
  httpStatus?: number;
  error?: string;
  lastChecked?: string;
}

const SERVICES: ServiceCheck[] = [
  { name: 'backend', label: 'NestJS BFF API', url: '/api/health', icon: '🔧', tier: 'critical' },
  { name: 'frontend', label: 'Next.js Frontend', url: '/', icon: '⚡', tier: 'critical' },
  { name: 'cms', label: 'Strapi 5 CMS', url: 'https://cms.hexastudio.net/api/articles?pagination[limit]=1', icon: '📝', tier: 'primary' },
  { name: 'ai', label: 'Gemini AI Engine', url: '/api/ai/health', icon: '🤖', tier: 'primary' },
  { name: 'gitlab', label: 'GitLab CE', url: 'https://gitlab.hexastudio.net/-/health', icon: '🦊', tier: 'primary' },
  { name: 'grafana', label: 'Grafana Metrics', url: 'https://gitlab.hexastudio.net/grafana/api/health', icon: '📊', tier: 'secondary' },
];

const STATUS_STYLES: Record<HealthResult['status'], { bg: string; text: string; dot: string; label: string }> = {
  checking:  { bg: 'bg-amber-500/10',  text: 'text-amber-400',   dot: 'bg-amber-400 animate-pulse', label: 'Checking…' },
  healthy:   { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400',             label: 'Healthy'   },
  degraded:  { bg: 'bg-yellow-500/10',  text: 'text-yellow-400',  dot: 'bg-yellow-400 animate-pulse',label: 'Degraded'  },
  down:      { bg: 'bg-red-500/10',     text: 'text-red-400',     dot: 'bg-red-500 animate-pulse',   label: 'Down'      },
  unknown:   { bg: 'bg-white/5',        text: 'text-white/40',    dot: 'bg-white/20',                label: 'Unknown'   },
};

async function checkService(svc: ServiceCheck): Promise<HealthResult> {
  const start = performance.now();
  try {
    const resp = await fetch(svc.url, { method: 'GET', cache: 'no-store', signal: AbortSignal.timeout(8000) });
    const latencyMs = Math.round(performance.now() - start);
    const status: HealthResult['status'] = resp.ok ? (latencyMs > 3000 ? 'degraded' : 'healthy') : 'degraded';
    return { name: svc.name, label: svc.label, icon: svc.icon, tier: svc.tier, status, latencyMs, httpStatus: resp.status, lastChecked: new Date().toISOString() };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const error = err instanceof Error ? err.message : 'Request failed';
    return { name: svc.name, label: svc.label, icon: svc.icon, tier: svc.tier, status: 'down', latencyMs, error, lastChecked: new Date().toISOString() };
  }
}

export default function HealthDashboardPage() {
  const [results, setResults] = useState<HealthResult[]>(
    SERVICES.map(s => ({ name: s.name, label: s.label, icon: s.icon, tier: s.tier, status: 'unknown' }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const runChecks = useCallback(async () => {
    setIsRunning(true);
    setResults(SERVICES.map(s => ({ name: s.name, label: s.label, icon: s.icon, tier: s.tier, status: 'checking' })));

    const checks = await Promise.all(SERVICES.map(checkService));
    setResults(checks);
    setLastRun(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setIsRunning(false);
  }, []);

  useEffect(() => { runChecks(); }, [runChecks]);

  const healthy = results.filter(r => r.status === 'healthy').length;
  const total = results.length;
  const allHealthy = healthy === total;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Production Health Dashboard</h1>
            <p className="text-xs text-white/50 mt-1">
              Server: <span className="font-mono text-amber-400">19.16.1.100</span> · Traefik v3 + Cloudflare Tunnel
              {lastRun && <span className="ml-3">Last checked: <span className="text-white/70">{lastRun}</span></span>}
            </p>
          </div>

          <button
            onClick={runChecks}
            disabled={isRunning}
            className="flex items-center space-x-2 rounded-lg bg-accent px-5 py-2.5 text-xs font-bold text-black disabled:opacity-50 hover:bg-accent-light transition-colors"
          >
            <span>{isRunning ? '⟳ Checking…' : '↺ Re-check All'}</span>
          </button>
        </div>

        {/* Summary Bar */}
        <div className={`rounded-2xl p-4 flex items-center justify-between border ${allHealthy ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
          <div className="flex items-center space-x-3">
            <span className={`text-2xl ${allHealthy ? '' : 'animate-pulse'}`}>{allHealthy ? '✅' : '⚠️'}</span>
            <div>
              <p className={`text-sm font-bold ${allHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                {allHealthy ? 'All Systems Operational' : `${total - healthy} Service${total - healthy !== 1 ? 's' : ''} Require Attention`}
              </p>
              <p className="text-xs text-white/50">{healthy} / {total} services healthy</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {results.map(r => (
              <div key={r.name} className={`h-2 w-8 rounded-full ${STATUS_STYLES[r.status].dot.replace(' animate-pulse', '')}`} title={r.label} />
            ))}
          </div>
        </div>

        {/* Service Cards */}
        {(['critical', 'primary', 'secondary'] as const).map(tier => {
          const tierResults = results.filter(r => r.tier === tier);
          if (!tierResults.length) return null;
          return (
            <div key={tier} className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                {tier === 'critical' ? '🔴 Critical Services' : tier === 'primary' ? '🟡 Primary Services' : '⚪ Secondary Services'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tierResults.map(result => {
                  const style = STATUS_STYLES[result.status];
                  return (
                    <div key={result.name} className={`rounded-2xl border border-white/10 ${style.bg} p-4 flex items-center justify-between`}>
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{result.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-white">{result.label}</p>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                            <span className={`text-[10px] font-medium ${style.text}`}>{style.label}</span>
                            {result.latencyMs !== undefined && (
                              <span className="text-[10px] text-white/30">{result.latencyMs}ms</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {result.httpStatus && (
                          <p className={`text-xs font-mono ${result.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`}>
                            HTTP {result.httpStatus}
                          </p>
                        )}
                        {result.error && (
                          <p className="text-[10px] text-red-400/70 max-w-[140px] truncate" title={result.error}>
                            {result.error}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Infrastructure Note */}
        <div className="rounded-xl border border-white/5 bg-white/3 p-4 text-xs text-white/40 space-y-1">
          <p>🏗 <strong className="text-white/60">Stack:</strong> Next.js 16 · NestJS 11 · Strapi 5 · Odoo 17 · PostgreSQL 16 · Redis 7 · Qdrant · MinIO</p>
          <p>🌐 <strong className="text-white/60">Edge:</strong> Traefik v3 + Cloudflare Tunnel · GitLab CE (registry.gitlab.hexastudio.net)</p>
          <p>🤖 <strong className="text-white/60">AI:</strong> Gemini 2.5 Flash · DeepSeek · OpenRouter · Anthropic Claude · Grok</p>
        </div>
      </div>
    </div>
  );
}
