import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHash } from '@/hooks/useHash';

describe('useHash', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        hash: '',
        href: 'https://example.com/',
        pathname: '/',
        search: '',
        protocol: 'https:',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
        origin: 'https://example.com',
        assign: vi.fn(),
        reload: vi.fn(),
        replace: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
    vi.spyOn(history, 'pushState').mockImplementation(() => {});
    vi.spyOn(history, 'replaceState').mockImplementation(() => {});
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('returns empty string when no hash', () => {
    const { result } = renderHook(() => useHash());
    expect(result.current[0]).toBe('');
  });

  it('returns decoded hash without #', () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        hash: '#hello%20world',
      },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useHash());
    expect(result.current[0]).toBe('hello world');
  });

  it('returns with # when includeHash true', () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        hash: '#foo',
      },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useHash({ includeHash: true }));
    expect(result.current[0]).toBe('#foo');
  });

  it('sets hash via setValue', () => {
    const { result } = renderHook(() => useHash());
    act(() => result.current[1]('new-hash'));
    expect(window.location.hash).toBe('#new-hash');
    expect(result.current[0]).toBe('new-hash');
  });

  it('removes hash when setValue called with empty string', () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        hash: '#existing',
      },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useHash());
    act(() => result.current[1](''));
    expect(window.location.hash).toBe('');
    expect(result.current[0]).toBe('');
  });

  it('triggers onChange callback on hashchange', () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        hash: '#foo',
      },
      writable: true,
      configurable: true,
    });
    const onChange = vi.fn();
    const { result } = renderHook(() => useHash());
    result.current[2](onChange);
    // simulate hashchange
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        hash: '#bar',
      },
      writable: true,
      configurable: true,
    });
    window.dispatchEvent(new Event('hashchange'));
    expect(onChange).toHaveBeenCalledWith('bar');
    expect(result.current[0]).toBe('bar');
  });

  it('matchRawHash returns full fragment when set', () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        hash: '#?filter=active',
      },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useHash({ matchRawHash: true }));
    expect(result.current[0]).toBe('#?filter=active');
  });

  it('setValue with special chars encodes properly', () => {
    const { result } = renderHook(() => useHash());
    act(() => result.current[1]('a b & c'));
    expect(window.location.hash).toBe('#a%20b%20%26%20c');
    expect(result.current[0]).toBe('a b & c');
  });
});
