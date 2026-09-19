'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { usePortalStore } from '@/features/portal/store';
import { EASE } from '@/lib/motion';
import { motion, AnimatePresence } from 'framer-motion';
import { overlay, modalPanel } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* -------------------------------------------------------------------------- */
/*  Design System Data                                                       */
/* -------------------------------------------------------------------------- */

const COLOR_PALETTE = {
  '60% — Void': [
    { name: 'Void', hex: '#050505', css: '--color-void', tailwind: 'bg-background' },
    { name: 'Void Deep', hex: '#020203', css: '--color-void-deep', tailwind: 'bg-void-deep' },
    { name: 'Obsidian', hex: '#0F0F10', css: '--color-obsidian', tailwind: 'bg-obsidian' },
    { name: 'Obsidian Raised', hex: '#161618', css: '--color-obsidian-raised', tailwind: 'bg-obsidian-raised' },
    { name: 'Slate', hex: '#1A1A1A', css: '--color-slate', tailwind: 'bg-surface' },
  ],
  '30% — Surface': [
    { name: 'Slate', hex: '#1A1A1A', css: '--color-slate', tailwind: 'bg-surface' },
    { name: 'Sl-alabaster', hex: '#FAFAF8', css: '--color-sl-alabaster', tailwind: 'bg-sl-alabaster' },
    { name: 'Silver', hex: '#A0A0A0', css: '--color-text-secondary', tailwind: 'text-text-secondary' },
    { name: 'Mist', hex: '#6A6A6E', css: '--color-text-muted', tailwind: 'text-text-muted' },
    { name: 'Onyx', hex: '#1a1a1a', css: '--color-sl-onyx', tailwind: 'bg-sl-onyx' },
  ],
  '10% — Gold': [
    { name: 'Gold', hex: '#D4AF37', css: '--color-gold', tailwind: 'bg-accent' },
    { name: 'Gold Bright', hex: '#E5C76B', css: '--color-gold-bright', tailwind: 'text-accent-light' },
    { name: 'Gold Muted', hex: '#c9a227', css: '--color-sl-gold-muted', tailwind: 'bg-sl-gold-muted' },
    { name: 'Gold Ink', hex: '#b8860b', css: '--color-sl-gold-ink', tailwind: 'bg-sl-gold-ink' },
    { name: 'Gold Deep', hex: '#A8862E', css: '--color-gold-deep', tailwind: 'bg-accent-dark' },
  ],
} as const;

const GLASSMORPHISM_TOKENS = [
  { name: 'artisan-glass', bg: 'rgba(18, 18, 20, 0.55)', blur: 24, border: 'rgba(255, 255, 255, 0.08)', shadow: '0 24px 60px rgba(0,0,0,0.55)' },
  { name: 'artisan-glass-gold', bg: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(18,18,20,0.8))', blur: 24, border: 'rgba(212,175,55,0.3)', shadow: 'inset 0 1px 0 rgba(229,199,107,0.35)' },
  { name: 'artisan-specular-top', bg: 'linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0))', blur: 0, border: 'none', shadow: 'none' },
  { name: 'artisan-gold-reflection', bg: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(229,199,107,0.02), rgba(184,134,11,0))', blur: 0, border: 'none', shadow: 'none' },
] as const;

const TYPOGRAPHY_SCALE = [
  { token: 'h1', font: 'Playfair Display', size: 'clamp(2.5rem, 6vw, 4.5rem)', weight: '400–900', tracking: 'tracking-tighter', purpose: 'Serif display headings' },
  { token: 'h2', font: 'Playfair Display', size: 'clamp(2rem, 5vw, 3.5rem)', weight: '400–900', tracking: 'tracking-tighter', purpose: 'Serif sub-headings' },
  { token: 'h3', font: 'Bodoni Moda', size: 'clamp(1.5rem, 4vw, 2.5rem)', weight: '400–900', tracking: 'tracking-normal', purpose: 'Luxury editorial headings' },
  { token: 'body', font: 'Inter', size: '1rem', weight: '100–900', tracking: 'default', purpose: 'Body & UI copy' },
  { token: 'mono', font: 'JetBrains Mono', size: '0.875rem', weight: '100–800', tracking: 'tracking-[0.4em]', purpose: 'Timestamps, code, IDs' },
  { token: 'label', font: 'JetBrains Mono', size: '0.75rem', weight: '400', tracking: 'tracking-[0.4em]', purpose: 'Eyebrows & section markers' },
] as const;

