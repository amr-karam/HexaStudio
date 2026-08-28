
"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
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

interface WebGLContextValue {
  gl: WebGL2RenderingContext | WebGLRenderingContext | null;
  canvas: HTMLCanvasElement | null;
  state: WebGLContextState;
  capabilities: WebGLCapabilities | null;
  metrics: WebGLMetrics;
  requestRecovery: () => Promise<boolean>;
  requestFallback: () => void;
  onStateChange: (callback: (state: WebGLContextState) => void) => () => void;
  /** Register an R3F Canvas to share this context. Returns cleanup. */
  registerR3FContext: (gl: WebGL2RenderingContext | WebGLRenderingContext) => () => void;
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

const WebGLContext = createContext<WebGLContextValue | null>(null);

/* -------------------------------------------------------------------------- */
/*  Capability Detection                                                       */
/* -------------------------------------------------------------------------- */

function detectCapabilities(gl: WebGL2RenderingContext | WebGLRenderingContext): WebGLCapabilities {
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const isWebGL2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
  
  const getExtensions = () => {
    const exts = gl.getSupportedExtensions() || [];
    return exts.sort();
  };

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
  const gl = canvas.getContext("webgl", attrs) || canvas.getContext("experimental-webgl", attrs);
  return (gl as WebGLRenderingContext | null);
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | WebGLRenderingContext | null>(null);
  const recoveryAttemptsRef = useRef(0);
  const stateChangeCallbacksRef = useRef<Set<(state: WebGLContextState) => void>>(new Set());
  const frameIdRef = useRef<number | undefined>(undefined);
  const metricsIntervalRef = useRef<number | undefined>(undefined);
  const isRecoveringRef = useRef(false);

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
    
    // Estimate GPU memory pressure from available extensions
    let pressure: "low" | "medium" | "high" = "low";
    const renderer = ext ? String(currentGl.getParameter(ext.UNMASKED_RENDERER_WEBGL)).toLowerCase() : "";
    
    if (renderer.includes("intel") || renderer.includes("mali") || renderer.includes("adreno")) {
      pressure = "high";
    } else if (renderer.includes("amd") || renderer.includes("radeon") || renderer.includes("nvidia")) {
      pressure = "low";
    } else {
      pressure = "medium";
    }

    setMetrics((prev) => ({
      ...prev,
      gpuMemoryPressure: pressure,
      // These would be populated by the actual scene renderer
      drawCallsPerFrame: 0,
      trianglesPerFrame: 0,
      textureMemoryMB: 0,
      bufferMemoryMB: 0,
    }));
  }, [enableMetrics]);

/* ---- Context Initialization ---- */
  const initializeContext = useCallback(async (): Promise<WebGL2RenderingContext | WebGLRenderingContext | null> => {
    const newCanvas = document.createElement("canvas");
    newCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;";
    // Cap DPR at 1.5 to reduce GPU memory pressure and prevent context loss
    newCanvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 1.5);
    newCanvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 1.5);
    
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
      console.warn("[WebGL] Context lost, attempting recovery...");
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
      // Cap DPR at 1.5 to reduce GPU memory pressure and prevent context loss
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvasRef.current.width = window.innerWidth * dpr;
      canvasRef.current.height = window.innerHeight * dpr;
      glRef.current.viewport(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    // Start initialization
    void initializeContext();

    // Attach listeners after canvas exists
    const checkCanvas = setInterval(() => {
      if (canvasRef.current) {
        clearInterval(checkCanvas);
        canvasRef.current.addEventListener("webglcontextlost", handleContextLost);
        canvasRef.current.addEventListener("webglcontextrestored", handleContextRestored);
        window.addEventListener("resize", handleResize);
      }
    }, 50);

    return () => {
      clearInterval(checkCanvas);
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
    
    const updateMetrics = () => {
      collectMetrics();
      frameIdRef.current = requestAnimationFrame(updateMetrics);
    };
    
    frameIdRef.current = requestAnimationFrame(updateMetrics);
    
    metricsIntervalRef.current = window.setInterval(collectMetrics, 1000);
    
    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    };
  }, [collectMetrics, enableMetrics]);

  /* ---- Canvas Container Attachment ---- */
  useEffect(() => {
    if (containerRef.current && canvas) {
      if (!containerRef.current.contains(canvas)) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(canvas);
      }
    }
  }, [canvas]);

/* ---- R3F Context Sharing ---- */
  const r3fContextRef = useRef<WebGL2RenderingContext | WebGLRenderingContext | null>(null);

  const registerR3FContext = useCallback(
    (r3fGl: WebGL2RenderingContext | WebGLRenderingContext): (() => void) => {
      r3fContextRef.current = r3fGl;
      // Sync state changes to R3F context
      const cleanup = onStateChange((newState) => {
        if (newState === "lost" && r3fContextRef.current) {
          const loseCtx = r3fContextRef.current.getExtension("WEBGL_lose_context");
          if (loseCtx) loseCtx.loseContext();
        }
      });
      return cleanup;
    },
    [onStateChange]
  );

  /* ---- Public API ---- */
  const requestRecovery = useCallback(async () => {
    return await attemptRecovery();
  }, [attemptRecovery]);

  const requestFallback = useCallback(() => {
    setState("fallback");
    notifyStateChange("fallback");
  }, [notifyStateChange]);

  /* ---- Render ---- */
  const value: WebGLContextValue = useMemo(
    () => ({
      gl,
      canvas,
      state,
      capabilities,
      metrics,
      requestRecovery,
      requestFallback,
      onStateChange,
      registerR3FContext,
    }),
    [gl, canvas, state, capabilities, metrics, requestRecovery, requestFallback, onStateChange, registerR3FContext]
  );

  return (
    <WebGLContext.Provider value={value}>
      {canvas && state !== "initializing" && state !== "failed" && (
        <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }} />
      )}
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

