import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

describe('useCopyToClipboard', () => {
  const originalClipboard = navigator.clipboard;
  const originalExecCommand = document.execCommand;
  const originalCreateElement = document.createElement;

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore originals after each test.
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    }
    document.execCommand = originalExecCommand;
  });

  it('starts in idle state', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.status).toBe('idle');
    expect(result.current.isCopying).toBe(false);
  });

  it('copies text to clipboard and returns true', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCopyToClipboard(5000));

    let success: boolean;
    await act(async () => {
      success = await result.current.copy('hello world');
    });

    // success is assigned inside act; re-read result
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello world');
    expect(success!).toBe(true);
    expect(result.current.status).toBe('copied');
  });

  it('resets to idle after the specified delay', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCopyToClipboard(2000));

    await act(async () => {
      await result.current.copy('test');
    });

    expect(result.current.status).toBe('copied');

    // Advance past the reset delay.
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.status).toBe('idle');
    vi.useRealTimers();
  });

  it('falls back to execCommand when navigator.clipboard is unavailable', async () => {
    // Remove clipboard API.
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    // jsdom doesn't implement execCommand — define it before spying.
    document.execCommand = vi.fn().mockReturnValue(true);
    const execSpy = vi.spyOn(document, 'execCommand');
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => void 0);
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => void 0);
    const selectSpy = vi.spyOn(HTMLTextAreaElement.prototype, 'select').mockImplementation(() => undefined);

    const { result } = renderHook(() => useCopyToClipboard());

    let success: boolean;
    await act(async () => {
      success = await result.current.copy('fallback text');
    });

    expect(execSpy).toHaveBeenCalledWith('copy');
    expect(success!).toBe(true);
    expect(result.current.status).toBe('copied');

    execSpy.mockRestore();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
    selectSpy.mockRestore();
  });

  it('sets error status when copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCopyToClipboard());

    let success: boolean;
    await act(async () => {
      success = await result.current.copy('secret');
    });

    expect(success!).toBe(false);
    expect(result.current.status).toBe('error');
  });

  it('reset() returns status to idle', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCopyToClipboard(0));

    await act(async () => {
      await result.current.copy('text');
    });

    expect(result.current.status).toBe('copied');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
  });

  it('sets isCopying while the copy operation is in progress', async () => {
    let resolveCopy: () => void;
    const writeText = vi.fn().mockImplementation(() => new Promise<void>((resolve) => { resolveCopy = resolve; }));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCopyToClipboard());

    // Kick off a copy that won't resolve until we call resolveCopy.
    let copyPromise: Promise<boolean>;
    await act(async () => {
      copyPromise = result.current.copy('pending');
    });

    expect(result.current.isCopying).toBe(true);

    // Resolve the promise.
    act(() => {
      resolveCopy!();
    });

    await act(async () => {
      await copyPromise;
    });

    expect(result.current.isCopying).toBe(false);
    expect(result.current.status).toBe('copied');
  });
});