const MOTION_EASINGS = [
  { name: 'entrance', bezier: `cubic-bezier(${EASE.entrance.join(',')})`, label: 'Smooth deceleration — entrances, reveals', duration: '0.4s' },
  { name: 'cinematic', bezier: `cubic-bezier(${EASE.cinematic.join(',')})`, label: 'Symmetric cinematic — page transitions', duration: '0.7s' },
  { name: 'interaction', bezier: `cubic-bezier(${EASE.interaction.join(',')})`, label: 'Bouncy spring — button hover, tooltips', duration: '0.2s' },
  { name: 'transition', bezier: `cubic-bezier(${EASE.transition.join(',')})`, label: 'Balanced — modal opens, page slides', duration: '0.8s' },
  { name: 'sharp', bezier: `cubic-bezier(${EASE.sharp.join(',')})`, label: 'Fast, precise — error messages, toggles', duration: '0.2s' },
] as const;

const MOTION_DURATIONS = [
  { name: 'micro', value: '0.2s', purpose: 'Hover states, cursor feedback' },
  { name: 'component', value: '0.4s', purpose: 'UI chrome, component transitions' },
  { name: 'scene', value: '0.8s', purpose: 'Scene-scale movement, hero imagery' },
  { name: 'transition', value: '0.7s', purpose: 'Full page-transition envelope' },
  { name: 'page', value: '0.75s', purpose: 'Page-level transitions' },
  { name: 'camera', value: '1.4s', purpose: '3D camera moves' },
] as const;

/* -------------------------------------------------------------------------- */
/*  Swatch Component                                                        */
/* -------------------------------------------------------------------------- */

