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
        // Avoid re-processing cached models
        if (gltf.scene.userData?.isProcessed) return;

        // 1. Collect all children to avoid modification issues during iteration
        const children = [...gltf.scene.children];
        
        // 2. Remove children from scene to stagger GPU upload
        // This prevents the '<primitive />' from adding everything in one frame,
        // which would otherwise cause a massive long task during the first render.
        gltf.scene.clear();

        // 3. Staggered Processing & Injection
        for (let i = 0; i < children.length; i++) {
          const obj = children[i];
          
          if ((obj as Mesh).isMesh) {
            const mesh = obj as Mesh;
            // Compute BVH on the main thread but staggered to avoid blocking the event loop
            const geom = mesh.geometry as unknown as { computeBVH?: () => void };
            if (geom?.computeBVH) {
              geom.computeBVH();
            }
          }

          // Inject back into the scene graph
          gltf.scene.add(obj);

          // Yield to main thread every 2 meshes to keep frame times well under 16ms (60fps)
          // This eliminates long tasks by distributing the GPU upload and BVH work.
          if (i % 2 === 0) {
            await new Promise((resolve) => requestAnimationFrame(resolve));
          }
        }

        // 4. Delegate heavy post-processing to the Web Worker
        const worker = ModelWorkerManager.getInstance();
        
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

        // Mark as processed to avoid redundant loops on re-mount
        gltf.scene.userData.isProcessed = true;

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