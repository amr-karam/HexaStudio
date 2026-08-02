'use client';

/**
 * HEXA Studio 3D Spatial Annotations & Mesh Pinning Overlay
 *
 * Renders interactive visual feedback pins on the 3D viewport canvas.
 * Allows clients and architects to click and drop comments directly onto mesh coordinates.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnnotationStore } from '../store/annotation-store';

export function SpatialAnnotations() {
  const { pins, isAddingPin, activePinId, addPin, setIsAddingPin, setActivePinId, toggleResolvePin } = useAnnotationStore();
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [tempCoords, setTempCoords] = useState<{ x: number; y: number } | null>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingPin) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setTempCoords({ x, y });
  };

  const handleSavePin = () => {
    if (!tempCoords || !newTitle.trim() || !newComment.trim()) return;
    addPin({
      x: tempCoords.x,
      y: tempCoords.y,
      title: newTitle,
      author: 'Client',
      comment: newComment,
    });
    setNewTitle('');
    setNewComment('');
    setTempCoords(null);
  };

  return (
    <>
      {/* Click-capture layer for dropping new pins */}
      {isAddingPin && (
        <div
          onClick={handleCanvasClick}
          className="fixed inset-0 z-30 cursor-crosshair bg-amber-500/5 backdrop-blur-[1px] flex items-top justify-center pt-24"
        >
          <div className="bg-neutral-950/90 border border-amber-500/40 text-amber-300 text-xs px-4 py-2 rounded-full shadow-2xl">
            📍 Click anywhere on the viewport to drop a spatial annotation pin
          </div>
        </div>
      )}

      {/* Render Active Spatial Pins */}
      {pins.map((pin) => (
        <div
          key={pin.id}
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          className="fixed z-40 -translate-x-1/2 -translate-y-1/2"
        >
          <button
            onClick={() => setActivePinId(activePinId === pin.id ? null : pin.id)}
            className={`relative flex items-center justify-center w-8 h-8 rounded-full shadow-2xl transition-all ${
              pin.resolved
                ? 'bg-neutral-800 border border-neutral-600 text-neutral-400'
                : 'bg-amber-500 border-2 border-neutral-950 text-neutral-950 font-bold animate-bounce'
            }`}
          >
            📍
          </button>

          {/* Pin Detail Popover */}
          <AnimatePresence>
            {activePinId === pin.id && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-1/2 top-10 -translate-x-1/2 w-64 bg-neutral-950/95 border border-neutral-800 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl text-neutral-100 text-xs z-50"
              >
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="font-bold text-amber-400">{pin.title}</span>
                  <button onClick={() => setActivePinId(null)} className="text-neutral-400 hover:text-neutral-200">
                    ✕
                  </button>
                </div>
                <p className="text-neutral-300 mt-2 leading-relaxed">{pin.comment}</p>
                <div className="flex items-center justify-between mt-3 text-[10px] text-neutral-500">
                  <span>By {pin.author} &bull; {pin.timestamp}</span>
                  <button
                    onClick={() => toggleResolvePin(pin.id)}
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    {pin.resolved ? 'Reopen' : 'Resolve'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* New Pin Submission Modal */}
      {tempCoords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-96 bg-neutral-950 border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-neutral-100 text-xs space-y-3">
            <h4 className="text-sm font-bold text-amber-400">Add Spatial Annotation</h4>
            <p className="text-neutral-400 text-[11px]">Pin coordinates: X:{tempCoords.x}% Y:{tempCoords.y}%</p>
            <input
              type="text"
              placeholder="Annotation Title (e.g. Facade Material)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
            />
            <textarea
              rows={3}
              placeholder="Detailed feedback note for architectural team..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
            />
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setTempCoords(null)}
                className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePin}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl"
              >
                Save Annotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Pin Trigger */}
      <button
        onClick={() => setIsAddingPin(!isAddingPin)}
        className="fixed bottom-20 right-6 z-40 bg-neutral-900/90 hover:bg-neutral-800 text-amber-400 border border-amber-500/30 px-3.5 py-2.5 rounded-full shadow-2xl backdrop-blur-xl text-xs font-semibold flex items-center space-x-2 transition-all"
      >
        <span>📍</span>
        <span>{isAddingPin ? 'Click Canvas...' : 'Add Pin'}</span>
      </button>
    </>
  );
}
