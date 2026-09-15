'use client'

import { useState, useCallback } from 'react'
import ArchvizViewer from '@/components/ArchvizViewer'
import SeasonPresetControls from '@/components/SeasonPresetControls'
import StyleTransferPanel from '@/components/StyleTransferPanel'
import CostEstimatorPanel from '@/components/CostEstimatorPanel'
import AssetBrowser from '@/components/AssetBrowser'
import type { ScenePreset } from '@/lib/presets/SeasonPresetLibrary'
import { getRamadanPreset } from '@/lib/presets/SeasonPresetLibrary'

/**
 * Studio / Experience — full 3D architectural visualization with
 * Season Preset controls (S022.2), AI Style Transfer (S022.3),
 * and Cost Estimator (S022.4).
 *
 * NOTE: `metadata` is exported via studio/metadata.ts (Server Component)
 * to avoid the Next.js error:
 * "You are attempting to export 'metadata' from a component marked with
 * 'use client', which is disallowed."
 */
export default function StudioPage() {
  const [activePreset, setActivePreset] = useState<ScenePreset>(getRamadanPreset())

  const handlePresetChange = useCallback((preset: ScenePreset) => {
    setActivePreset(preset)
  }, [])

  const handleTextureGenerated = useCallback((materialId: string, imageUrl: string) => {
    console.log(`[Studio] Texture generated for ${materialId}: ${imageUrl}`)
    // In a full implementation, this would trigger a texture reload on the ArchvizModel
  }, [])

  return (
    <div className="fixed inset-0 bg-sl-void text-sl-alabaster overflow-hidden">
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-3 max-w-xs w-full">
        {/* Season preset selector */}
        <SeasonPresetControls
          onPresetChange={handlePresetChange}
          activePresetId={activePreset.id}
        />

        {/* AI Style Transfer panel */}
        <StyleTransferPanel
          onTextureGenerated={handleTextureGenerated}
        />

        {/* Cost Estimator panel */}
        <CostEstimatorPanel />

        {/* 3D Asset Browser (Sprint S022.5) */}
        <AssetBrowser
          onModelSelected={(url: string, id: string) =>
            console.log(`[Studio] Model selected: ${id} → ${url}`)
          }
        />
      </div>

      <main className="absolute inset-0 pt-14">
        <ArchvizViewer preset={activePreset} />
      </main>
    </div>
  )
}
