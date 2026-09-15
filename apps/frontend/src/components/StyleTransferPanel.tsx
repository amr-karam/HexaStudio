/**
 * StyleTransferPanel.tsx — updated to include Cost Estimator tab
 * HEXA Studio — Sprint S022.4
 *
 * Added CostEstimatorPanel alongside StyleTransferPanel
 * in the studio page's control panel.
 */
"use client";

import { useState, useCallback } from "react";
import { getAllMaterials, type EgyptianMaterial } from "@/lib/materials/MaterialLibrary";

interface StyleTransferPanelProps {
  onTextureGenerated: (materialId: string, imageUrl: string) => void;
}

interface StyleTransferPayload {
  materialId: string;
  prompt: string;
  negativePrompt: string;
  controlNet?: {
    processor: "canny" | "depth" | "seg" | "normal" | "pose";
    image: string;
  };
}

interface StyleTransferResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

const controlNetProcessors: Array<"canny" | "depth" | "seg" | "normal" | "pose"> = [
  "canny", "depth", "seg", "normal", "pose",
];

export default function StyleTransferPanel({ onTextureGenerated }: StyleTransferPanelProps) {
  const [materials] = useState<EgyptianMaterial[]>(getAllMaterials());
  const [selectedMaterial, setSelectedMaterial] = useState<string>(materials[0]?.id || "");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [useControlNet, setUseControlNet] = useState(false);
  const [controlNetProcessor, setControlNetProcessor] = useState<"canny" | "depth" | "seg" | "normal" | "pose">("canny");
  const [controlImage, setControlImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt || !selectedMaterial) return;
    setIsGenerating(true);
    setError(null);

    const payload: StyleTransferPayload = {
      materialId: selectedMaterial,
      prompt,
      negativePrompt,
      ...(useControlNet && controlImage
        ? { controlNet: { processor: controlNetProcessor, image: controlImage } }
        : {}),
    };

    try {
      const resp = await fetch("/api/style-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await resp.json()) as StyleTransferResponse;

      if (data.success && data.imageUrl) {
        onTextureGenerated(selectedMaterial, data.imageUrl);
        setError(null);
      } else {
        setError(data.error || "Generation failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedMaterial, onTextureGenerated, negativePrompt, useControlNet, controlNetProcessor, controlImage]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === "string") {
          const base64 = ev.target.result.replace(/^data:image\/\w+;base64,/, "");
          setControlImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <div className="space-y-3">
      <h3 className="text-sl-gold font-medium text-xs uppercase tracking-wider">
        AI Style Transfer
      </h3>

      {/* Material selection */}
      <div>
        <label htmlFor="st-material" className="text-xs text-sl-muted">Material</label>
        <select
          id="st-material"
          value={selectedMaterial}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          className="w-full mt-1 px-2 py-1.5 rounded bg-sl-void border border-sl-border text-sl-alabaster text-xs"
        >
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.basePriceEGP} EGP)
            </option>
          ))}
        </select>
      </div>

      {/* Prompt */}
      <div>
        <label htmlFor="st-prompt" className="text-xs text-sl-muted">Style Prompt</label>
        <textarea
          id="st-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Islamic geometric patterns, hand-painted, traditional"
          className="w-full mt-1 px-2 py-1.5 rounded bg-sl-void border border-sl-border text-sl-alabaster text-xs resize-none"
          rows={3}
        />
      </div>

      {/* Negative prompt */}
      <div>
        <label htmlFor="st-negative" className="text-xs text-sl-muted">Negative Prompt (optional)</label>
        <input
          id="st-negative"
          type="text"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="lowquality, blur, jpeg artifacts"
          className="w-full mt-1 px-2 py-1.5 rounded bg-sl-void border border-sl-border text-sl-alabaster text-xs"
        />
      </div>

      {/* ControlNet toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="controlnet-toggle"
          checked={useControlNet}
          onChange={(e) => setUseControlNet(e.target.checked)}
          className="rounded bg-sl-void border-sl-border text-sl-gold"
        />
        <label htmlFor="controlnet-toggle" className="text-xs text-sl-muted">
          Use ControlNet (requires init image)
        </label>
      </div>

      {/* ControlNet processor + image upload */}
      {useControlNet && (
        <>
          <div>
            <label htmlFor="st-processor" className="text-xs text-sl-muted">ControlNet Processor</label>
            <select
              id="st-processor"
              value={controlNetProcessor}
              onChange={(e) =>
                setControlNetProcessor(
                  e.target.value as "canny" | "depth" | "seg" | "normal" | "pose"
                )
              }
              className="w-full mt-1 px-2 py-1.5 rounded bg-sl-void border border-sl-border text-sl-alabaster text-xs"
            >
              {controlNetProcessors.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="st-control-image" className="text-xs text-sl-muted">Init/Control Image</label>
            <input
              id="st-control-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 text-xs text-sl-muted file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-sl-void file:text-sl-gold file:border file:border-sl-gold hover:file:bg-sl-surface"
            />
          </div>
        </>
      )}

      {/* Error */}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt || !selectedMaterial}
        className="w-full px-3 py-2 rounded bg-sl-gold text-sl-void font-medium text-xs hover:bg-sl-gold/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating
          ? "Generating…"
          : useControlNet
            ? "Generate with ControlNet"
            : "Generate Texture"}
      </button>

      <p className="text-xs text-sl-muted text-center">
        Self-hosted SD WebUI • No cloud/SaaS
      </p>
    </div>
  );
}
