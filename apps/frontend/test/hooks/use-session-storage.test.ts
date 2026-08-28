import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionStorage } from '@/hooks/useSessionStorage';

describe('useSessionStorage', () => {
  const key = 'test-session-key';

  beforeEach(() => {
    sessionStorage.clear();
  });

  it('returns initial value when no stored value', () => {
    const { result } = renderHook(() => useSessionStorage(key, 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('writes and reads value', () => {
    const { result } = renderHook(() => useSessionStorage(key, 'a'));
    act(() => result.current[1]('b'));
    expect(result.current[0]).toBe('b');
    expect(sessionStorage.getItem(key)).toBe('b');
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useSessionStorage(key, 1));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(2);
  });

  it('remove clears storage and resets', () => {
    const { result } = renderHook(() => useSessionStorage(key, 'init'));
    act(() => result.current[1]('changed'));
    act(() => result.current[2]());
    expect(result.current[0]).toBe('init');
    expect(sessionStorage.getItem(key)).toBeNull();
  });

  it('handles objects via JSON', () => {
    const { result } = renderHook(() => useSessionStorage(key, { a: 1 }));
    act(() => result.current[1]({ a: 2 }));
    expect(result.current[0]).toEqual({ a: 2 });
    expect(JSON.parse(sessionStorage.getItem(key)!)).toEqual({ a: 2 });
  });

  it('handles custom serializer', () => {
    const { result } = renderHook(() =>
      useSessionStorage(key, 5, {
        serialize: (v) => String(v * 2),
        deserialize: (s) => Number(s) / 2 as unknown as number,
      }),
    );
    act(() => result.current[1](10));
    expect(sessionStorage.getItem(key)).toBe('20');
  });
});
