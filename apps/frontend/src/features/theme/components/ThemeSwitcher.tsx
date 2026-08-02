'use client';

/**
 * Code Lens / HEXA Studio — Multi-Tenant White-Label Studio Theme Switcher
 */

import React from 'react';
import { useThemeStore, LuxuryTheme } from '../store/useThemeStore';

export function ThemeSwitcher() {
  const { currentTheme, setTheme } = useThemeStore();

  const themes: { id: LuxuryTheme; label: string; bg: string; border: string }[] = [
    { id: 'gold_obsidian', label: 'Gold & Obsidian', bg: 'bg-amber-500', border: 'border-amber-400' },
    { id: 'silver_slate', label: 'Silver & Slate', bg: 'bg-slate-300', border: 'border-slate-200' },
    { id: 'emerald_charcoal', label: 'Emerald & Charcoal', bg: 'bg-emerald-400', border: 'border-emerald-300' },
  ];

  return (
    <div className="bg-neutral-950/80 border border-neutral-800 rounded-full p-1.5 backdrop-blur-xl flex items-center space-x-1 shadow-2xl">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            currentTheme === t.id
              ? 'bg-neutral-900 text-neutral-100 shadow-md border border-neutral-700'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${t.bg}`} />
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
