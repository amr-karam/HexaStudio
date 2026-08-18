"use client";

import { useQualityTier } from "@/providers/quality-provider";
import { useWebGLContext } from "@/engine/webgl/WebGLContextProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/cards/Card";
import { useState, useEffect } from "react";

/**
 * QualitySettingsPanel — Lets users manually adjust quality tier.
 * 
 * Controls map to QualityProvider's setOverride function:
 *   "performance" → forces low quality
 *   "quality" → forces high quality
 *   "auto" → intelligent detection (default)
 */
export function QualitySettingsPanel() {
  const { setOverride } = useQualityTier();
  const { state: webglState } = useWebGLContext();
  
  const [manualTier, setManualTier] = useState<"low" | "medium" | "high" | "auto">("auto");
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Sync manual tier with provider state
  useEffect(() => {
    if (manualTier === "auto") {
      setOverride("auto");
    }
  }, [manualTier, setOverride]);
  
  // Track recovery attempts
  useEffect(() => {
    if (webglState === "recovering" || webglState === "lost") {
      setIsRecovering(true);
    } else {
      setIsRecovering(false);
    }
  }, [webglState]);
  
  const handleTierChange = (tier: "low" | "medium" | "high" | "auto") => {
    setManualTier(tier);
    // Map UI tier to provider override
    switch (tier) {
      case "low":
        setOverride("performance");
        break;
      case "high":
        setOverride("quality");
        break;
      case "auto":
        setOverride("auto");
        break;
      default:
        setOverride("auto");
    }
  };
  
  const qualityReasons: Record<"low" | "medium" | "high" | "auto", string> = {
    auto: "Auto-detect based on device",
    low: "Manual: Performance mode",
    medium: "Manual: Balanced mode",
    high: "Manual: Quality mode",
  };
  
  return (
    <Card className="p-6 space-y-4 max-w-md">
      <h3 className="text-xl font-semibold mb-2">Quality Settings</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {webglState === "recovering"
          ? "Recovering from context loss"
          : qualityReasons[manualTier]}
      </p>
      
      {/* Current status display */}
      <div className="border rounded p-3 mb-4">
        <p className="font-medium">Current Mode:</p>
        <p className={cn("mb-1", {
          "text-green-600": manualTier === "auto",
          "text-yellow-600": manualTier === "low" || manualTier === "high",
          "text-red-600": webglState === "recovering",
        })}>
          {webglState === "recovering" ? "Recovering..." : manualTier}
        </p>
        {isRecovering && (
          <p className="text-xs text-muted-foreground">Attempting WebGL context recovery...</p>
        )}
      </div>
      
      {/* Quality Tier Selector */}
      <div>
        <p className="font-semibold mb-2">Select Quality Tier:</p>
        <div className="space-y-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTierChange("auto")}
            className={cn(
              "w-full",
              { "bg-primary/10 text-primary": manualTier === "auto" }
            )}
          >
            Auto (Recommended)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTierChange("low")}
            className={cn(
              "w-full",
              { "bg-amber/10 text-amber": manualTier === "low" }
            )}
          >
            Performance
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTierChange("high")}
            className={cn(
              "w-full",
              { "bg-emerald/10 text-emerald": manualTier === "high" }
            )}
          >
            Quality
          </Button>
        </div>
      </div>
      
      {/* Manual override info */}
      <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
        <p>Note: Manual selections override automatic detection.</p>
        <p className="mt-1">
          • <span className="font-medium">Performance</span>: Reduces triangle count, disables shadows and post-processing.
          • <span className="font-medium">Quality</span>: Maximum triangle count, full PBR effects enabled.
          • <span className="font-medium">Auto</span>: Intelligent detection based on GPU, CPU, and connection.
        </p>
      </div>
    </Card>
  );
}
