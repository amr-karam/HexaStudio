"use client";

import { useWebGLContext } from "@/engine/webgl/WebGLContextProvider";
import { useQualityTier } from "@/providers/quality-provider";
import { useEffect, useState, useCallback } from "react";

interface RenderConfig {
  mode: "webgl" | "canvas2d" | "2d-fallback";
  quality: "low" | "medium" | "high";
  reason: string;
}

export function AdaptiveRenderManager() {
  const { state, metrics, requestRecovery } = useWebGLContext();
  const { tier, override } = useQualityTier();
  
  const [renderConfig, setRenderConfig] = useState<RenderConfig>({
    mode: "2d-fallback",
    quality: "low",
    reason: "initializing",
  });
  
  // Determine optimal render configuration based on multiple factors
  const determineOptimalConfig = useCallback(() => {
    // Determine render mode based on WebGL state
    let mode: "webgl" | "canvas2d" | "2d-fallback" = "2d-fallback";
    let reason = "initializing";
    
    if (state === "ready" && metrics.gpuMemoryPressure !== "high") {
      mode = "webgl";
      reason = "webgl-ready-normal-load";
    } else if (state === "ready" && metrics.gpuMemoryPressure === "high") {
      mode = "webgl"; // Still use webgl but with lower quality
      reason = "webgl-ready-high-pressure";
    } else if (state === "recovering" || state === "lost") {
      mode = "2d-fallback";
      reason = state === "recovering" ? "webgl-recovering" : "webgl-lost";
    } else if (state === "failed") {
      mode = "2d-fallback";
      reason = "webgl-failed";
    } else if (state === "initializing") {
      mode = "2d-fallback";
      reason = "webgl-initializing";
    }
    
    // Determine quality level based on override, metrics, and state
    let quality: "low" | "medium" | "high" = tier.level;
    
    if (override !== "auto") {
      // User override takes precedence
      quality = override === "performance" ? "low" : "high";
      reason += "-user-override";
    } else {
      // Automatic quality adjustment
      if (state === "recovering" || state === "lost" || state === "failed") {
        quality = "low";
        reason += "-recovery-mode";
      } else if (metrics.gpuMemoryPressure === "high") {
        quality = "low";
        reason += "-high-memory-pressure";
      } else if (metrics.gpuMemoryPressure === "medium") {
        quality = "medium";
        reason += "-medium-memory-pressure";
      } else {
        quality = "high";
        reason += "-optimal-conditions";
      }
      
      // Additional performance-based adjustments
      if (metrics.frameTimeMs > 33.33) { // Below 30fps
        if (quality === "high") quality = "medium";
        else if (quality === "medium") quality = "low";
        reason += "-frame-rate-drop";
      }
      
      if (metrics.drawCallsPerFrame > 1000) { // High draw calls
        if (quality === "high") quality = "medium";
        reason += "-high-draw-calls";
      }
    }
    
    return { mode, quality, reason };
  }, [state, metrics, tier, override]);

  useEffect(() => {
    const config = determineOptimalConfig();
    setRenderConfig(config);
    
    // If we're in fallback mode and quality is being reduced, trigger recovery attempt
    if (config.mode === "2d-fallback" && (state === "lost" || state === "failed")) {
      // Attempt recovery after a delay to avoid spamming
      const recoveryTimer = setTimeout(() => {
        requestRecovery().then(success => {
          if (!success) {
            console.warn("[AdaptiveRender] Recovery failed, staying in fallback mode");
          }
        });
      }, 5000); // 5 second delay before recovery attempt
      
      return () => clearTimeout(recoveryTimer);
    }
  }, [state, metrics, tier, override, determineOptimalConfig, requestRecovery]);
  
  return renderConfig;
}

// Helper hook for components to easily access render config
export function useAdaptiveRender() {
  return AdaptiveRenderManager();
}

// Custom hook that returns just the mode and quality
export function useRenderMode() {
  const config = AdaptiveRenderManager();
  return {
    mode: config.mode,
    quality: config.quality,
    reason: config.reason,
  };
}

// Hook for getting rendering capabilities based on current state
export function useRenderCapabilities() {
  const { state, metrics, capabilities } = useWebGLContext();
  const config = AdaptiveRenderManager();
  
  return {
    canUseWebGL: state === "ready" || state === "recovering",
    webglState: state,
    gpuMemoryPressure: metrics.gpuMemoryPressure,
    maxTextureSize: capabilities?.maxTextureSize ?? 0,
    recommendedQuality: config.quality,
    renderMode: config.mode,
    shouldReduceDetail: config.quality === "low" || metrics.gpuMemoryPressure === "high",
    shouldUseFallback: config.mode === "2d-fallback",
  };
}
