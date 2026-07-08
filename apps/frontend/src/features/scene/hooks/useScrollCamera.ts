import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import gsap from 'gsap';

export interface ScrollPathNode {
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

      const segmentCount = path.length - 1;
      const segmentProgress = scrollProgress * segmentCount;
      const index = Math.floor(segmentProgress);
      const t = segmentProgress - index;

      if (index >= 0 && index < segmentCount) {
        const start = path[index];
        const end = path[index + 1];

        const currentPos = new THREE.Vector3().lerpVectors(
          new THREE.Vector3(...start.position),
          new THREE.Vector3(...end.position),
          t
        );

        const currentLookAt = new THREE.Vector3().lerpVectors(
          new THREE.Vector3(...start.lookAt),
          new THREE.Vector3(...end.lookAt),
          t
        );

        // Use GSAP for smooth smoothing instead of direct assignment
        gsap.to(camera.position, {
          x: currentPos.x,
          y: currentPos.y,
          z: currentPos.z,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        // LookAt needs to be immediate or interpolated manually
        camera.lookAt(currentLookAt);
      } else if (index >= segmentCount) {
        const last = path[path.length - 1];
        gsap.to(camera.position, {
          x: last.position[0],
          y: last.position[1],
          z: last.position[2],
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        camera.lookAt(new THREE.Vector3(...last.lookAt));
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [camera, path, reducedMotion]);
}