function ColorSwatch({ name, hex, cssVar, tailwind }: { name: string; hex: string; cssVar: string; tailwind: string }) {
  return (
    <div className="group relative rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:scale-[1.02]">
      <div className={cn('h-24', tailwind)} />
      <div className="p-3 bg-sl-void/80 backdrop-blur-sm">
        <p className="text-xs font-['JetBrains_Mono'] text-sl-alabaster font-bold">{name}</p>
        <p className="text-[10px] font-['JetBrains_Mono'] text-sl-mist/60">{hex}</p>
        <p className="text-[9px] font-['JetBrains_Mono'] text-sl-gold-subtle/60">{cssVar}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Palette Overlay (Ctrl+Shift+D)                                          */
/* -------------------------------------------------------------------------- */

function DesignPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = usePortalStore();
  const prefersReduced = useReducedMotion();

  useKeyboardShortcut('d', () => setCommandPaletteOpen(!isCommandPaletteOpen), { ctrlCmd: true, shift: true });

  if (!isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={overlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        custom={prefersReduced}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl"
        onClick={() => setCommandPaletteOpen(false)}
      >
        <motion.div
          variants={modalPanel}
          initial="hidden"
          animate="visible"
          exit="exit"
          custom={prefersReduced}
          className="relative w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto rounded-2xl border border-gold/30 bg-obsidian/95 backdrop-blur-xl p-8 shadow-2xl shadow-black/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Bodoni_Moda'] text-xl text-accent italic">Design Palette</h2>
            <kbd className="text-[10px] font-mono text-sl-mist/60 border border-sl-silver/20 rounded px-2 py-1">Ctrl+Shift+D</kbd>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.4em] text-sl-gold-subtle mb-4">60-30-10 Color System</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(COLOR_PALETTE).map(([category, colors]) => (
                  <div key={category}>
                    <p className="text-[10px] font-mono text-sl-mist/60 uppercase tracking-wider mb-2">{category}</p>
                    <div className="space-y-2">
                      {colors.map((c) => (
                        <ColorSwatch key={c.name} name={c.name} hex={c.hex} cssVar={c.css} tailwind={c.tailwind} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.4em] text-sl-gold-subtle mb-4">Glassmorphism Tokens</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GLASSMORPHISM_TOKENS.map((g) => (
                  <div key={g.name} className="rounded-xl border border-white/10 p-4 bg-sl-void/60">
                    <div
                      className="h-20 rounded-lg mb-3 border transition-all duration-300"
                      style={{
                        background: g.bg,
                        backdropFilter: `blur(${g.blur}px)`,
                        borderColor: g.border,
                        boxShadow: g.shadow,
                      }}
                    />
                    <p className="text-sm font-['JetBrains_Mono'] text-sl-alabaster">{g.name}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.4em] text-sl-gold-subtle mb-4">Motion Easings</h3>
              <div className="space-y-3">
                {MOTION_EASINGS.map((e) => (
                  <div key={e.name} className="flex items-center gap-4 p-3 rounded-lg bg-sl-void/40 border border-white/5">
                    <code className="text-xs font-mono text-accent min-w-[120px]">{e.bezier}</code>
                    <span className="text-xs text-sl-mist/60 flex-1">{e.label}</span>
                    <span className="text-[10px] font-mono text-sl-mist/40">{e.duration}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section Components                                                        */
/* -------------------------------------------------------------------------- */

function ColorSection() {
  return (
    <section className="space-y-6">
      <h2 className="font-['Bodoni_Moda'] text-2xl text-accent italic">60-30-10 Color System</h2>
      <p className="text-sm text-sl-mist/60 font-['JetBrains_Mono']">HEXA STUDIO enforces a strict 60-30-10 architectural color balance across all interfaces.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(COLOR_PALETTE).map(([category, colors]) => (
          <div key={category}>
            <h3 className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.4em] text-sl-gold-subtle mb-3">{category}</h3>
            <div className="space-y-2">
              {colors.map((c) => (
                <ColorSwatch key={c.name} name={c.name} hex={c.hex} cssVar={c.css} tailwind={c.tailwind} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GlassmorphismSection() {
  return (
    <section className="space-y-6">
      <h2 className="font-['Bodoni_Moda'] text-2xl text-accent italic">Glassmorphism Tokens</h2>
      <p className="text-sm text-sl-mist/60 font-['JetBrains_Mono']">Backdrop blur MUST use `backdrop-blur-xl` combined with `border-white/10` or `border-gold/30`.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GLASSMORPHISM_TOKENS.map((g) => (
          <div key={g.name} className="rounded-xl border border-white/10 p-5 bg-sl-void/60 space-y-3">
            <div
              className="h-24 rounded-xl transition-all duration-300"
              style={{
                background: g.bg,
                backdropFilter: `blur(${g.blur}px)`,
                borderColor: g.border,
                boxShadow: g.shadow,
              }}
            />
            <div>
              <p className="text-sm font-['JetBrains_Mono'] text-sl-alabaster">{g.name}</p>
              <p className="text-[10px] font-mono text-sl-mist/60">bg: {typeof g.bg === 'string' && g.bg.startsWith('linear') ? 'gradient' : g.bg}</p>
              <p className="text-[10px] font-mono text-sl-mist/60">blur: {g.blur}px | border: {g.border}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TypographySection() {
  return (
    <section className="space-y-6">
      <h2 className="font-['Bodoni_Moda'] text-2xl text-accent italic">Typography Scale</h2>
      <p className="text-sm text-sl-mist/60 font-['JetBrains_Mono']">
        Headings: <span className="text-accent">Playfair Display</span> · Body: <span className="text-accent">Inter</span> · Mono: <span className="text-accent">JetBrains Mono</span>
      </p>
      <div className="space-y-3">
        {TYPOGRAPHY_SCALE.map((t) => (
          <div key={t.token} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg bg-sl-void/40 border border-white/5">
            <code className="text-xs font-mono text-accent min-w-[80px]">{t.token}</code>
            <div className="flex-1">
              <p className="text-sl-alabaster text-sm font-['Inter']">{t.purpose}</p>
              <p className="text-[10px] font-mono text-sl-mist/60">{t.font} · {t.size} · {t.weight}</p>
            </div>
            <span className="text-[10px] font-mono text-sl-mist/40 tracking-wider">{t.tracking}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function MotionSection() {
  return (
    <section className="space-y-6">
      <h2 className="font-['Bodoni_Moda'] text-2xl text-accent italic">Motion Easings</h2>
      <p className="text-sm text-sl-mist/60 font-['JetBrains_Mono']">Canonical easing curves — never use raw cubic-bezier in components.</p>
      <div className="space-y-3">
        {MOTION_EASINGS.map((e) => (
          <div key={e.name} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg bg-sl-void/40 border border-white/5">
            <code className="text-xs font-mono text-accent min-w-[120px]">{e.name}</code>
            <code className="text-[10px] font-mono text-sl-mist/60 flex-1">{e.bezier}</code>
            <span className="text-xs text-sl-alabaster flex-1">{e.label}</span>
            <span className="text-[10px] font-mono text-sl-mist/40">{e.duration}</span>
          </div>
        ))}
      </div>

      <h3 className="font-['Bodoni_Moda'] text-lg text-sl-alabaster mt-8">Durations</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MOTION_DURATIONS.map((d) => (
          <div key={d.name} className="p-3 rounded-lg bg-sl-void/40 border border-white/5">
            <p className="text-xs font-mono text-accent">{d.name}</p>
            <p className="text-[10px] font-mono text-sl-mist/60">{d.value}</p>
            <p className="text-[10px] text-sl-mist/40">{d.purpose}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                               */
/* -------------------------------------------------------------------------- */

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<'colors' | 'glass' | 'typography' | 'motion'>('colors');
  const { setCommandPaletteOpen } = usePortalStore();

  useKeyboardShortcut('d', () => setCommandPaletteOpen(true), { ctrlCmd: true, shift: true });

  const tabs = [
    { id: 'colors' as const, label: 'Colors' },
    { id: 'glass' as const, label: 'Glassmorphism' },
    { id: 'typography' as const, label: 'Typography' },
    { id: 'motion' as const, label: 'Motion' },
  ];

  return (
    <main className="min-h-screen bg-sl-void text-sl-alabaster">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-24">
          <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.4em] text-accent mb-4">Evey Design System</p>
          <h1 className="font-['Playfair_Display'] text-4xl sm:text-6xl font-normal tracking-tighter leading-[0.95] mb-6">
            Design Tokens &amp; System
          </h1>
          <p className="text-lg text-sl-mist/60 font-['Inter'] max-w-2xl">
            Canonical design tokens for HEXA STUDIO — 60-30-10 color balance, glassmorphism tokens, typography scale, and motion easings.
          </p>
          <div className="flex items-center gap-3 mt-8">
            <kbd className="text-[10px] font-mono text-sl-mist/60 border border-white/10 rounded px-2 py-1">Ctrl+Shift+D</kbd>
            <span className="text-xs text-sl-mist/40">Quick palette</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-sl-void/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-3 text-xs font-mono uppercase tracking-[0.2em] transition-colors duration-200 border-b-2',
                  activeTab === tab.id
                    ? 'text-accent border-accent'
                    : 'text-sl-mist/60 border-transparent hover:text-sl-alabaster'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE.transition }}
          >
            {activeTab === 'colors' && <ColorSection />}
            {activeTab === 'glass' && <GlassmorphismSection />}
            {activeTab === 'typography' && <TypographySection />}
            {activeTab === 'motion' && <MotionSection />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Palette Overlay */}
      <DesignPalette />
    </main>
  );
}
