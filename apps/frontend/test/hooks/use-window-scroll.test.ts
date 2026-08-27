import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWindowScroll } from '@/hooks/useWindowScroll';

describe('useWindowScroll', () => {
  it('returns initial scroll position', () => {
    const { result } = renderHook(() => useWindowScroll());
    expect(result.current).toHaveProperty('x');
    expect(result.current).toHaveProperty('y');
  });

  it('updates on scroll (rAF throttled)', async () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0 as unknown as number;
    });
    const { result } = renderHook(() => useWindowScroll());
    Object.defineProperty(window, 'scrollX', { value: 100, writable: true, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true, configurable: true });
    act(() => window.dispatchEvent(new Event('scroll')));
    // raf is mocked to fire synchronously, so state updates immediately
    expect(result.current.x).toBe(100);
    expect(result.current.y).toBe(200);
    rafSpy.mockRestore();
    // reset
    Object.defineProperty(window, 'scrollX', { value: 0, writable: true, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  it('removes listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useWindowScroll());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
