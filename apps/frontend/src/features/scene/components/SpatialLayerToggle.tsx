'use client';

/**
 * HEXA Studio Interactive 2D/3D Floorplan & Spatial Layer Toggle Component
 *
 * Provides view projection switching (2D Blueprint vs. 3D Perspective) and architectural
 * layer inspection toggles (Structural, Electrical/Lighting, Furniture, HVAC).
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayerStore } from '../store/layer-store';

export function SpatialLayerToggle() {
  const { viewMode, layers, layerOpacity, isOpen, setViewMode, toggleLayer, setLayerOpacity, toggleOpen } = useLayerStore();

  const activeLayersCount = layers.filter((l) => l.visible).length;

  return (
    <>
      {/* Viewport Floating Trigger */}
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 left-52 z-40 flex items-center space-x-2 bg-neutral-900/90 hover:bg-neutral-800 text-amber-400 border border-amber-500/30 px-3.5 py-2.5 rounded-full shadow-2xl backdrop-blur-xl text-xs font-semibold transition-all group"
      >
        <span>📐</span>
        <span>{viewMode === '2D_floorplan' ? '2D Blueprint' : '3D Spatial Layers'}</span>
        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-400 border border-amber-500/30">
          {activeLayersCount}/{layers.length}
        </span>
      </button>

      {/* Floating Toolbar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-20 left-52 z-50 w-80 bg-neutral-950/95 border border-neutral-800 rounded-3xl p-5 text-neutral-100 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-neutral-100">Floorplan & Spatial Layers</h3>
                <p className="text-xs text-neutral-400">Architectural Inspection Controls</p>
              </div>
              <button onClick={toggleOpen} className="text-neutral-400 hover:text-neutral-200 p-1.5 rounded-lg">
                ✕
              </button>
            </div>

            {/* View Projection Switcher (2D / 3D) */}
            <div className="mt-4 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl flex space-x-1">
              <button
                onClick={() => setViewMode('3D_perspective')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  viewMode === '3D_perspective'
                    ? 'bg-amber-500 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                🏢 3D Perspective
              </button>
              <button
                onClick={() => setViewMode('2D_floorplan')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  viewMode === '2D_floorplan'
                    ? 'bg-amber-500 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                📐 2D Floorplan
              </button>
            </div>

            {/* Layer Checkboxes */}
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Architectural Layers
              </span>
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    layer.visible
                      ? 'bg-neutral-900 border-neutral-700 shadow-md'
                      : 'bg-neutral-900/30 border-neutral-800/60 opacity-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">{layer.icon}</span>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
                        <span className="text-xs font-semibold text-neutral-100">{layer.label}</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{layer.desc}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${layer.visible ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    {layer.visible ? '✓' : 'OFF'}
                  </span>
                </button>
              ))}
            </div>

            {/* Opacity Slider */}
            <div className="mt-4 pt-3 border-t border-neutral-800 space-y-1.5">
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Inspection Layer Opacity</span>
                <span className="font-mono text-neutral-200">{Math.round(layerOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={layerOpacity}
                onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
