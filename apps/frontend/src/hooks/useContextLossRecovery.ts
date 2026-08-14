'use client';

import { useCallback, useRef } from 'react';
import type { RootState } from '@react-three/fiber';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ContextLossRecoveryOptions {
  /** Called synchronously after `webglcontextlost` fires. The render loop is already paused. */
  onLost?: () => void;
  /** Called after `webglcontextrestored` fires (after the loop has been resumed, unless `remountOnRestore`). */
  onRestore?: () => void;
  /**
   * When true the hook does NOT auto-resume the loop after restore: the caller
   * is responsible for remounting the Canvas (e.g. via a React `key` bump) so a
   * fresh WebGL context is created. Prefer this for complex scenes.
   *
   * Remounting on restore — never on lost — is the safe pattern: the Canvas stays
   * mounted (and its loop paused) while the context is lost, and only gets a
   * clean re-creation once the browser has actually restored the context.
   */
  remountOnRestore?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Guards a `<Canvas>` against the post-context-loss render race.
 *
 * R3F v9 ships NO built-in `webglcontextlost` / `webglcontextrestored`
 * handling, and its render loop is a module-level `requestAnimationFrame`
 * driven by the root's `internal.active` flag — `gl.setAnimationLoop(null)`
 * would NOT stop it (that API is only used for WebXR presentation). Flipping
 * `internal.active` is the exact mechanism R3F's own `unmountComponentAtNode`
 * uses to halt a root, so it composes with every frameloop mode.
 *
 * The browser may still dispatch a frame between invalidating the context and
 * delivering the `webglcontextlost` event (three.js's internal `render()`
 * guard only kicks in once its own listener has run); pausing the loop the
 * instant the event fires prevents any further `getProgramParameter`-style
 * errors against dead GL handles.
 *
 * Call `registerContext` from the Canvas `onCreated` handler:
 *
 * ```tsx
 * const { registerContext } = useContextLossRecovery({ remountOnRestore: true, ... });
 * <Canvas onCreated={(state) => (cleanupRef.current = registerContext(state))} />
 * ```
 *
 * @returns `registerContext` — attach the listeners for a specific renderer and
 * return a cleanup that removes them.
 */
export function useContextLossRecovery(options: ContextLossRecoveryOptions = {}) {
  // Keep the latest callbacks without re-creating the listeners on every render.
  const optionsRef = useRef<ContextLossRecoveryOptions>(options);
  optionsRef.current = options;

  const registerContext = useCallback((state: RootState): (() => void) => {
    const gl = state.gl;
    if (!gl || !gl.domElement) return () => undefined;

    const handleContextLost = (event: Event): void => {
      // Required — signals the browser we intend to restore the context.
      event.preventDefault();
      // Pause the R3F render loop for this root. Do NOT unmount or dispose:
      // the scene graph stays alive so a restore (or remount) can resume it.
      state.set((s) => ({ internal: { ...s.internal, active: false } }));
      optionsRef.current.onLost?.();
    };

    const handleContextRestored = (): void => {
      if (optionsRef.current.remountOnRestore) {
        // Caller remounts the Canvas with a fresh context; the old root is
        // disposed by R3F when React unmounts it. Do not auto-resume here.
        optionsRef.current.onRestore?.();
        return;
      }
      // three.js re-initialized its GL state in its own `webglcontextrestored`
      // handler, so the existing scene graph is reusable. Resume the loop and
      // request a frame — `invalidate` also covers `frameloop="demand"`.
      state.set((s) => ({ internal: { ...s.internal, active: true } }));
      state.invalidate();
      optionsRef.current.onRestore?.();
    };

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost, false);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored, false);
    };
  }, []);

  return { registerContext };
}

export type ContextLossRecovery = ReturnType<typeof useContextLossRecovery>;
