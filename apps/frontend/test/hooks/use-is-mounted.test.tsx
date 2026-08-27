import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMounted } from '@/hooks/useIsMounted';

describe('useIsMounted', () => {
  it('returns true while mounted and false after unmount', () => {
    const { result, unmount } = renderHook(() => useIsMounted());
    expect(result.current()).toBe(true);
    unmount();
    expect(result.current()).toBe(false);
  });

  it('returns stable callback identity across rerenders', () => {
    const { result, rerender } = renderHook(() => useIsMounted());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
