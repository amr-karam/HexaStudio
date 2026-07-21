'use client';

import React, { useRef, useEffect } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group, AnimationMixer } from 'three';
import type { AnimationActionLoopStyles } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ModelConfig } from '@/features/scene/config/model-registry';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface SceneModelProps {
  config: ModelConfig;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function SceneModel({ config }: SceneModelProps) {
  const meshRef = useRef<Group>(null);
  const reducedMotion = useReducedMotion();
  const mixerRef = useRef<AnimationMixer | null>(null);

  const { scene, animations } = useGLTF(config.path);

  // AnimationMixer setup.
  useEffect(() => {
    if (!scene || !animations.length || reducedMotion) return;

    const mixer = new AnimationMixer(scene);
    mixerRef.current = mixer;

    const clip = config.animation?.clipName
      ? animations.find((a) => a.name === config.animation!.clipName)
      : animations[0];

    if (clip) {
      const action = mixer.clipAction(clip);
      action.setLoop(config.animation?.loop ?? (2201 as AnimationActionLoopStyles), Infinity);
      action.timeScale = config.animation?.speed ?? 1;
      if (config.animation?.autoplay !== false) {
        action.play();
      }
    }

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(scene);
      mixerRef.current = null;
    };
  }, [scene, animations, config.animation, reducedMotion]);

  // Per-frame rotation (delta-based).
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Update animation mixer.
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Idle rotation (skip under reduced motion).
    if (!reducedMotion) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <Center ref={meshRef}>
      <primitive
        object={scene}
        scale={config.scale}
        position={config.position}
        rotation={config.rotation}
      />
    </Center>
  );
}
