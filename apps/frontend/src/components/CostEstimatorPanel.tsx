"use client";

import { useState, useCallback } from "react";
import { getAllMaterials } from "@/lib/materials/MaterialLibrary";
import type { EgyptianMaterial } from "@/lib/materials/MaterialLibrary";

interface CostEstimateSummary {
  materialsUsed: number;
  totalCostEGP: number;
}

interface CostEstimateResponse {
  success?: boolean;
  summary?: CostEstimateSummary;
  error?: string;
}

interface CostEstimatorPanelProps {
  onEstimateGenerated?: (data: CostEstimateResponse) => void;
}

export default function CostEstimatorPanel({ onEstimateGenerated }: CostEstimatorPanelProps) {
  const [materials] = useState<EgyptianMaterial[]>(getAllMaterials());
  const [surfaceAreas, setSurfaceAreas] = useState<Record<string, number>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [estimate, setEstimate] = useState<CostEstimateResponse | null>(null);
  const [projectName, setProjectName] = useState("HEXA Studio Cost Estimate");

  const handleAreaChange = useCallback(
    (materialId: string, area: number) => {
      setSurfaceAreas((prev) => ({ ...prev, [materialId]: area }));
    },
    []
  );

  const calculateEstimate = useCallback(async () => {
    if (Object.keys(surfaceAreas).length === 0) return;
    setIsCalculating(true);
    try {
      const resp = await fetch("/api/cost-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "calculate",
          payload: { surfaceAreas, projectName },
        }),
      });
      const data = (await resp.json()) as CostEstimateResponse;
      setEstimate(data);
      onEstimateGenerated?.(data);
    } catch (err: unknown) {
      console.error("Estimate failed:", err);
    } finally {
      setIsCalculating(false);
    }
  }, [surfaceAreas, projectName, onEstimateGenerated]);

  const generatePdf = useCallback(async () => {
    if (Object.keys(surfaceAreas).length === 0) return;
    setIsGeneratingPdf(true);
    try {
      const resp = await fetch("/api/cost-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pdf",
          payload: { surfaceAreas, projectName },
        }),
      });

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [surfaceAreas, projectName]);

  const totalArea = Object.values(surfaceAreas).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-sl-card border border-sl-border rounded-lg p-4 space-y-4 text-sm">
      <h3 className="text-sl-gold font-medium text-xs uppercase tracking-wider">
        Cost Estimator
      </h3>

      <div>
        <label htmlFor="ce-project" className="text-xs text-sl-muted">Project Name</label>
        <input
          id="ce-project"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full mt-1 px-2 py-1.5 rounded bg-sl-void border border-sl-border text-sl-alabaster text-xs"
          placeholder="Project name"
        />
      </div>

      <div className="space-y-2">
        <span className="text-xs text-sl-muted" id="ce-areas-label">Surface Areas (m²)</span>
        {materials.map((m) => (
          <div key={m.id} className="flex items-center gap-2 text-xs">
            <span className="w-32 text-sl-muted truncate" id={`ce-name-${m.id}`}>{m.name}</span>
            <span className="text-sl-gold w-16 text-right">
              {m.basePriceEGP.toLocaleString()} EGP
            </span>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="0.0"
              aria-labelledby={`ce-name-${m.id} ce-areas-label`}
              onChange={(e) =>
                handleAreaChange(m.id, parseFloat(e.target.value) || 0)
              }
              className="w-16 px-1.5 py-1 rounded bg-sl-void border border-sl-border text-sl-alabaster text-xs text-right"
            />
            <span className="w-16 text-xs text-sl-muted">m²</span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-sl-border text-xs text-sl-muted">
        Total area: <span className="text-sl-alabaster font-medium">{totalArea.toFixed(2)} m²</span>
      </div>

      {estimate?.success && estimate.summary && (
        <div className="pt-2 border-t border-sl-border space-y-2">
          <div className="flex justify-between text-xs">
            <span>Materials used</span>
            <span className="text-sl-alabaster">{estimate.summary.materialsUsed}</span>
          </div>
          <div className="flex justify-between text-xs font-medium">
            <span>Total cost</span>
            <span className="text-sl-gold">
              {estimate.summary.totalCostEGP.toLocaleString()} EGP
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={calculateEstimate}
          disabled={isCalculating || Object.keys(surfaceAreas).length === 0}
          className="flex-1 px-3 py-1.5 rounded bg-sl-card border border-sl-gold text-sl-gold text-xs hover:bg-sl-surface disabled:opacity-50 transition-colors"
        >
          {isCalculating ? "Calculating…" : "Calculate"}
        </button>
        <button
          onClick={generatePdf}
          disabled={
            isGeneratingPdf ||
            !estimate?.success ||
            Object.keys(surfaceAreas).length === 0
          }
          className="flex-1 px-3 py-1.5 rounded bg-sl-gold text-sl-void text-xs font-medium hover:bg-sl-gold/80 disabled:opacity-50 transition-colors"
        >
          {isGeneratingPdf ? "Generating…" : "Export PDF"}
        </button>
      </div>

      <p className="text-xs text-sl-muted text-center">
        Self-hosted • EGP pricing • Offline PDF
      </p>
    </div>
  );
}
