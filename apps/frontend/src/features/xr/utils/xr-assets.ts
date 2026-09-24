import { useGLTF } from '@react-three/drei';

/**
 * Pre-fetches GLTF models into the @react-three/drei cache.
 * This removes the "Loading..." flicker when the XRViewer is mounted.
 */
export async function preloadXRModel(url: string) {
  try {
    useGLTF.preload(url);
  } catch (error) {
    console.warn(`[XRAssets] Failed to preload model at ${url}:`, error);
  }
}

/**
 * Pre-fetches the XR bundle to warm up the dynamic import.
 */
export async function preloadXRBundle() {
  try {
    await import('@/features/xr/components/XRCanvas');
  } catch (error) {
    console.warn('[XRAssets] Failed to preload XR bundle:', error);
  }
}
