import { useGLTF } from '@react-three/drei';
import { useCallback, useEffect } from 'react';

/**
 * useAssetLoader is a specialized hook for loading 3D models with Draco compression.
 * It ensures the Draco decoder is correctly configured and implements preloading.
 */
export function useAssetLoader(url: string) {
  // Draco decoder files are typically served from a public CDN or local public folder
  const dracoUrl = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';
  
  const gltf = useGLTF(url, dracoUrl);

  // Preload the model for faster subsequent loads
  useEffect(() => {
    if (url) {
      useGLTF.preload(url, dracoUrl);
    }
  }, [url]);

  const getModel = useCallback(() => {
    // We return the scene from the gltf result
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
