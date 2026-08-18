"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type WebGLContextState = 
  | "initializing" 
  | "ready" 
  | "lost" 
  | "recovering" 
  | "fallback" 
  | "failed";

export interface WebGLCapabilities {
  webgl2: boolean;
  maxTextureSize: number;
  maxVertexAttribs: number;
  maxVaryingVectors: number;
  maxFragmentUniformVectors: number;
  maxVertexUniformVectors: number;
  maxVertexTextureImageUnits: number;
  maxCombinedTextureImageUnits: number;
  maxTextureImageUnits: number;
  maxRenderbufferSize: number;
  maxViewportDims: [number, number];
  renderer: string;
  vendor: string;
  version: string;
  shadingLanguageVersion: string;
  extensions: string[];
}

export interface WebGLMetrics {
  drawCallsPerFrame: number;
  trianglesPerFrame: number;
  textureMemoryMB: number;
  bufferMemoryMB: number;
  shaderCompileTimeMs: number;
  contextLossCount: number;
  lastContextLoss: number | null;
  frameTimeMs: number;
  gpuMemoryPressure: "low" | "medium" | "high";
}

export interface WebGLContextValue {
  gl: WebGL2RenderingContext | WebGLRenderingContext | null;
  canvas: HTMLCanvasElement | null;
  state: WebGLContextState;
  capabilities: WebGLCapabilities | null;
  metrics: WebGLMetrics;
  requestRecovery: () => Promise<boolean>;
  requestFallback: () => void;
  onStateChange: (callback: (state: WebGLContextState) => void) => () => void;
  setQualityTier: (tier: "low" | "medium" | "high") => void;
  renderState: WebGLAdaptiveRenderState;
}

export interface WebGLAdaptiveRenderState {
  renderMode: "webgl" | "canvas2d" | "2d-fallback";
  shouldRender: boolean;
  qualityLevel: "low" | "medium" | "high";
}

const DEFAULT_METRICS: WebGLMetrics = {
  drawCallsPerFrame: 0,
  trianglesPerFrame: 0,
  textureMemoryMB: 0,
  bufferMemoryMB: 0,
  shaderCompileTimeMs: 0,
  contextLossCount: 0,
  lastContextLoss: null,
  frameTimeMs: 16.67,
  gpuMemoryPressure: "low",
};

const DEFAULT_RENDER_STATE: WebGLAdaptiveRenderState = {
  renderMode: "2d-fallback",
  shouldRender: false,
  qualityLevel: "low",
};

const WebGLContext = createContext<WebGLContextValue | null>(null);

/* -------------------------------------------------------------------------- */
/*  Capability Detection                                                       */
/* -------------------------------------------------------------------------- */

function detectCapabilities(gl: WebGL2RenderingContext | WebGLRenderingContext): WebGLCapabilities {
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const isWebGL2 = gl instanceof WebGL2RenderingContext;
  
  const getExtensions = () => {
    const exts: string[] = [];
    let extensionName: string;
    const availableExtensions = gl.getSupportedExtensions() || [];
    for (extensionName of availableExtensions) {
      exts.push(extensionName);
    }
    return exts.sort();
  }

  return {
    webgl2: isWebGL2,
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
    maxVaryingVectors: isWebGL2 ? 0 : gl.getParameter(gl.MAX_VARYING_VECTORS),
    maxFragmentUniformVectors: isWebGL2 ? 0 : gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
    maxVertexUniformVectors: isWebGL2 ? 0 : gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
    maxVertexTextureImageUnits: isWebGL2 ? 0 : gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
    maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
    maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS) as [number, number],
    renderer: debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : "unknown",
    vendor: debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)) : "unknown",
    version: gl.getParameter(gl.VERSION),
    shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
    extensions: getExtensions(),
  };
}

/* -------------------------------------------------------------------------- */
/*  Context Creation                                                           */
/* -------------------------------------------------------------------------- */

