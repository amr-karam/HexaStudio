'use client';

import { DesignSettings } from '@/lib/design-tokens';

interface PropertiesPanelProps {
  element: { tagName: string; styles: Record<string, string> };
  designSettings: DesignSettings | null;
  onUpdate: (updates: Partial<DesignSettings>) => void;
  onClose: () => void;
}

export function PropertiesPanel({ element, designSettings, onUpdate, onClose }: PropertiesPanelProps) {
  const variantOptions = [
    { value: 'void-garden', label: 'Void Garden' },
    { value: 'fracture-ring', label: 'Fracture Ring' },
  ];

  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-sl-void/95 backdrop-blur-xl border-t border-sl-glass-border shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Element info */}
      <div className="flex items-center gap-3">
        <span className="font-['JetBrains_Mono'] text-[10px] text-sl-silver uppercase tracking-widest">
          Element
        </span>
        <span className="font-['Bodoni_Moda'] text-sm text-accent italic">
          &lt;{element.tagName.toLowerCase()}&gt;
        </span>
      </div>

      <div className="w-px h-6 bg-sl-glass-border" />

      {/* Variant selector */}
      {designSettings && (
        <div className="flex items-center gap-3">
          <span className="font-['JetBrains_Mono'] text-[10px] text-sl-silver uppercase tracking-widest">
            Variant
          </span>
          <select
            value={designSettings.hero.variant}
            onChange={(e) => onUpdate({ hero: { ...designSettings.hero, variant: e.target.value as 'void-garden' | 'fracture-ring' } })}
            className="rounded-md bg-sl-stone border border-sl-glass-border px-2 py-1 text-xs text-sl-alabaster font-['JetBrains_Mono'] focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {variantOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="w-px h-6 bg-sl-glass-border" />

      {/* Monolith count stepper */}
      {designSettings && (
        <div className="flex items-center gap-3">
          <span className="font-['JetBrains_Mono'] text-[10px] text-sl-silver uppercase tracking-widest">
            Monoliths
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdate({ hero: { ...designSettings.hero, monolithCount: Math.max(1, designSettings.hero.monolithCount - 1) } })}
              className="w-6 h-6 rounded border border-sl-glass-border flex items-center justify-center hover:bg-sl-glass transition-colors"
              aria-label="Decrease"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sl-mist"><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <span className="w-6 text-center font-['JetBrains_Mono'] text-xs text-accent">{designSettings.hero.monolithCount}</span>
            <button
              onClick={() => onUpdate({ hero: { ...designSettings.hero, monolithCount: designSettings.hero.monolithCount + 1 } })}
              className="w-6 h-6 rounded border border-sl-glass-border flex items-center justify-center hover:bg-sl-glass transition-colors"
              aria-label="Increase"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sl-mist"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-sl-glass transition-colors"
          aria-label="Close properties"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sl-silver">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <button
          onClick={() => {
            if (designSettings) {
              // Trigger publish from properties panel
              window.dispatchEvent(new CustomEvent('admin:publish'));
            }
          }}
          className="px-3 py-1.5 rounded-md text-xs font-['JetBrains_Mono'] uppercase tracking-wider bg-accent text-[#0A0A0B] hover:bg-[#E5C256] transition-colors font-medium"
        >
          Publish
        </button>
      </div>
    </div>
  );
}
