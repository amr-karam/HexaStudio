'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface DataPoint {
  label: string;
  value: number; // 0 - 100
  unit: string;
  change: string;
  description: string;
}

export interface ArchitecturalDataVizProps {
  title?: string;
  subtitle?: string;
  dataPoints?: DataPoint[];
  className?: string;
}

const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 120, damping: 20, mass: 0.8 };

const DEFAULT_METRICS: DataPoint[] = [
  {
    label: 'Structural Precision',
    value: 99.4,
    unit: '%',
    change: '+2.1%',
    description: 'Sub-millimeter BIM coordinate alignment across multi-surface meshes.',
  },
  {
    label: 'Thermal Efficiency',
    value: 94.8,
    unit: 'Score',
    change: '+5.4%',
    description: 'Passive solar gain optimization and solar envelope envelope simulation.',
  },
  {
    label: 'Spatial Dynamics',
    value: 98.2,
    unit: 'FPS',
    change: '60 FPS',
    description: 'Real-time raymarched spatial lighting performance at 4K rendering.',
  },
  {
    label: 'Carbon Neutrality',
    value: 96.0,
    unit: '%',
    change: 'Net-0',
    description: 'Embodied carbon calculation based on sustainable material sourcing.',
  },
];

export const ArchitecturalDataViz: React.FC<ArchitecturalDataVizProps> = ({
  title = 'Architectural Analytics',
  subtitle = 'Real-time structural, thermal, and spatial simulation metrics',
  dataPoints = DEFAULT_METRICS,
  className = '',
}) => {
  const [activePoint, setActivePoint] = useState<number | null>(null);

  return (
    <div className={`artisan-glass rounded-2xl p-6 sm:p-8 relative overflow-hidden ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#D4AF37] uppercase block mb-1">
            Digital Artisan Standard
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-neutral-900/60 border border-neutral-800 rounded-full px-3 py-1.5 self-start sm:self-auto text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Sync</span>
        </div>
      </div>

      {/* SVG Spring Graph Representation */}
      <div className="relative h-44 w-full mb-8">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="artisanGoldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d="M 0,100 Q 100,20 200,60 T 400,10 L 400,120 L 0,120 Z"
            fill="url(#artisanGoldGradient)"
          />

          {/* Glowing Animated Line */}
          <path
            d="M 0,100 Q 100,20 200,60 T 400,10"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="3"
            className="artisan-chart-path drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"
          />

          {/* Data Nodes */}
          {[
            { x: 0, y: 100 },
            { x: 100, y: 40 },
            { x: 200, y: 60 },
            { x: 300, y: 30 },
            { x: 400, y: 10 },
          ].map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="4"
              className="fill-neutral-950 stroke-[#D4AF37] stroke-2 hover:r-6 transition-all duration-300 cursor-pointer"
            />
          ))}
        </svg>
      </div>

      {/* Metric Cards Grid — Bklit-inspired liquid glass */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dataPoints.map((item, idx) => (
          <motion.div
            key={idx}
            onHoverStart={() => setActivePoint(idx)}
            onHoverEnd={() => setActivePoint(null)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...SPRING_TRANSITION, delay: idx * 0.08 }}
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
            className={`artisan-glass p-4 rounded-xl cursor-pointer transition-all duration-300 ${
              activePoint === idx
                ? 'border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                : 'hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-400 font-medium truncate">{item.label}</span>
              <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                {item.change}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-white">{item.value}</span>
              <span className="text-xs text-[#D4AF37] font-mono">{item.unit}</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ArchitecturalDataViz;
