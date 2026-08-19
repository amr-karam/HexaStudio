'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Serialises a value for `localStorage` storage.
 * Falls back to JSON-serialisation for objects; primitives use `String()`.
 */
function serialize<T>(value: T): string {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

/**
 * Parses a value read back from `localStorage`.
 * Tries `JSON.parse` first, falling back to the raw string on failure.
 */
function deserialize<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

/**
 * Synchronously reads the initial value from `localStorage`, returning
 * `fallback` if the key is missing or parsing fails. Wrapped in try/catch
 * so private-browsing or disabled-storage environments don't throw.
 */
function getInitialValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item !== null ? deserialize<T>(item) : fallback;
  } catch {
    return fallback;
  }
}

export interface UseLocalStorageOptions<T> {
  /** Optional serializer to override default JSON behaviour. */
  serialize?: (value: T) => string;
  /** Optional deserializer to override default JSON behaviour. */
  deserialize?: (value: string) => T;
  /** When true, the storage event listener broadcasts cross-tab changes. */
  sync?: boolean;
}

/**
 * A type-safe `localStorage` hook that mirrors the `useState` API.
 *
 * Values are serialised as JSON (or via a custom `serialize` function).
 * The state is updated synchronously after each write so that React
 * re-renders are immediate. When `sync` is enabled, mutations in other
 * tabs/windows are reflected in real time.
 *
 * @example
 * const [name, setName] = useLocalStorage('userName', 'Guest');
 * setName('Alice'); // writes to localStorage + triggers re-render
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { serialize: serializeFn = serialize, deserialize: deserializeFn = deserialize, sync = false } = options ?? {};

  const [storedValue, setStoredValue] = useState<T>(() => getInitialValue(key, initialValue));

  // Keep the latest serialiser/reader in a ref so the setter closure
  // always uses the most current options without re-creating.
  const optionsRef = useRef({ serializeFn, deserializeFn });
  optionsRef.current = { serializeFn, deserializeFn };

  const updateValue = useCallback(
    (value: T | ((prev: T) => T)): void => {
      setStoredValue((prev) => {
        const nextValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, optionsRef.current.serializeFn(nextValue));
        } catch {
          // localStorage unavailable (private browsing, quota exceeded, etc.)
        }
        return nextValue;
      });
    },
    [key],
  );

  const removeValue = useCallback((): void => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  useEffect(() => {
    if (!sync) return;

    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key !== key || event.defaultPrevented) return;

      try {
        const nextValue = event.newValue !== null ? optionsRef.current.deserializeFn(event.newValue) : initialValue;
        setStoredValue(nextValue);
      } catch {
        // ignore malformed storage events
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, sync, initialValue]);

  return [storedValue, updateValue, removeValue];
}
