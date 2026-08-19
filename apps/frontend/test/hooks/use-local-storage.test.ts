import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  const key = 'test-key';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'default'));
    const [value] = result.current;
    expect(value).toBe('default');
  });

  it('returns the stored value when one exists', () => {
    localStorage.setItem(key, 'stored-value');
    const { result } = renderHook(() => useLocalStorage(key, 'default'));
    const [value] = result.current;
    expect(value).toBe('stored-value');
  });

  it('deserializes JSON objects correctly', () => {
    localStorage.setItem(key, JSON.stringify({ name: 'Alice', age: 30 }));
    const { result } = renderHook(() => useLocalStorage(key, { name: 'Default', age: 0 }));
    const [value] = result.current;
    expect(value).toEqual({ name: 'Alice', age: 30 });
  });

  it('serializes and updates the value when the setter is called', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'first'));

    act(() => {
      const [, setValue] = result.current;
      setValue('second');
    });

    const [value] = result.current;
    expect(value).toBe('second');
    // Default serializer returns strings as-is (no JSON wrapping).
    expect(localStorage.getItem(key)).toBe('second');
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage(key, 10));

    act(() => {
      const [, setValue] = result.current;
      setValue((prev) => prev + 5);
    });

    const [value] = result.current;
    expect(value).toBe(15);
    expect(localStorage.getItem(key)).toBe('15');
  });

  it('removes the value from storage via removeValue', () => {
    localStorage.setItem(key, '"stored"');
    const { result } = renderHook(() => useLocalStorage(key, 'default'));

    act(() => {
      const [, , removeValue] = result.current;
      removeValue();
    });

    expect(localStorage.getItem(key)).toBeNull();
    const [value] = result.current;
    expect(value).toBe('default');
  });

  it('handles localStorage errors gracefully', () => {
    // Simulate localStorage throwing (e.g. private browsing).
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    const { result } = renderHook(() => useLocalStorage(key, 'fallback'));
    const [value] = result.current;
    expect(value).toBe('fallback');

    spy.mockRestore();
  });

  it('uses custom serialize/deserialize functions', () => {
    const serialize = (v: number) => `custom:${v}`;
    const deserialize = (v: string): number => parseInt(v.split(':')[1], 10);

    const { result } = renderHook(() =>
      useLocalStorage<number>(key, 42, { serialize, deserialize }),
    );

    const [value] = result.current;
    expect(value).toBe(42);
    // Initial value is NOT written to localStorage — only updates are.
    expect(localStorage.getItem(key)).toBeNull();

    act(() => {
      const [, setValue] = result.current;
      setValue(100);
    });

    expect(localStorage.getItem(key)).toBe('custom:100');
  });

  it('syncs across tabs when sync option is enabled', () => {
    const { result: result1 } = renderHook(() => useLocalStorage(key, 'initial'));
    const { result: result2 } = renderHook(() =>
      useLocalStorage(key, 'initial', { sync: true }),
    );

    act(() => {
      const [, setValue] = result1.current;
      setValue('updated-from-tab-1');
    });

    // Simulate another tab receiving the storage event.
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key, newValue: '"updated-from-tab-1"' }),
      );
    });

    const [value2] = result2.current;
    expect(value2).toBe('updated-from-tab-1');
  });

  it('does NOT sync across tabs when sync is false (default)', () => {
    const { result: result1 } = renderHook(() => useLocalStorage(key, 'initial'));
    const { result: result2 } = renderHook(() => useLocalStorage(key, 'initial'));

    act(() => {
      const [, setValue] = result1.current;
      setValue('updated');
    });

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: '"updated"' }));
    });

    const [value2] = result2.current;
    expect(value2).toBe('initial');
  });
});
