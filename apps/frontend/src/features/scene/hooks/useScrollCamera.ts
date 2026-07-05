import { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface ScrollPathNode {
  position: [number, number, number];
  lookAt: [number, number, number];
}

export function useScrollCamera(path: ScrollPathNode[]) {
  const { camera } = useThree();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      if (reducedMotion) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollProgress = Math.min(Math.max(scrollY / windowHeight, 0), 1);

      // Find the current segment of the path
      const segmentCount = path.length - 1;
      const segmentProgress = scrollProgress * segmentCount;
      const index = Math.floor(segmentProgress);
      const t = segmentProgress - index;

      if (index >= 0 && index < segmentCount) {
        const start = path[index];
        const end = path[index + 1];

        // Linear interpolation for position
        const currentPos = new THREE.Vector3().lerpVectors(
          new THREE.Vector3(...start.position),
          new THREE.Vector3(...end.position),
          t
        );

        // Linear interpolation for lookAt
        const currentLookAt = new THREE.Vector3().lerpVectors(
          new THREE.Vector3(...start.lookAt),
          new THREE.Vector3(...end.lookAt),
          t
        );

        camera.position.copy(currentPos);
        camera.lookAt(currentLookAt);
      } else if (index >= segmentCount) {
        const last = path[path.length - 1];
        camera.position.set(...last.position);
        camera.lookAt(new THREE.Vector3(...last.lookAt));
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial call to set camera
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [camera, path, reducedMotion]);
}
