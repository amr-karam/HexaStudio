'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface Annotation {
  id: string;
  type: 'text' | 'pin';
  position: { x: number; y: number };
  content: string;
  author: string;
  createdAt: string;
  resolved: boolean;
}

interface AnnotationOverlayProps {
  annotations: Annotation[];
  onAddAnnotation: (annotation: { x: number; y: number; content: string }) => void;
  onResolveAnnotation: (id: string) => void;
  currentUser: string;
  imageUrl?: string;
}

export function AnnotationOverlay({
  annotations,
  onAddAnnotation,
  onResolveAnnotation,
  currentUser,
  imageUrl,
}: AnnotationOverlayProps) {
  const [placing, setPlacing] = useState(false);
  const [newPos, setNewPos] = useState<{ x: number; y: number } | null>(null);
  const [newContent, setNewContent] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if (!placing) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setNewPos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, [placing]);

  const handleSubmitAnnotation = useCallback(() => {
    if (!newPos || !newContent.trim()) return;
    onAddAnnotation({ x: newPos.x, y: newPos.y, content: newContent });
    setNewPos(null);
    setNewContent('');
    setPlacing(false);
  }, [newPos, newContent, onAddAnnotation]);

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80">Annotations</h3>
        <button
          onClick={() => setPlacing(!placing)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            placing
              ? 'bg-[#D4AF37] text-black'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          {placing ? 'Cancel' : 'Add Annotation'}
        </button>
      </div>

      <div ref={containerRef} className="relative overflow-hidden rounded-lg">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Project render"
            className="w-full"
            onClick={handleImageClick}
          />
        )}

        <div className="absolute inset-0">
          {annotations.map((ann) => (
            <div
              key={ann.id}
              className="absolute"
              style={{ left: `${ann.position.x * 100}%`, top: `${ann.position.y * 100}%` }}
            >
              <button
                onClick={() => setSelected(selected === ann.id ? null : ann.id)}
                className={`flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  ann.resolved
                    ? 'bg-emerald-500/80 text-white'
                    : 'bg-[#D4AF37] text-black'
                }`}
              >
                {ann.resolved ? '✓' : '+'}
              </button>

              {selected === ann.id && (
                <div className="absolute left-6 top-0 w-48 rounded-lg border border-white/10 bg-[#1A1A1A] p-3 shadow-xl">
                  <p className="text-xs text-white/80">{ann.content}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-white/40">{ann.author}</span>
                    {!ann.resolved && (
                      <button
                        onClick={() => onResolveAnnotation(ann.id)}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {newPos && (
            <div
              className="absolute"
              style={{ left: `${newPos.x * 100}%`, top: `${newPos.y * 100}%` }}
            >
              <div className="absolute left-6 top-0 w-48 rounded-lg border border-[#D4AF37]/50 bg-[#1A1A1A] p-3 shadow-xl">
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Add note..."
                  className="w-full rounded border border-white/10 bg-black/50 p-1.5 text-xs text-white placeholder-white/30"
                  rows={2}
                  autoFocus
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleSubmitAnnotation}
                    className="rounded bg-[#D4AF37] px-2 py-1 text-[10px] font-medium text-black"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setNewPos(null); setNewContent(''); }}
                    className="rounded bg-white/10 px-2 py-1 text-[10px] text-white/60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
