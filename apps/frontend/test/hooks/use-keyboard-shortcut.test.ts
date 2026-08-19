import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcut, isKeyCombo } from '@/hooks/useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fires the callback when the key is pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('is case-insensitive for the key', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('K', callback));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('fires when Ctrl/Cmd is pressed with ctrlCmd option', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { ctrlCmd: true }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    });
    expect(callback).toHaveBeenCalledTimes(1);

    callback.mockClear();
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire when ctrlCmd is required but neither meta nor ctrl is pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { ctrlCmd: true }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('does NOT fire when ctrlCmd is NOT requested but meta is pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('supports the alt modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { alt: true }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', altKey: true }));
    });
    expect(callback).toHaveBeenCalledTimes(1);

    callback.mockClear();
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('supports the shift modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { shift: true }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'K', shiftKey: true }));
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not fire inside input/textarea by default', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }));
    });

    expect(callback).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('fires inside input when ignoreInput is false', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { ignoreInput: false }));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }));
    });

    expect(callback).toHaveBeenCalledTimes(1);
    document.body.removeChild(input);
  });

  it('prevents default on match by default', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback));

    const event = new KeyboardEvent('keydown', { key: 'k' });
    const preventDefault = vi.spyOn(event, 'preventDefault');

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('does NOT prevent default when preventDefault is false', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { preventDefault: false }));

    const event = new KeyboardEvent('keydown', { key: 'k' });
    const preventDefault = vi.spyOn(event, 'preventDefault');

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('uses the latest callback without re-subscribing', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(({ cb }) => useKeyboardShortcut('k', cb), {
      initialProps: { cb: callback1 },
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    });
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    rerender({ cb: callback2 });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    });
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('cleans up the listener on unmount', () => {
    const callback = vi.fn();
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardShortcut('k', callback));
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

describe('isKeyCombo', () => {
  it('returns true for a matching key with no modifiers', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    expect(isKeyCombo(event, 'Escape')).toBe(true);
    expect(isKeyCombo(event, 'escape')).toBe(true);
  });

  it('returns false for a non-matching key', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    expect(isKeyCombo(event, 'Enter')).toBe(false);
  });

  it('returns true for Cmd/Ctrl+K with ctrlCmd option', () => {
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    expect(isKeyCombo(event, 'k', { ctrlCmd: true })).toBe(true);

    const event2 = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    expect(isKeyCombo(event2, 'k', { ctrlCmd: true })).toBe(true);
  });

  it('returns false for Cmd/Ctrl+K without ctrlCmd option', () => {
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    expect(isKeyCombo(event, 'k')).toBe(false);
  });

  it('supports alt and shift modifiers', () => {
    const event = new KeyboardEvent('keydown', { key: 'K', altKey: true, shiftKey: true });
    expect(isKeyCombo(event, 'k', { alt: true, shift: true })).toBe(true);

    const event2 = new KeyboardEvent('keydown', { key: 'k', altKey: false });
    expect(isKeyCombo(event2, 'k', { alt: true })).toBe(false);
  });
});
