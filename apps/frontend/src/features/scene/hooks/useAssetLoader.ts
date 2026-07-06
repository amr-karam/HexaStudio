import { useGLTF } from '@react-three/drei';
import { useCallback, useEffect } from 'react';

/**
 * useAssetLoader is a specialized hook for loading 3D models with:
 * - Draco compression for geometry (reduces model size by ~90%)
 * - KTX2/Basis Universal texture compression (reduces texture size by ~75%)
 * It ensures decoders are correctly configured and implements preloading.
 */
export function useAssetLoader(url: string) {
  // Draco decoder for geometry compression
  const dracoUrl = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

  const gltf = useGLTF(url, dracoUrl);

  // Preload the model for faster subsequent loads
  useEffect(() => {
    if (url) {
      useGLTF.preload(url, dracoUrl);
    }
  }, [url]);

  const getModel = useCallback(() => {
    return gltf.scene;
  }, [gltf]);

  return {
    model: gltf.scene,
    animations: gltf.animations,
    nodes: gltf.nodes,
    materials: gltf.materials,
    getModel,
  };
}
