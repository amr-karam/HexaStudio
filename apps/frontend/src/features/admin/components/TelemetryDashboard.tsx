'use client';

import React, { useEffect, useState } from 'react';
import { fetchSystemHealth } from '../api';
import { SystemHealth } from '../types';

export function TelemetryDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemHealth()
      .then(setHealth)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !health) {
    return (
      <div className="w-full max-w-6xl mx-auto p-12 bg-background text-foreground border border-neutral-800 rounded-2xl flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Loading Telemetry Grid...</span>
        </div>
      </div>
    );
  }

  const servicesList = Object.entries(health.services);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-12 bg-background text-foreground border border-neutral-800 rounded-2xl shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-neutral-800 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-mono">Infrastructure Command Center</span>
          <h2 className="text-3xl font-light tracking-tight mt-1">Real-Time Telemetry & Health</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Live monitoring of microservices, AI token consumption, and edge latencies.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-neutral-900/80 px-4 py-2 rounded-xl border border-neutral-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">System Healthy</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-xl">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Active WebSockets</span>
          <p className="text-3xl font-light font-mono text-foreground">{health.metrics.activeSockets}</p>
          <span className="text-[10px] text-emerald-400 mt-2 block font-mono">Real-time sync active</span>
        </div>
        <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-xl">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">AI Tokens Today</span>
          <p className="text-3xl font-light font-mono text-accent">{(health.metrics.aiTokensUsedToday / 1000).toFixed(1)}k</p>
          <span className="text-[10px] text-neutral-500 mt-2 block font-mono">Gemini & OpenAI pools</span>
        </div>
        <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-xl">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Redis Cache Hit Rate</span>
          <p className="text-3xl font-light font-mono text-foreground">{health.metrics.cacheHitRate}%</p>
          <span className="text-[10px] text-emerald-400 mt-2 block font-mono">Sub-millisecond TTL</span>
        </div>
        <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-xl">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Avg Edge Latency</span>
          <p className="text-3xl font-light font-mono text-foreground">{health.metrics.avgLatencyMs}ms</p>
          <span className="text-[10px] text-emerald-400 mt-2 block font-mono">Global CDN Edge</span>
        </div>
      </div>

      {/* Microservices Status Matrix */}
      <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-neutral-400 mb-6">Microservice Topology</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicesList.map(([name, status]) => (
            <div key={name} className="p-4 bg-neutral-900/50 border border-neutral-800/80 rounded-xl flex justify-between items-center">
              <span className="text-sm font-medium capitalize text-foreground">{name}</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className={`text-xs font-mono uppercase tracking-wider ${status === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
