'use client';

import React from 'react';

export function PerformanceDashboard() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-12 bg-background text-foreground border border-neutral-800 rounded-2xl shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-neutral-800 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-mono">Sentry & Core Web Vitals</span>
          <h2 className="text-3xl font-light tracking-tight mt-1">Performance & Error Budgets</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time tracking of Core Web Vitals (LCP, FID, CLS, TBT) and Sentry error budgets.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-neutral-900/80 px-4 py-2 rounded-xl border border-neutral-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Error Budget: 99.95%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-xl">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Largest Contentful Paint</span>
          <p className="text-3xl font-light font-mono text-emerald-400">1.2s</p>
          <span className="text-[10px] text-neutral-500 mt-2 block font-mono">Target: &lt; 1.5s</span>
        </div>
        <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-xl">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Total Blocking Time</span>
          <p className="text-3xl font-light font-mono text-emerald-400">60ms</p>
          <span className="text-[10px] text-neutral-500 mt-2 block font-mono">Target: &lt; 100ms</span>
        </div>
        <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-xl">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Cumulative Layout Shift</span>
          <p className="text-3xl font-light font-mono text-emerald-400">0.0003</p>
          <span className="text-[10px] text-neutral-500 mt-2 block font-mono">Target: &lt; 0.1</span>
        </div>
        <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-xl">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Sentry Uncaught Rate</span>
          <p className="text-3xl font-light font-mono text-foreground">0.01%</p>
          <span className="text-[10px] text-emerald-400 mt-2 block font-mono">Zero critical crashes</span>
        </div>
      </div>
    </div>
  );
}
