'use client';
import { EASE } from '@/lib/motion';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchSystemHealth } from '../api';
import { SystemHealth } from '../types';

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE.entrance },
  },
};

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
      <div className="w-full max-w-6xl mx-auto p-12 bg-background text-foreground border border-neutral-800/80 rounded-2xl flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Loading Telemetry Grid...</span>
        </div>
      </div>
    );
  }

  const servicesList = Object.entries(health.services);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-6xl mx-auto p-6 md:p-12 bg-background/95 backdrop-blur-xl text-foreground border border-neutral-800/80 rounded-2xl shadow-2xl"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-neutral-800/80 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-mono">Infrastructure Command Center</span>
          <h2 className="text-3xl font-light tracking-tight mt-1">Real-Time Telemetry & Health</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Live monitoring of microservices, AI token consumption, and edge latencies.
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 bg-neutral-900/80 px-4 py-2 rounded-xl border border-neutral-800/80 shadow-inner"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">System Healthy</span>
        </motion.div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Active WebSockets',
            val: health.metrics.activeSockets,
            sub: 'Real-time sync active',
            highlight: false,
          },
          {
            title: 'AI Tokens Today',
            val: `${(health.metrics.aiTokensUsedToday / 1000).toFixed(1)}k`,
            sub: 'Gemini & OpenAI pools',
            highlight: true,
          },
          {
            title: 'Redis Cache Hit Rate',
            val: `${health.metrics.cacheHitRate}%`,
            sub: 'Sub-millisecond TTL',
            highlight: false,
          },
          {
            title: 'Avg Edge Latency',
            val: `${health.metrics.avgLatencyMs}ms`,
            sub: 'Global CDN Edge',
            highlight: false,
          },
        ].map((metric) => (
          <motion.div
            key={metric.title}
            variants={itemVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-6 bg-neutral-900/40 hover:bg-neutral-900/70 border border-neutral-800/80 hover:border-neutral-700/80 rounded-xl transition-colors shadow-lg"
          >
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">{metric.title}</span>
            <p className={`text-3xl font-light font-mono ${metric.highlight ? 'text-accent' : 'text-foreground'}`}>
              {metric.val}
            </p>
            <span className="text-[10px] text-emerald-400 mt-2 block font-mono">{metric.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Microservices Status Matrix */}
      <motion.div variants={itemVariants} className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-mono uppercase tracking-widest text-neutral-400 mb-6">Microservice Topology</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicesList.map(([name, status]) => (
            <motion.div
              key={name}
              whileHover={{ scale: 1.01 }}
              className="p-4 bg-neutral-900/50 hover:bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700/80 rounded-xl flex justify-between items-center transition-colors"
            >
              <span className="text-sm font-medium capitalize text-foreground">{name}</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className={`text-xs font-mono uppercase tracking-wider ${status === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
