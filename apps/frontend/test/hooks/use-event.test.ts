import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEvent } from '@/hooks/useEvent';

describe('useEvent', () => {
  afterEach(() => vi.restoreAllMocks());

  it('attaches a window event listener', () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useEvent('resize', handler, { target: 'window' }));

    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function), false);

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function), false);
  });

  it('attaches a document event listener', () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useEvent('visibilitychange', handler, { target: 'document' }));

    expect(addSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function), false);

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function), false);
  });

  it('calls the handler when the event fires', () => {
    const handler = vi.fn();
    renderHook(() => useEvent('click', handler));

    act(() => {
      window.dispatchEvent(new Event('click'));
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('uses the latest handler without re-subscribing', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const { rerender } = renderHook(({ handler }) => useEvent('resize', handler), {
      initialProps: { handler: handler1 },
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).not.toHaveBeenCalled();

    rerender({ handler: handler2 });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('attaches to a ref element when one is provided', () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(Element.prototype, 'addEventListener');

    const ref = { current: document.createElement('div') };
    renderHook(() => useEvent('click', handler, { target: ref }));

    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function), false);
  });

  it('supports passive and once options', () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(window, 'addEventListener');

    const { unmount } = renderHook(() =>
      useEvent('scroll', handler, { target: 'window', passive: true, once: true }),
    );

    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
      once: true,
      capture: false,
    });

    unmount();
  });

  it('supports capture option', () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(window, 'addEventListener');

    const { unmount } = renderHook(() =>
      useEvent('click', handler, { target: 'window', capture: true }),
    );

    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function), {
      passive: false,
      once: false,
      capture: true,
    });

    unmount();
    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function), {
      passive: false,
      once: false,
      capture: true,
    });
  });

  it('cleans up the listener on unmount', () => {
    const handler = vi.fn();
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useEvent('keydown', handler));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function), false);
  });
});
