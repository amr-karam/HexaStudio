import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { create } from 'zustand';
import type { RootState } from '@react-three/fiber';
import { useContextLossRecovery } from '@/hooks/useContextLossRecovery';

/* -------------------------------------------------------------------------- */
/*  Test harness                                                               */
/* -------------------------------------------------------------------------- */

interface FakeRoot {
  internal: { active: boolean };
  frames: number;
}

/**
 * Builds a minimal structural stand-in for R3F's `RootState`: a real zustand
 * store (so `set` applies updater functions exactly like R3F's) plus a fake
 * renderer whose `domElement` is an `EventTarget` we can dispatch
 * `webglcontextlost` / `webglcontextrestored` events on.
 */
function createFakeState() {
  const store = create<FakeRoot>(() => ({ internal: { active: true }, frames: 0 }));
  const invalidate = vi.fn();
  const canvas = new EventTarget();

  const state = {
    ...store.getState(),
    set: store.setState,
    invalidate,
    gl: { domElement: canvas },
  } as unknown as RootState;

  return { store, state, invalidate, canvas };
}

function dispatch(canvas: EventTarget, type: string): Event {
  const event = new Event(type, { cancelable: true });
  canvas.dispatchEvent(event);
  return event;
}

/* -------------------------------------------------------------------------- */
/*  Tests                                                                      */
/* -------------------------------------------------------------------------- */

describe('useContextLossRecovery', () => {
  it('returns a registerContext that attaches listeners and a cleanup that removes them', () => {
    const { result } = renderHook(() => useContextLossRecovery());
    const { store, state, canvas } = createFakeState();

    const cleanup = result.current.registerContext(state);

    dispatch(canvas, 'webglcontextlost');
    expect(store.getState().internal.active).toBe(false);

    cleanup();
    // After cleanup the listener is gone: the loop must NOT be paused again.
    store.setState((s) => ({ internal: { ...s.internal, active: true } }));
    dispatch(canvas, 'webglcontextlost');
    expect(store.getState().internal.active).toBe(true);
  });

  it('pauses the loop and calls onLost on webglcontextlost, preventing default', () => {
    const onLost = vi.fn();
    const { result } = renderHook(() => useContextLossRecovery({ onLost }));
    const { store, state, canvas } = createFakeState();

    result.current.registerContext(state);

    const event = dispatch(canvas, 'webglcontextlost');

    expect(event.defaultPrevented).toBe(true);
    expect(store.getState().internal.active).toBe(false);
    expect(onLost).toHaveBeenCalledTimes(1);
  });

  it('resumes the loop, invalidates, and calls onRestore on restore (default mode)', () => {
    const onRestore = vi.fn();
    const { result } = renderHook(() => useContextLossRecovery({ onRestore }));
    const { store, state, canvas, invalidate } = createFakeState();

    result.current.registerContext(state);
    dispatch(canvas, 'webglcontextlost');
    expect(store.getState().internal.active).toBe(false);

    dispatch(canvas, 'webglcontextrestored');

    expect(store.getState().internal.active).toBe(true);
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  it('does NOT auto-resume in remountOnRestore mode — the caller remounts instead', () => {
    const onRestore = vi.fn();
    const { result } = renderHook(() => useContextLossRecovery({ remountOnRestore: true, onRestore }));
    const { store, state, canvas, invalidate } = createFakeState();

    result.current.registerContext(state);
    dispatch(canvas, 'webglcontextlost');
    expect(store.getState().internal.active).toBe(false);

    dispatch(canvas, 'webglcontextrestored');

    expect(store.getState().internal.active).toBe(false);
    expect(invalidate).not.toHaveBeenCalled();
    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  it('no-ops gracefully when the renderer is missing', () => {
    const { result } = renderHook(() => useContextLossRecovery());
    const cleanup = result.current.registerContext({} as unknown as RootState);

    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
  });
});