function createWebGLContext(canvas: HTMLCanvasElement, preferWebGL2 = true): WebGL2RenderingContext | WebGLRenderingContext | null {
  const attrs: WebGLContextAttributes = {
    alpha: true,
    depth: true,
    stencil: false,
    antialias: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: false,
    desynchronized: true,
  };

  if (preferWebGL2) {
    const gl2 = canvas.getContext("webgl2", attrs);
    if (gl2) return gl2;
  }
  return canvas.getContext("webgl", attrs) || (canvas.getContext("experimental-webgl", attrs) as WebGLRenderingContext | null);
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                   */
/* -------------------------------------------------------------------------- */

interface WebGLContextProviderProps {
  children: ReactNode;
  autoRecover?: boolean;
  maxRecoveryAttempts?: number;
  recoveryDelayMs?: number;
  enableMetrics?: boolean;
}

export function WebGLContextProvider({
  children,
  autoRecover = true,
  maxRecoveryAttempts = 3,
  recoveryDelayMs = 1000,
  enableMetrics = true,
}: WebGLContextProviderProps) {
  const [gl, setGl] = useState<WebGL2RenderingContext | WebGLRenderingContext | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<WebGLContextState>("initializing");
  const [capabilities, setCapabilities] = useState<WebGLCapabilities | null>(null);
  const [metrics, setMetrics] = useState<WebGLMetrics>(DEFAULT_METRICS);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | WebGLRenderingContext | null>(null);
  const recoveryAttemptsRef = useRef(0);
  const stateChangeCallbacksRef = useRef<Set<(state: WebGLContextState) => void>>(new Set());
  const frameIdRef = useRef<number | null>(null);
  const metricsIntervalRef = useRef<number | null>(null);
  const isRecoveringRef = useRef(false);
  const qualityTierRef = useRef<"low" | "medium" | "high">("medium");

  /* ---- State change notification ---- */
  const notifyStateChange = useCallback((newState: WebGLContextState) => {
    stateChangeCallbacksRef.current.forEach((cb) => cb(newState));
  }, []);

  const onStateChange = useCallback((callback: (state: WebGLContextState) => void) => {
    stateChangeCallbacksRef.current.add(callback);
    return () => stateChangeCallbacksRef.current.delete(callback);
  }, []);

  /* ---- Metrics Collection ---- */
  const collectMetrics = useCallback(() => {
    if (!glRef.current || !enableMetrics) return;

    const currentGl = glRef.current;
    const ext = currentGl.getExtension("WEBGL_debug_renderer_info");
    
    // Estimate GPU memory pressure from renderer string
    const renderer = ext ? String(currentGl.getParameter(ext.UNMASKED_RENDERER_WEBGL)).toLowerCase() : "";
    let pressure: "low" | "medium" | "high" = "low";
    
    if (renderer.includes("intel") || renderer.includes("mali") || renderer.includes("adreno")) {
      pressure = "high";
    } else if (renderer.includes("amd") || renderer.includes("radeon") || renderer.includes("nvidia")) {
      pressure = "low";
    } else {
      pressure = "medium";
    }

    setMetrics((prev) => {
      // Avoid needless re-renders — only update when the value changes.
      if (prev.gpuMemoryPressure === pressure) return prev;
      return {
        ...prev,
        gpuMemoryPressure: pressure,
      };
    });
  }, [enableMetrics]);

  /* ---- Context Initialization ---- */
  const initializeContext = useCallback(async (): Promise<WebGL2RenderingContext | WebGLRenderingContext | null> => {
    const newCanvas = document.createElement("canvas");
    newCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;";
    newCanvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 2);
    newCanvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2);
    
    canvasRef.current = newCanvas;
    setCanvas(newCanvas);

    const newGl = createWebGLContext(newCanvas);
    if (!newGl) {
      setState("failed");
      notifyStateChange("failed");
      return null;
    }

    glRef.current = newGl;
    setGl(newGl);
    setCapabilities(detectCapabilities(newGl));
    setState("ready");
    notifyStateChange("ready");
    recoveryAttemptsRef.current = 0;
    isRecoveringRef.current = false;

    return newGl;
  }, [notifyStateChange]);

  /* ---- Context Recovery ---- */
  const attemptRecovery = useCallback(async (): Promise<boolean> => {
    if (isRecoveringRef.current) return false;
    if (recoveryAttemptsRef.current >= maxRecoveryAttempts) {
      setState("fallback");
      notifyStateChange("fallback");
      return false;
    }

    isRecoveringRef.current = true;
    setState("recovering");
    notifyStateChange("recovering");

    // Clean up old context
    if (glRef.current) {
      const loseCtx = glRef.current.getExtension("WEBGL_lose_context");
      if (loseCtx) loseCtx.loseContext();
    }

    await new Promise((resolve) => setTimeout(resolve, recoveryDelayMs * (recoveryAttemptsRef.current + 1)));
    
    recoveryAttemptsRef.current++;
    const newGl = await initializeContext();
    
    if (newGl) {
      setMetrics((prev) => ({
        ...prev,
        contextLossCount: prev.contextLossCount + 1,
        lastContextLoss: Date.now(),
      }));
      isRecoveringRef.current = false;
      return true;
    }

    isRecoveringRef.current = false;
    return false;
  }, [initializeContext, maxRecoveryAttempts, recoveryDelayMs, notifyStateChange]);

  /* ---- Event Handlers ---- */
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn("[WebGL] Context lost - attempting recovery");
      setState("lost");
      notifyStateChange("lost");
      
      if (autoRecover) {
        void attemptRecovery();
      }
    };

    const handleContextRestored = () => {
      console.log("[WebGL] Context restored");
      setState("ready");
      notifyStateChange("ready");
    };

    const handleResize = () => {
      if (!canvasRef.current || !glRef.current) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvasRef.current.width = window.innerWidth * dpr;
      canvasRef.current.height = window.innerHeight * dpr;
      glRef.current.viewport(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    // Start initialization
    void initializeContext();

    // Canvas is created synchronously inside initializeContext (no await before
    // the assignment), so we can attach listeners directly instead of polling
    // with setInterval every 50ms.
    if (canvasRef.current) {
      canvasRef.current.addEventListener("webglcontextlost", handleContextLost);
      canvasRef.current.addEventListener("webglcontextrestored", handleContextRestored);
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("webglcontextlost", handleContextLost);
        canvasRef.current.removeEventListener("webglcontextrestored", handleContextRestored);
      }
      window.removeEventListener("resize", handleResize);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
      if (glRef.current) {
        const loseCtx = glRef.current.getExtension("WEBGL_lose_context");
        if (loseCtx) loseCtx.loseContext();
      }
    };
  }, [initializeContext, autoRecover, attemptRecovery, notifyStateChange]);

  /* ---- Metrics Loop ---- */
  useEffect(() => {
    if (!enableMetrics) return;

    // Collect metrics periodically (not per-frame) — a per-frame RAF loop that
    // calls setMetrics() every tick caused render storms ([Violation] 'setTimeout'
    // handler / Forced reflow) and contributed to WebGL context loss by keeping
    // the GL context busy every frame. Once every 5 s is sufficient for static
    // GPU-pressure detection.
    metricsIntervalRef.current = window.setInterval(collectMetrics, 5000);

    return () => {
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    };
  }, [collectMetrics, enableMetrics]);

  /* ---- Public API ---- */
  const requestRecovery = useCallback(async () => {
    return await attemptRecovery();
  }, [attemptRecovery]);

  const requestFallback = useCallback(() => {
    setState("fallback");
    notifyStateChange("fallback");
  }, [notifyStateChange]);

  const setQualityTier = useCallback((tier: "low" | "medium" | "high") => {
    qualityTierRef.current = tier;
  }, []);

  /* ---- Adaptive Render State ---- */
  const renderState = useMemo<WebGLAdaptiveRenderState>(() => {
    if (state === "lost" || state === "failed") {
      return {
        renderMode: "2d-fallback",
        shouldRender: false,
        qualityLevel: "low",
      };
    }
    
    if (!glRef.current) return DEFAULT_RENDER_STATE;
    
    // Determine quality level based on metrics and state
    let qualityLevel: "low" | "medium" | "high" = "high";
    if (metrics.gpuMemoryPressure === "high" || state === "recovering") {
      qualityLevel = "low";
    } else if (metrics.gpuMemoryPressure === "medium") {
      qualityLevel = "medium";
    }

    return {
      renderMode: state === "recovering" ? "canvas2d" : "webgl",
      shouldRender: true,
      qualityLevel,
    };
  }, [state, metrics.gpuMemoryPressure]);

  /* ---- Context Value ---- */
  const value = useMemo<WebGLContextValue>(
    () => ({
      gl,
      canvas,
      state,
      capabilities,
      metrics,
      requestRecovery,
      requestFallback,
      onStateChange,
      setQualityTier,
      renderState,
    }),
    [gl, canvas, state, capabilities, metrics, requestRecovery, requestFallback, onStateChange, setQualityTier, renderState]
  );

  return (
    <WebGLContext.Provider value={value}>
      {children}
    </WebGLContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useWebGLContext(): WebGLContextValue {
  const context = useContext(WebGLContext);
  if (!context) {
    throw new Error("useWebGLContext must be used within a WebGLContextProvider");
  }
  return context;
}
