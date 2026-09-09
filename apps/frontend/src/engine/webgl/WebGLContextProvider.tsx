"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type WebGLContextState = 
  | "idle"
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

export interface WebGLAdaptiveRenderState {
  renderMode: "webgl" | "canvas2d" | "2d-fallback";
  shouldRender: boolean;
  qualityLevel: "low" | "medium" | "high";
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
  requestContext: () => Promise<WebGL2RenderingContext | WebGLRenderingContext | null>;
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
/*  Lazy Initialization Provider                                               */
/* -------------------------------------------------------------------------- */

interface WebGLContextProviderProps {
  children: ReactNode;
  autoRecover?: boolean;
  maxRecoveryAttempts?: number;
  recoveryDelayMs?: number;
  enableMetrics?: boolean;
}

interface UseWebGLContextOptions {
  autoRecover?: boolean;
  maxRecoveryAttempts?: number;
  recoveryDelayMs?: number;
  enableMetrics?: boolean;
}

function useWebGLContextInternal(options: UseWebGLContextOptions, _children?: ReactNode) {
  const [gl, setGl] = useState<WebGL2RenderingContext | WebGLRenderingContext | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<WebGLContextState>("idle");
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
  const initializedRef = useRef(false);

  const notifyStateChange = useCallback((newState: WebGLContextState) => {
    stateChangeCallbacksRef.current.forEach((cb) => cb(newState));
    setState(newState);
  }, []);

  const onStateChange = useCallback((callback: (state: WebGLContextState) => void) => {
    stateChangeCallbacksRef.current.add(callback);
    return () => stateChangeCallbacksRef.current.delete(callback);
  }, []);

  const collectMetrics = useCallback(() => {
    if (!glRef.current || !options.enableMetrics) return;
    const currentGl = glRef.current;
    const ext = currentGl.getExtension("WEBGL_debug_renderer_info");
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
      if (prev.gpuMemoryPressure === pressure) return prev;
      return { ...prev, gpuMemoryPressure: pressure };
    });
  }, [options.enableMetrics]);

  const initializeContext = useCallback(async (): Promise<WebGL2RenderingContext | WebGLRenderingContext | null> => {
    if (initializedRef.current && glRef.current) return glRef.current;
    
    const newCanvas = document.createElement("canvas");
    newCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;";
    newCanvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 2);
    newCanvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2);
    
    canvasRef.current = newCanvas;
    setCanvas(newCanvas);

    const newGl = createWebGLContext(newCanvas);
    if (!newGl) {
      notifyStateChange("failed");
      return null;
    }

    glRef.current = newGl;
    setGl(newGl);
    setCapabilities(detectCapabilities(newGl));
    notifyStateChange("ready");
    recoveryAttemptsRef.current = 0;
    isRecoveringRef.current = false;
    initializedRef.current = true;

    return newGl;
  }, [notifyStateChange, options]);

  const attemptRecovery = useCallback(async (): Promise<boolean> => {
    if (isRecoveringRef.current) return false;
    if (recoveryAttemptsRef.current >= options.maxRecoveryAttempts) {
      notifyStateChange("fallback");
      return false;
    }

    isRecoveringRef.current = true;
    notifyStateChange("recovering");

    if (glRef.current) {
      const loseCtx = glRef.current.getExtension("WEBGL_lose_context");
      if (loseCtx) loseCtx.loseContext();
    }

    await new Promise((resolve) => setTimeout(resolve, options.recoveryDelayMs * (recoveryAttemptsRef.current + 1)));
    
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
  }, [initializeContext, options.maxRecoveryAttempts, options.recoveryDelayMs, notifyStateChange]);

  const requestContext = useCallback(async (): Promise<WebGL2RenderingContext | WebGLRenderingContext | null> => {
    if (initializedRef.current && glRef.current) {
      return glRef.current;
    }
    notifyStateChange("initializing");
    return await initializeContext();
  }, [initializeContext, notifyStateChange]);

  const requestRecovery = useCallback(async () => {
    return await attemptRecovery();
  }, [attemptRecovery]);

  const requestFallback = useCallback(() => {
    notifyStateChange("fallback");
  }, [notifyStateChange]);

  const setQualityTier = useCallback((tier: "low" | "medium" | "high") => {
    qualityTierRef.current = tier;
  }, []);

  useEffect(() => {
    if (!options.enableMetrics) return;
    const updateMetrics = () => {
      collectMetrics();
      frameIdRef.current = requestAnimationFrame(updateMetrics);
    };
    frameIdRef.current = requestAnimationFrame(updateMetrics);
    metricsIntervalRef.current = window.setInterval(collectMetrics, 5000);
    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    };
  }, [collectMetrics, options.enableMetrics]);

  useEffect(() => {
    if (!options.autoRecover) return;

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
      if (glRef.current) {
        const loseCtx = glRef.current.getExtension("WEBGL_lose_context");
        if (loseCtx) loseCtx.loseContext();
      }
    };
  }, [options.autoRecover, options]);

  const renderState = useMemo<WebGLAdaptiveRenderState>(() => {
    if (state === "lost" || state === "failed" || state === "idle") {
      return {
        renderMode: "2d-fallback",
        shouldRender: false,
        qualityLevel: "low",
      };
    }
    
    if (!glRef.current) return DEFAULT_RENDER_STATE;
    
    let qualityLevel: "low" | "medium" | "high" = "high";
    if (metrics.gpuMemoryPressure === "high" || state === "recovering") {
      qualityLevel = "low";
    } else if (metrics.gpuMemoryPressure === "medium") {
      qualityLevel = "medium";
    }
    
    return {
      renderMode: state === "recovering" ? "canvas2d" : "webgl",
      shouldRender: state === "ready",
      qualityLevel,
    };
  }, [state, metrics.gpuMemoryPressure]);

  const value = useMemo<WebGLContextValue>(() => ({
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
    requestContext,
  }), [gl, canvas, state, capabilities, metrics, requestRecovery, requestFallback, onStateChange, setQualityTier, renderState, requestContext]);

  return { value, initializeContext };
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                   */
/* -------------------------------------------------------------------------- */

export function WebGLContextProvider({
  children,
  autoRecover = true,
  maxRecoveryAttempts = 3,
  recoveryDelayMs = 1000,
  enableMetrics = true,
}: WebGLContextProviderProps) {
  const options = { autoRecover, maxRecoveryAttempts, recoveryDelayMs, enableMetrics };
  const { value } = useWebGLContextInternal(options);

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