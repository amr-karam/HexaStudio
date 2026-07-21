import { useGLTF, useProgress } from '@react-three/drei';
import { useEffect } from 'react';
import { useAssetStore } from '@/features/scene/store/asset-store';
import { AnimationClip } from 'three';

const DRACO_URL = process.env.NEXT_PUBLIC_DRACO_URL || 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

export function useAssetLoader(url: string) {
  const setProgress = useAssetStore((s) => s.setProgress);
  const { progress, loaded, total } = useProgress();
  const gltf = useGLTF(url, DRACO_URL);

  useEffect(() => {
    setProgress(progress);
  }, [progress, setProgress]);

  useEffect(() => {
    if (url) {
      useGLTF.preload(url, DRACO_URL);
    }
  }, [url]);

  return {
    model: gltf.scene,
    animations: gltf.animations as AnimationClip[],
    nodes: gltf.nodes,
    materials: gltf.materials,
    loaded,
    total,
    progress,
  };
}
