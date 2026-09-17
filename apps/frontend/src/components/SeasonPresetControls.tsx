"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { getAllPresets, getPreset, type ScenePreset } from "@/lib/presets/SeasonPresetLibrary"

interface SeasonPresetControlsProps {
  onPresetChange: (preset: ScenePreset) => void
  activePresetId: string
  /** Compact density for embedding inside hero frames. */
  compact?: boolean
  className?: string
}

const themeIcons: Record<string, string> = {
  ramadan: "🕌",
  winter: "❄️",
  summer: "☀️",
  autumn: "🍂",
}

export default function SeasonPresetControls({ onPresetChange, activePresetId, compact = false, className = "" }: SeasonPresetControlsProps) {
  const presets = getAllPresets()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const handleSelect = useCallback(
    (id: string) => {
      const preset = getPreset(id)
      if (preset) {
        onPresetChange(preset)
        setOpen(false)
      }
    },
    [onPresetChange]
  )

  // Close on Escape or outside pointer — the dropdown is transient UI.
  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const active = presets.find((p) => p.id === activePresetId) ?? presets[0]
  if (!active) return null

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sl-card border border-sl-border text-sl-alabaster text-sm hover:bg-sl-surface transition-colors"
        aria-label="Select scene preset"
      >
        <span aria-hidden="true">{themeIcons[active.theme] ?? "🎨"}</span>
        <span>{active.name}</span>
        <svg aria-hidden="true" className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div role="listbox" aria-label="Scene presets" className="absolute top-full left-0 mt-2 w-64 bg-sl-card border border-sl-border rounded-lg shadow-xl z-50 overflow-hidden">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              role="option"
              aria-selected={activePresetId === preset.id}
              onClick={() => handleSelect(preset.id)}
              className={`w-full text-left px-4 ${compact ? "py-2" : "py-3"} text-sm hover:bg-sl-surface transition-colors ${activePresetId === preset.id ? "bg-sl-surface text-sl-gold" : "text-sl-alabaster"}`}
            >
              <div className="flex items-center gap-2">
                <span aria-hidden="true">{themeIcons[preset.theme] ?? "🎨"}</span>
                <span className="font-medium">{preset.name}</span>
              </div>
              {!compact && <p className="text-xs text-sl-muted mt-0.5">{preset.description}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
