'use client';

import { useState, useCallback, useRef } from 'react';

function serialize<T>(value: T): string {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function deserialize<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

function getInitialValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.sessionStorage.getItem(key);
    return item !== null ? deserialize<T>(item) : fallback;
  } catch {
    return fallback;
  }
}

export interface UseSessionStorageOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

/**
 * Type-safe `sessionStorage` hook — same API as `useLocalStorage` but scoped to the tab session.
 * Session storage is cleared when the tab closes; ideal for wizard state, preview flags, etc.
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options?: UseSessionStorageOptions<T>,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { serialize: serializeFn = serialize, deserialize: deserializeFn = deserialize } = options ?? {};
  const [storedValue, setStoredValue] = useState<T>(() => getInitialValue(key, initialValue));
  const optionsRef = useRef({ serializeFn, deserializeFn });
  optionsRef.current = { serializeFn, deserializeFn };
  void deserializeFn; // keep ref shape symmetric with useLocalStorage

  const updateValue = useCallback(
    (value: T | ((prev: T) => T)): void => {
      setStoredValue((prev) => {
        const nextValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
        try {
          window.sessionStorage.setItem(key, optionsRef.current.serializeFn(nextValue));
        } catch {
          // private browsing / quota
        }
        return nextValue;
      });
    },
    [key],
  );

  const removeValue = useCallback((): void => {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, updateValue, removeValue];
}
