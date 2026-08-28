'use client';

import { useWebGLContext } from '@/providers/webgl-context-provider';

/**
 * Hook to get the shared WebGL context for R3F Canvases.
 * 
 * Returns the WebGLRenderingContext from WebGLContextProvider when available,
 * otherwise returns null (letting R3F create its own context).
 * 
 * The context is only shared when the provider's state is 'ready'.
 */
export function useSharedWebGLContext(): WebGLRenderingContext | WebGL2RenderingContext | null {
  const { gl, state } = useWebGLContext();
  
  if (state === 'ready' && gl) {
    return gl;
  }
  
  return null;
}