'use client';

import { useGLTF, useProgress } from '@react-three/drei';
import { useEffect } from 'react';
import { useAssetStore } from '@/features/scene/store/asset-store';
import { AnimationClip, Mesh } from 'three';
import { resourceLoader } from '@/lib/resource-loader';
import * as Comlink from 'comlink';
import { ModelWorkerManager } from '../ModelWorkerManager';

const DRACO_URL = process.env.NEXT_PUBLIC_DRACO_URL || 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

/**
 * Preloads a model into drei/fiber's shared loader cache ahead of navigation.
 * Use from nav handlers / hover triggers so entering the scene doesn't jank.
 * The model is also registered with the shared `resourceLoader` so the
 * singleton is the single source of truth for cross-route tracking.
 */
export function preloadModel(url: string): void {
  if (!url) return;
  useGLTF.preload(url, DRACO_URL);
  void resourceLoader
    .loadResource('models', url, () => Promise.resolve({ url, status: 'preloaded' as const }), {
      priority: 'high',
    })
    .catch((err) => console.error(`[preloadModel] failed to track ${url}:`, err));
}

/**
 * useAssetLoader loads a 3D model lazily and deduplicated through the shared
 * `resourceLoader` singleton.
 *
 * Design decisions:
 * 1. drei's `useGLTF` suspends the nearest `<Suspense>` boundary — the model
 *    is only fetched when the scene actually needs it (lazy).
 * 2. drei/fiber's `useLoader` cache deduplicates concurrent mounters sharing
 *    the same URL (single fetch + parse), and `preloadModel` warms that cache.
 * 3. The parsed GLTF is registered in the shared resource loader under the
 *    `models` category, giving the app one TTL-cached source of truth and
 *    telemetry for slow model fetches.
 */
export function useAssetLoader(url: string) {
  const setProgress = useAssetStore((s) => s.setProgress);
  const { progress, loaded, total } = useProgress();
  const gltf = useGLTF(url, DRACO_URL);

  useEffect(() => {
    setProgress(progress);
  }, [progress, setProgress]);

  useEffect(() => {
    if (!url) return;
    
    const processModel = async () => {
      try {
        // 1. Integrate three-mesh-bvh for spatial optimization
        // We traverse the scene and compute BVH for all meshes
        gltf.scene.traverse((obj) => {
          if ((obj as Mesh).isMesh) {
            const mesh = obj as Mesh;
            // computeBVH is added to BufferGeometry by three-mesh-bvh
            const geom = mesh.geometry as unknown as { computeBVH?: () => void };
            if (geom && typeof geom.computeBVH === 'function') {
              geom.computeBVH();
            }
          }
        });

        // 2. Delegate heavy post-processing to the Web Worker
        const worker = ModelWorkerManager.getInstance();
        
        // We extract the position buffers from the first mesh to demonstrate 
        // worker-based processing of geometry metadata without blocking the main thread.
        const positionBuffers: Float32Array[] = [];
        gltf.scene.traverse((obj) => {
          if ((obj as Mesh).isMesh && positionBuffers.length === 0) {
            const mesh = obj as Mesh;
            const pos = mesh.geometry?.attributes?.position?.array;
            if (pos instanceof Float32Array) {
              positionBuffers.push(pos);
            }
          }
        });

        if (positionBuffers.length > 0) {
          const activeBuffer = positionBuffers[0];
          // Transfer the buffer to the worker to avoid cloning overhead
          await worker.api.computeBVH(Comlink.transfer(activeBuffer, [activeBuffer.buffer]));
        }

        // Finally, register with the resource loader
        await resourceLoader.loadResource('models', url, async () => gltf, { priority: 'high' });
      } catch (err) {
        console.error(`[useAssetLoader] spatial optimization failed for ${url}:`, err);
      }
    };

    void processModel();
  }, [url, gltf]);

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