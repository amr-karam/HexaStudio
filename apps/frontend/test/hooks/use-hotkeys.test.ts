import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHotkeys } from '@/hooks/useHotkeys';

describe('useHotkeys', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fires the matching callback', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    renderHook(() =>
      useHotkeys([
        { key: 'k', callback: cb1 },
        { key: 'j', callback: cb2 },
      ]),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
    });

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it('supports ctrlCmd modifier', () => {
    const cb = vi.fn();

    renderHook(() =>
      useHotkeys([
        { key: 'k', ctrlCmd: true, callback: cb },
      ]),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    });
    expect(cb).toHaveBeenCalledTimes(1);

    cb.mockClear();
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    });
    expect(cb).toHaveBeenCalledTimes(1);

    cb.mockClear();
    // No modifier — should not fire.
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it('supports alt and shift modifiers', () => {
    const cb = vi.fn();

    renderHook(() =>
      useHotkeys([
        { key: 'ArrowUp', shift: true, callback: cb },
      ]),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', shiftKey: true }));
    });
    expect(cb).toHaveBeenCalledTimes(1);

    cb.mockClear();
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it('fires only the first matching handler', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    renderHook(() =>
      useHotkeys([
        { key: 'Escape', callback: cb1 },
        { key: 'Escape', callback: cb2 },
      ]),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).not.toHaveBeenCalled();
  });

  it('does not fire inside input/textarea by default', () => {
    const cb = vi.fn();

    renderHook(() =>
      useHotkeys([{ key: 'Escape', callback: cb }]),
    );

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    expect(cb).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('uses the latest callbacks without re-subscribing', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const { rerender } = renderHook(
      ({ cb }) =>
        useHotkeys([{ key: 'k', callback: cb }]),
      { initialProps: { cb: cb1 } },
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    });
    expect(cb1).toHaveBeenCalledTimes(1);

    rerender({ cb: cb2 });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    });
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it('prevents default on match by default', () => {
    const cb = vi.fn();

    renderHook(() =>
      useHotkeys([{ key: 'k', callback: cb }]),
    );

    const event = new KeyboardEvent('keydown', { key: 'k' });
    const preventDefault = vi.spyOn(event, 'preventDefault');

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('does NOT prevent default when preventDefault is false', () => {
    const cb = vi.fn();

    renderHook(() =>
      useHotkeys([{ key: 'k', callback: cb, preventDefault: false }]),
    );

    const event = new KeyboardEvent('keydown', { key: 'k' });
    const preventDefault = vi.spyOn(event, 'preventDefault');

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('does not fire for IME composition by default', () => {
    const cb = vi.fn();

    renderHook(() =>
      useHotkeys([{ key: 'k', callback: cb }]),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', isComposing: true }));
    });

    expect(cb).not.toHaveBeenCalled();
  });

  it('cleans up the listener on unmount', () => {
    const cb = vi.fn();
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useHotkeys([{ key: 'k', callback: cb }]),
    );

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('handles an empty hotkeys array without errors', () => {
    const { unmount } = renderHook(() => useHotkeys([]));
    expect(() => unmount()).not.toThrow();
  });
});
