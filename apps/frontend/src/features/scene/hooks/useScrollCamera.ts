import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Quaternion } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ScrollPathNode {
  position: [number, number, number];
  lookAt: [number, number, number];
}

/* -------------------------------------------------------------------------- */
/*  Pre-allocated vectors (module scope — never GC'd)                          */
/* -------------------------------------------------------------------------- */

const _startPos = new Vector3();
const _endPos = new Vector3();
const _startLook = new Vector3();
const _endLook = new Vector3();
const _targetPos = new Vector3();
const _targetLook = new Vector3();
const _currentLook = new Vector3();
const _targetQuat = new Quaternion();

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const MAX_DELTA = 0.1;

/** Compute an interpolated position + lookAt along the scroll path. */
function samplePath(
  path: ScrollPathNode[],
  progress: number,
  outPos: Vector3,
  outLook: Vector3,
) {
  const segmentCount = path.length - 1;
  const segmentProgress = Math.min(progress, 1) * segmentCount;
  const index = Math.min(Math.floor(segmentProgress), segmentCount - 1);
  const t = segmentProgress - index;

  const start = path[index];
  const end = path[Math.min(index + 1, segmentCount)];

  _startPos.fromArray(start.position);
  _endPos.fromArray(end.position);
  _startLook.fromArray(start.lookAt);
  _endLook.fromArray(end.lookAt);

  outPos.lerpVectors(_startPos, _endPos, t);
  outLook.lerpVectors(_startLook, _endLook, t);
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useScrollCamera(path: ScrollPathNode[], options?: { enabled?: boolean }) {
  const { camera } = useThree();
  const reducedMotion = useReducedMotion();
  const enabled = options?.enabled ?? true;

  // Mutable state (no React re-renders).
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  // Passive scroll listener — only writes to targetProgress ref.
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      targetProgress.current = Math.min(Math.max(scrollY / windowHeight, 0), 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialise.

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [enabled]);

  // Per-frame damping loop — runs even when scroll is not actively happening.
  useFrame((_, delta) => {
    if (!enabled) return;

    const dt = Math.min(delta, MAX_DELTA);

    if (reducedMotion) {
      // Reduced motion: snap to the target position, no interpolation.
      samplePath(path, targetProgress.current, _targetPos, _targetLook);
      camera.position.copy(_targetPos);
      camera.lookAt(_targetLook);
      currentProgress.current = targetProgress.current;
      return;
    }

    // Damped interpolation toward target.
    const lerpSpeed = 6.0; // per-second
    currentProgress.current += (targetProgress.current - currentProgress.current) * Math.min(1, dt * lerpSpeed);

    // Snap when close enough.
    if (Math.abs(targetProgress.current - currentProgress.current) < 0.0001) {
      currentProgress.current = targetProgress.current;
    }

    // Sample the path.
    samplePath(path, currentProgress.current, _targetPos, _targetLook);

    // Position lerp.
    camera.position.lerp(_targetPos, Math.min(1, dt * lerpSpeed));

    // Rotation: quaternion slerp for smooth orientation.
    // Build a lookAt quaternion from the target direction.
    const dir = _targetLook.clone().sub(_targetPos).normalize();
    _targetQuat.setFromUnitVectors(new Vector3(0, 0, -1), dir);

    // Slerp camera quaternion toward target.
    camera.quaternion.slerp(_targetQuat, Math.min(1, dt * lerpSpeed));
  });
}
