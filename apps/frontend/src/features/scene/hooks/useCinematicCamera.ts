import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useCameraStore } from '@/features/scene/store/camera-store';
import { Vector3 } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getModelConfig } from '@/features/scene/config/model-registry';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const IDLE_RADIUS = 12;
const IDLE_HEIGHT = 8;
const IDLE_SPEED = 0.15; // radians per second (delta-based)
const PARALLAX_FACTOR = 0.3;
const PARALLAX_SMOOTHING = 4.0; // lerp speed (per-second, delta-based)
const TRANSITION_DURATION = 1.8;
const EASE_OUT_EXPO = 'power3.out';
const MAX_DELTA = 0.1; // clamp after tab restoration

/* -------------------------------------------------------------------------- */
/*  Pre-allocated vectors (module scope — never GC'd)                          */
/* -------------------------------------------------------------------------- */

const _basePosition = new Vector3();
const _parallaxOffset = new Vector3();
const _targetPosition = new Vector3();
const _lookAtTarget = new Vector3();

/* -------------------------------------------------------------------------- */
/*  Target registry builder                                                    */
/* -------------------------------------------------------------------------- */

function buildTargets() {
  const config = getModelConfig();
  const targets: Record<string, { position: Vector3; lookAt: Vector3 }> = {};
  for (const point of config.cinematicPoints) {
    targets[point.name] = {
      position: new Vector3(...point.position),
      lookAt: new Vector3(...point.lookAt),
    };
  }
  targets.overview = {
    position: new Vector3(10, 10, 10),
    lookAt: new Vector3(0, 0, 0),
  };
  return targets;
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useCinematicCamera(enabled = true) {
  const { camera, gl } = useThree();
  const store = useCameraStore();
  const currentTarget = store.currentTarget;
  const setTarget = store.setTarget;
  const setTransitioning = store.setTransitioning;
  const reducedMotion = useReducedMotion();

  const mouse = useRef({ x: 0, y: 0 });
  const idleAngle = useRef(0);
  const parallaxPos = useRef({ x: 0, y: 0 });
  const transitioning = useRef(false);
  const ctxRef = useRef<gsap.Context | null>(null);

  const targets = useMemo(buildTargets, []);

  // Subscribe to pointer for parallax.
  useEffect(() => {
    if (!enabled) return;
    const handleMouseMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const el = gl.domElement;
    el.addEventListener('pointermove', handleMouseMove, { passive: true });
    return () => el.removeEventListener('pointermove', handleMouseMove);
  }, [gl, enabled]);

  // Kill all GSAP tweens on cleanup.
  useEffect(() => {
    return () => {
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  /* ----------------------------------------------------------------------- */
  /*  goToTarget — exposed for programmatic navigation                        */
  /* ----------------------------------------------------------------------- */

  const goToTarget = useCallback(
    (targetName: string, duration: number = TRANSITION_DURATION) => {
      const target = targets[targetName];
      if (!target) return;

      setTarget(targetName);

      // Reduced motion: snap instantly.
      if (reducedMotion) {
        camera.position.copy(target.position);
        camera.lookAt(target.lookAt);
        setTransitioning(false);
        transitioning.current = false;
        return;
      }

      transitioning.current = true;
      setTransitioning(true);

      ctxRef.current?.revert();
      const ctx = gsap.context(() => {
        const lookProxy = target.lookAt.clone();

        gsap.to(camera.position, {
          x: target.position.x,
          y: target.position.y,
          z: target.position.z,
          duration,
          ease: EASE_OUT_EXPO,
          overwrite: 'auto',
        });

        gsap.to(lookProxy, {
          x: target.lookAt.x,
          y: target.lookAt.y,
          z: target.lookAt.z,
          duration,
          ease: EASE_OUT_EXPO,
          onUpdate: () => {
            camera.lookAt(lookProxy);
          },
          onComplete: () => {
            transitioning.current = false;
            setTransitioning(false);
          },
        });
      });
      ctxRef.current = ctx;
    },
    [camera, targets, reducedMotion, setTarget, setTransitioning],
  );

  /* ----------------------------------------------------------------------- */
  /*  Per-frame loop                                                          */
  /* ----------------------------------------------------------------------- */

  useFrame((_, delta) => {
    if (!enabled) return;

    // Clamp delta to prevent huge jumps after tab restore.
    const dt = Math.min(delta, MAX_DELTA);

    // --- Active target transition (subscribe to currentTarget from store) ---
    if (currentTarget && targets[currentTarget] && !transitioning.current) {
      const target = targets[currentTarget];

      if (reducedMotion) {
        camera.position.copy(target.position);
        camera.lookAt(target.lookAt);
      } else {
        // Smoothly move toward the target position + parallax.
        const px = mouse.current.x * PARALLAX_FACTOR;
        const py = mouse.current.y * PARALLAX_FACTOR;
        parallaxPos.current.x += (px - parallaxPos.current.x) * PARALLAX_SMOOTHING * dt;
        parallaxPos.current.y += (py - parallaxPos.current.y) * PARALLAX_SMOOTHING * dt;

        // Coarse pointer: skip pointer-driven parallax.
        const isCoarse = typeof window !== 'undefined' &&
          window.matchMedia('(pointer: coarse)').matches;
        const pxFinal = isCoarse ? 0 : parallaxPos.current.x;
        const pyFinal = isCoarse ? 0 : parallaxPos.current.y;

        _targetPosition
          .copy(target.position)
          .add(new Vector3(pxFinal, pyFinal, 0));

        camera.position.lerp(_targetPosition, Math.min(1, dt * 3));

        // Always update lookAt toward the target.
        _lookAtTarget.copy(target.lookAt);
        camera.lookAt(_lookAtTarget);
      }
    } else if (!currentTarget && !transitioning.current) {
      // --- Idle orbit + parallax ---
      if (!reducedMotion) {
        idleAngle.current += dt * IDLE_SPEED;

        const isCoarse = typeof window !== 'undefined' &&
          window.matchMedia('(pointer: coarse)').matches;
        const px = isCoarse ? 0 : mouse.current.x * PARALLAX_FACTOR;
        const py = isCoarse ? 0 : mouse.current.y * PARALLAX_FACTOR;
        parallaxPos.current.x += (px - parallaxPos.current.x) * PARALLAX_SMOOTHING * dt;
        parallaxPos.current.y += (py - parallaxPos.current.y) * PARALLAX_SMOOTHING * dt;
      }
      // else: reducedMotion — parallaxPos stays at 0, idleAngle doesn't change.

      _basePosition.set(
        IDLE_RADIUS * Math.sin(idleAngle.current),
        IDLE_HEIGHT,
        IDLE_RADIUS * Math.cos(idleAngle.current),
      );
      _parallaxOffset.set(parallaxPos.current.x, parallaxPos.current.y, 0);
      _targetPosition.copy(_basePosition).add(_parallaxOffset);

      // Lerp toward the target for smoothness.
      const lerpFactor = reducedMotion ? 1 : Math.min(1, dt * 2);
      camera.position.lerp(_targetPosition, lerpFactor);

      _lookAtTarget.set(0, 0, 0);
      camera.lookAt(_lookAtTarget);
    }
  });

  return { goToTarget, targets, isTransitioning: transitioning.current };
}
