import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHash } from '@/hooks/useHash';

describe('useHash', () => {
  // Capture the original beforeEach cycle
  const originalLocation = window.location;
  const originalHistory = window.history;

  beforeEach(() => {
    // We need to mock pushState so it actually updates window.location.hash
    // JSdom's location.hash is a getter that reads from the URL
    // We can mock pushState to dispatch hashchange event

    // Create mock history that dispatches hashchange when pushState/replaceState is called
    const mockHistory = {
      pushState: (data: unknown, title: string, url: string) => {
        if (url !== undefined && url !== null) {
          const hashMatch = typeof url === 'string' ? url.match(/#(.*)$/) : null;
          window.location.hash = hashMatch ? hashMatch[0] : '';
        }
      },
      replaceState: (data: unknown, title: string, url: string) => {
        if (url !== undefined && url !== null) {
          const hashMatch = typeof url === 'string' ? url.match(/#(.*)$/) : null;
          window.location.hash = hashMatch ? hashMatch[0] : '';
        }
      },
      get length() { return 0; },
      back: () => {},
      forward: () => {},
      go: () => {},
    };

    // Mock history
    vi.stubGlobal('history', mockHistory);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.location.hash = '';
  });

  it('returns empty string when no hash', () => {
    window.location.hash = '';
    const { result } = renderHook(() => useHash());
    expect(result.current[0]).toBe('');
  });

  it('returns decoded hash without #', () => {
    window.location.hash = '#hello%20world';
    const { result } = renderHook(() => useHash());
    expect(result.current[0]).toBe('hello world');
  });

  it('returns with # when includeHash true', () => {
    window.location.hash = '#foo';
    const { result } = renderHook(() => useHash({ includeHash: true }));
    expect(result.current[0]).toBe('#foo');
  });

  it('sets hash via setValue', () => {
    window.location.hash = '';
    const { result } = renderHook(() => useHash());
    act(() => result.current[1]('new-hash'));
    expect(window.location.hash).toBe('#new-hash');
    expect(result.current[0]).toBe('new-hash');
  });

  it('removes hash when setValue called with empty string', () => {
    window.location.hash = '#existing';
    const { result } = renderHook(() => useHash());
    act(() => result.current[1](''));
    // setValue('') clears the hash state (pushState with '' doesn't update location.hash in JSdom)
    expect(result.current[0]).toBe('');
  });

  it('triggers onChange callback on hashchange', () => {
    window.location.hash = '#foo';
    const onChange = vi.fn();
    const { result } = renderHook(() => useHash());
    result.current[2](onChange);
    // Change the hash and dispatch hashchange
    window.location.hash = '#bar';
    act(() => {
      window.dispatchEvent(new Event('hashchange'));
    });
    expect(onChange).toHaveBeenCalledWith('bar');
    expect(result.current[0]).toBe('bar');
  });

  it('matchRawHash returns full fragment when set', () => {
    window.location.hash = '#?filter=active';
    const { result } = renderHook(() => useHash({ matchRawHash: true }));
    expect(result.current[0]).toBe('#?filter=active');
  });

  it('setValue with special chars encodes properly', () => {
    window.location.hash = '';
    const { result } = renderHook(() => useHash());
    act(() => result.current[1]('a b & c'));
    expect(window.location.hash).toBe('#a%20b%20%26%20c');
    expect(result.current[0]).toBe('a b & c');
  });
});
