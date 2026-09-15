'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { DesignSettings } from '@/lib/design-tokens';

interface DesignPanelProps {
  settings: DesignSettings;
  onChange: (settings: DesignSettings) => void;
  onPublish: () => void;
  onDiscard: () => void;
}

const fontOptions = [
  { value: 'Bodoni Moda', label: 'Bodoni Moda — Didone Editorial' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond — Refined Serif' },
  { value: 'Playfair Display', label: 'Playfair Display — Classic Elegance' },
];

const bodyFontOptions = [
  { value: 'Inter', label: 'Inter — Clean Sans' },
  { value: 'Jost', label: 'Jost — Geometric Neutral' },
  { value: 'system-ui', label: 'System UI — Native' },
];

const monoFontOptions = [
  { value: 'JetBrains Mono', label: 'JetBrains Mono — Dev' },
  { value: 'Inter', label: 'Inter — Sans' },
  { value: 'system-ui', label: 'System UI — Native' },
];

export function DesignPanel({ settings, onChange, onPublish, onDiscard }: DesignPanelProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'identity' | 'hero' | 'footer' | 'css'>('colors');

  const update = (patch: Partial<DesignSettings>) => onChange({ ...settings, ...patch });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'colors':
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-300">
            <h3 className="font-['Bodoni_Moda'] text-base text-accent tracking-tight">Signature</h3>
            <p className="text-xs text-sl-silver font-['JetBrains_Mono'] uppercase tracking-widest mb-4">Brand color palette — understated, barely there</p>

            {/* Color grid */}
            <div className="space-y-3">
              {[
                { key: 'gold', label: 'Gold', value: settings.colors.gold, hint: 'Primary accent — barely there' },
                { key: 'void', label: 'Void', value: settings.colors.void, hint: 'Canvas — the deepest black' },
                { key: 'obsidian', label: 'Obsidian', value: settings.colors.obsidian, hint: 'Surface — dark elevated' },
                { key: 'alabaster', label: 'Alabaster', value: settings.colors.alabaster, hint: 'Light text — warm white' },
                { key: 'muted', label: 'Muted', value: settings.colors.muted, hint: 'Secondary text — graphite' },
              ].map(({ key, label, value, hint }) => (
                <div key={key} className="flex items-center gap-4 p-3 rounded-lg bg-sl-glass cursor-pointer hover:bg-sl-glass-hover transition-colors">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => update({ colors: { ...settings.colors, [key]: e.target.value } })}
                    className="w-10 h-10 rounded border border-sl-glass-border cursor-pointer p-0.5 bg-transparent hover:scale-105 transition-transform"
                    aria-label={`${label} color`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">{label}</span>
                      <span className="font-['JetBrains_Mono'] text-[10px] text-sl-silver font-mono">{value}</span>
                    </div>
                    <p className="text-[10px] text-sl-silver mt-0.5 font-['JetBrains_Mono']">{hint}</p>
                  </div>
                  <button
                    onClick={() => update({ colors: { ...settings.colors, [key]: '#D4AF37' } })}
                    className="text-[10px] text-accent hover:underline font-['JetBrains_Mono'] uppercase tracking-wider"
                    title="Reset to default"
                  >
                    Reset
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'typography':
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-300">
            <h3 className="font-['Bodoni_Moda'] text-base text-accent tracking-tight">Voice</h3>
            <p className="text-xs text-sl-silver font-['JetBrains_Mono'] uppercase tracking-widest mb-4">Typographic identity — the voice of the brand</p>

            <div className="space-y-4">
              {/* Heading font */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Heading Font</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-accent">{settings.typography.headingFont}</span>
                </label>
                <select
                  value={settings.typography.headingFont}
                  onChange={(e) => update({ typography: { ...settings.typography, headingFont: e.target.value } })}
                  className="w-full rounded-md bg-sl-stone border border-sl-glass-border px-3 py-2 text-xs text-sl-alabaster font-['JetBrains_Mono'] focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {fontOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Body font */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Body Font</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-accent">{settings.typography.bodyFont}</span>
                </label>
                <select
                  value={settings.typography.bodyFont}
                  onChange={(e) => update({ typography: { ...settings.typography, bodyFont: e.target.value } })}
                  className="w-full rounded-md bg-sl-stone border border-sl-glass-border px-3 py-2 text-xs text-sl-alabaster font-['JetBrains_Mono'] focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {bodyFontOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Mono font */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Mono Font</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-accent">{settings.typography.monoFont}</span>
                </label>
                <select
                  value={settings.typography.monoFont}
                  onChange={(e) => update({ typography: { ...settings.typography, monoFont: e.target.value } })}
                  className="w-full rounded-md bg-sl-stone border border-sl-glass-border px-3 py-2 text-xs text-sl-alabaster font-['JetBrains_Mono'] focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {monoFontOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Tracking */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Heading Tracking</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-accent">{settings.typography.headingTracking}</span>
                </label>
                <input
                  type="range"
                  min="-0.1"
                  max="0.1"
                  step="0.005"
                  value={parseFloat(settings.typography.headingTracking)}
                  onChange={(e) => update({ typography: { ...settings.typography, headingTracking: e.target.value } })}
                  className="w-full accent-accent h-1"
                />
                <div className="flex justify-between text-[10px] text-sl-silver font-['JetBrains_Mono'] mt-1">
                  <span>Tight</span>
                  <span>Loose</span>
                </div>
              </div>

              {/* Body size */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Body Size</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-accent">{settings.typography.bodySize}</span>
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.0625"
                  value={parseFloat(settings.typography.bodySize)}
                  onChange={(e) => update({ typography: { ...settings.typography, bodySize: `${parseFloat(e.target.value)}rem` } })}
                  className="w-full accent-accent h-1"
                />
                <div className="flex justify-between text-[10px] text-sl-silver font-['JetBrains_Mono'] mt-1">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'identity':
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-300">
            <h3 className="font-['Bodoni_Moda'] text-base text-accent tracking-tight">Identity</h3>
            <p className="text-xs text-sl-silver font-['JetBrains_Mono'] uppercase tracking-widest mb-4">Site identity — who you are</p>

            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Wordmark</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-accent">{settings.siteIdentity.wordmark}</span>
                </label>
                <input
                  type="text"
                  value={settings.siteIdentity.wordmark}
                  onChange={(e) => update({ siteIdentity: { ...settings.siteIdentity, wordmark: e.target.value } })}
                  className="w-full rounded-md bg-sl-stone border border-sl-glass-border px-3 py-2 text-sm text-sl-alabaster font-['Bodoni_Moda'] placeholder:text-sl-silver focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="HexaStudio"
                />
              </div>

              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Tagline</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-accent">{settings.siteIdentity.tagline}</span>
                </label>
                <input
                  type="text"
                  value={settings.siteIdentity.tagline}
                  onChange={(e) => update({ siteIdentity: { ...settings.siteIdentity, tagline: e.target.value } })}
                  className="w-full rounded-md bg-sl-stone border border-sl-glass-border px-3 py-2 text-sm text-sl-alabaster font-['Bodoni_Moda'] placeholder:text-sl-silver focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Living Spaces. Visualized."
                />
              </div>

              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Logo URL</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-accent">{settings.siteIdentity.logo || '—'}</span>
                </label>
                <input
                  type="text"
                  value={settings.siteIdentity.logo}
                  onChange={(e) => update({ siteIdentity: { ...settings.siteIdentity, logo: e.target.value } })}
                  className="w-full rounded-md bg-sl-stone border border-sl-glass-border px-3 py-2 text-sm text-sl-alabaster font-['JetBrains_Mono'] placeholder:text-sl-silver focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="https://hexastudio.net/logo.svg"
                />
              </div>
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-300">
            <h3 className="font-['Bodoni_Moda'] text-base text-accent tracking-tight">Hero</h3>
            <p className="text-xs text-sl-silver font-['JetBrains_Mono'] uppercase tracking-widest mb-4">Hero section — the first impression</p>

            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Variant</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-accent">{settings.hero.variant === 'void-garden' ? 'Void Garden' : 'Fracture Ring'}</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => update({ hero: { ...settings.hero, variant: 'void-garden' } })}
                    className={cn(
                      'flex-1 py-2 rounded-md text-xs font-["JetBrains_Mono"] uppercase tracking-wider transition-colors',
                      settings.hero.variant === 'void-garden'
                        ? 'bg-accent text-[#0A0A0B]'
                        : 'bg-sl-stone border border-sl-glass-border text-sl-mist hover:text-sl-alabaster'
                    )}
                  >
                    Void Garden
                  </button>
                  <button
                    onClick={() => update({ hero: { ...settings.hero, variant: 'fracture-ring' } })}
                    className={cn(
                      'flex-1 py-2 rounded-md text-xs font-["JetBrains_Mono"] uppercase tracking-wider transition-colors',
                      settings.hero.variant === 'fracture-ring'
                        ? 'bg-accent text-[#0A0A0B]'
                        : 'bg-sl-stone border border-sl-glass-border text-sl-mist hover:text-sl-alabaster'
                    )}
                  >
                    Fracture Ring
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Monolith Count</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-accent">{settings.hero.monolithCount}</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => update({ hero: { ...settings.hero, monolithCount: Math.max(1, settings.hero.monolithCount - 1) } })}
                    className="w-8 h-8 rounded border border-sl-glass-border flex items-center justify-center hover:bg-sl-glass transition-colors"
                    aria-label="Decrease count"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sl-mist"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                  <span className="w-10 text-center font-['JetBrains_Mono'] text-sm text-accent">{settings.hero.monolithCount}</span>
                  <button
                    onClick={() => update({ hero: { ...settings.hero, monolithCount: settings.hero.monolithCount + 1 } })}
                    className="w-8 h-8 rounded border border-sl-glass-border flex items-center justify-center hover:bg-sl-glass transition-colors"
                    aria-label="Increase count"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sl-mist"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.hero.showChapterRail}
                  onChange={(e) => update({ hero: { ...settings.hero, showChapterRail: e.target.checked } })}
                  className="w-4 h-4 rounded border-sl-glass-border accent-accent cursor-pointer"
                />
                <div>
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Show Chapter Rail</span>
                  <p className="text-[10px] text-sl-silver font-['JetBrains_Mono'] mt-0.5">Display chapter navigation below hero</p>
                </div>
              </label>
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-300">
            <h3 className="font-['Bodoni_Moda'] text-base text-accent tracking-tight">Wrapping</h3>
            <p className="text-xs text-sl-silver font-['JetBrains_Mono'] uppercase tracking-widest mb-4">Footer — the closing statement</p>

            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Kicker</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-accent">{settings.footer.kicker}</span>
                </label>
                <input
                  type="text"
                  value={settings.footer.kicker}
                  onChange={(e) => update({ footer: { ...settings.footer, kicker: e.target.value } })}
                  className="w-full rounded-md bg-sl-stone border border-sl-glass-border px-3 py-2 text-sm text-sl-alabaster font-['JetBrains_Mono'] placeholder:text-sl-silver focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Hexa Studio — Architectural Visualization"
                />
              </div>

              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Call to Action</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-accent">{settings.footer.cta}</span>
                </label>
                <input
                  type="text"
                  value={settings.footer.cta}
                  onChange={(e) => update({ footer: { ...settings.footer, cta: e.target.value } })}
                  className="w-full rounded-md bg-sl-stone border border-sl-glass-border px-3 py-2 text-sm text-sl-alabaster font-['Bodoni_Moda'] placeholder:text-sl-silver focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Let's build — something extraordinary."
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.footer.wordmarkItalic}
                  onChange={(e) => update({ footer: { ...settings.footer, wordmarkItalic: e.target.checked } })}
                  className="w-4 h-4 rounded border-sl-glass-border accent-accent cursor-pointer"
                />
                <div>
                  <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Wordmark Italic</span>
                  <p className="text-[10px] text-sl-silver font-['JetBrains_Mono'] mt-0.5">Display the wordmark in italic serif</p>
                </div>
              </label>
            </div>
          </div>
        );

      case 'css':
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-300">
            <h3 className="font-['Bodoni_Moda'] text-base text-accent tracking-tight">Finishing</h3>
            <p className="text-xs text-sl-silver font-['JetBrains_Mono'] uppercase tracking-widest mb-4">Custom CSS — final refinements</p>

            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="font-['JetBrains_Mono'] text-xs text-sl-mist uppercase tracking-wider">Custom CSS</span>
                <span className="font-['JetBrains_Mono'] text-[10px] text-accent">{settings.customCss ? `${settings.customCss.length} chars` : 'Empty'}</span>
              </label>
              <textarea
                value={settings.customCss}
                onChange={(e) => update({ customCss: e.target.value })}
                rows={8}
                className="w-full rounded-md bg-sl-stone border border-sl-glass-border px-3 py-2 text-xs text-sl-alabaster font-mono placeholder:text-sl-silver focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                placeholder="/* Your custom CSS here */
html {
  scroll-behavior: smooth;
}"
              />
                <p className="text-[10px] text-sl-silver font-['JetBrains_Mono'] mt-2">Injected as a `style` tag on every page. Use sparingly.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <aside className="w-[320px] shrink-0 border-l border-sl-glass-border flex flex-col bg-sl-obsidian/50 animate-in fade-in slide-in-from-left-2 duration-300">
      {/* Tabs */}
      <div className="flex border-b border-sl-glass-border shrink-0">
        {([
          { id: 'colors', label: 'Signature' },
          { id: 'typography', label: 'Voice' },
          { id: 'identity', label: 'Identity' },
          { id: 'hero', label: 'Hero' },
          { id: 'footer', label: 'Wrapping' },
          { id: 'css', label: 'Finishing' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 px-3 py-2.5 text-xs font-["JetBrains_Mono"] uppercase tracking-wider transition-colors relative',
              activeTab === tab.id
                ? 'text-accent bg-sl-gold-subtle/50'
                : 'text-sl-silver hover:text-sl-mist'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-px bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {renderTabContent()}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-3 border-t border-sl-glass-border shrink-0">
        <button
          onClick={onDiscard}
          className="flex-1 py-2 rounded-md text-xs font-['JetBrains_Mono'] uppercase tracking-wider bg-sl-stone border border-sl-glass-border text-sl-silver hover:text-sl-mist hover:border-sl-gold-subtle transition-colors"
        >
          Discard
        </button>
        <button
          onClick={onPublish}
          className="flex-1 py-2 rounded-md text-xs font-['JetBrains_Mono'] uppercase tracking-wider bg-accent text-[#0A0A0B] hover:bg-[#E5C256] transition-colors font-medium"
        >
          Publish
        </button>
      </div>
    </aside>
  );
}
