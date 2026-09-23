import React from "react";
import {
  CheckCircle2, CircleDashed, ShieldCheck, Database, Network,
  Zap, Layers, FileCode, Server, ArrowUpRight, Clock, Lock,
  Activity, Terminal, LayoutGrid, Monitor, Code2, Sparkles
} from "lucide-react";

const deliverables = [
  { label: "Semantic Memory", status: "complete", detail: "agent-memory.service + agents.service.ts injection", icon: Database },
  { label: "Collaboration Sync", status: "complete", detail: "useCollaboration.ts + backend emission", icon: Network },
  { label: "XR Guided Tour", status: "complete", detail: "XRGuidedTour.tsx + regression tests", icon: Monitor },
  { label: "WebGL Profiling", status: "complete", detail: "sentry.ts safe tracking (no forced loseContext)", icon: Zap },
  { label: "Performance Benchmark", status: "complete", detail: "benchmark-memory-collab.mjs executed", icon: Activity },
  { label: "Feature Flags", status: "complete", detail: "feature-flags.ts + conditional loading", icon: ShieldCheck },
  { label: "Strapi CMS Schema", status: "complete", detail: "material-registry content-type registered", icon: LayoutGrid },
  { label: "Architecture ADR", status: "complete", detail: "docs/adr/012-hybrid-semantic-memory.md", icon: FileCode },
];

const migrationSteps = [
  { label: "docker-compose.gitlab-19.yml", status: "running", detail: "Download/init in progress (hexa-gitlab-19)" },
  { label: "Manual Export (8929)", status: "blocked", detail: "User must open old instance and export projects" },
  { label: "Manual Import (8930)", status: "blocked", detail: "User must open new instance and import" },
  { label: "Swap Primary", status: "pending", detail: "Shutdown 8929, promote 8930 to main" },
];

function StatusDot({ status }: { status: string }) {
  if (status === "complete") return <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,240,255,0.6)]" />;
  if (status === "running") return <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(232,184,77,0.6)] animate-pulse" />;
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(232,77,85,0.5)]" />;
}

export default function App() {
  return (
    <main className="min-h-screen bg-void text-foreground font-body selection:bg-cyan-500/25">
      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,240,255,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 right-0 w-[60vw] h-[60vh] bg-[radial-gradient(circle_at_bottom_right,rgba(232,184,77,0.04),transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <header className="mb-16 md:mb-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.15)]">
              <Sparkles className="w-4 h-4 text-brand-cyan" />
            </div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-muted">HEXA Studio</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-700 tracking-tight leading-[0.92] mb-4">
            Command<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-white/80 to-brand-gold">Centre</span>
          </h1>
          <p className="text-lg text-muted max-w-xl leading-relaxed font-light">
            Session deliverables completed. GitLab 19.4 migration in progress. Manual export/import steps pending user action.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Session Deliverables */}
          <section className="glass-panel rounded-2xl p-8 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-700 tracking-tight">Session Deliverables</h2>
              <span className="font-mono text-xs text-brand-cyan bg-brand-cyan/10 px-2.5 py-1 rounded-md border border-brand-cyan/20">8 / 8 Complete</span>
            </div>

            <div className="space-y-2">
              {deliverables.map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.label} className="group flex items-start gap-4 p-3.5 -mx-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      d.status === "complete" ? "bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan" : "bg-muted/10 border border-white/5 text-muted"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-0.5">
                        <StatusDot status={d.status} />
                        <h3 className="font-display font-500 text-sm md:text-base tracking-tight">{d.label}</h3>
                      </div>
                      <p className="font-mono text-[11px] text-muted leading-snug">{d.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right: Migration Status */}
          <section className="glass-panel rounded-2xl p-8 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-700 tracking-tight">Migration Status</h2>
              <span className="font-mono text-xs text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded-md border border-brand-gold/20">In Progress</span>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Server className="w-4 h-4 text-brand-cyan" />
                <span className="font-mono text-[11px] text-muted uppercase tracking-wider">GitLab v19.4</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-display text-3xl font-700 tracking-tight">hexa-gitlab-19</span>
                <span className="font-mono text-xs text-muted">port 8930</span>
              </div>
              <div className="text-sm text-brand-cyan">Initializing / Download in progress</div>
            </div>

            <div className="h-px bg-white/5 my-6" />

            <div className="space-y-4">
              {migrationSteps.map((s) => (
                <div key={s.label} className="flex items-start gap-4">
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                    s.status === "running" ? "bg-brand-gold animate-pulse" :
                    s.status === "complete" ? "bg-brand-cyan" : "bg-red-400"
                  }`} />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-display font-500 text-sm">{s.label}</h4>
                      <span className={`font-mono text-[10px] uppercase px-1.5 py-0.5 rounded ${
                        s.status === "running" ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20" :
                        s.status === "blocked" ? "bg-red-400/10 text-red-400 border border-red-400/20" :
                        "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
                      }`}>{s.status}</span>
                    </div>
                    <p className="font-mono text-[11px] text-muted leading-snug">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-void-light border border-white/[0.06]">
              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display text-sm font-500 mb-1">Manual Action Required</h4>
                  <p className="font-mono text-[11px] text-muted leading-snug mb-2">
                    The agent cannot perform browser-based project exports or imports. Once <code className="bg-white/5 px-1 rounded text-brand-cyan">hexa-gitlab-19</code> is healthy:
                  </p>
                  <ol className="font-mono text-[11px] text-muted leading-snug list-decimal list-inside space-y-0.5">
                    <li>Open <code className="text-brand-cyan">http://19.16.1.100:8929</code> → Admin → Export</li>
                    <li>Open <code className="text-brand-cyan">http://19.16.1.100:8930</code> → Admin → Import</li>
                    <li>Confirm import → shutdown old (<code className="text-muted">8929</code>)</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-16 md:mt-24 pt-8 border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-mono text-muted">
            <span>HEXA Studio</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Session: 2026-09-22</span>
          </div>
          <div className="text-xs font-mono text-muted">
            Artifact generated via web-artifacts-builder
          </div>
        </footer>
      </div>
    </main>
  );
}
