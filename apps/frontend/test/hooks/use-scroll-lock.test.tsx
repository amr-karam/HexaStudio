import { describe, it, expect, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollLock } from '@/hooks/useScrollLock';

describe('useScrollLock', () => {
  const originalOverflow = document.body.style.overflow;

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = '';
    document.getElementById('main-content')?.removeAttribute('inert');
  });

  it('locks scroll when true', () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    // cleanup restores
    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it('unlocks when toggled to false', () => {
    const { rerender } = renderHook(({ locked }) => useScrollLock(locked), {
      initialProps: { locked: true },
    });
    expect(document.body.style.overflow).toBe('hidden');
    rerender({ locked: false });
    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it('does not lock when false initially', () => {
    renderHook(() => useScrollLock(false));
    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it('inert selector toggles inert attribute', () => {
    const div = document.createElement('div');
    div.id = 'main-content';
    document.body.appendChild(div);
    const { rerender, unmount } = renderHook(({ locked }) => useScrollLock(locked, { inertSelector: '#main-content' }), {
      initialProps: { locked: true },
    });
    expect(div.hasAttribute('inert')).toBe(true);
    rerender({ locked: false });
    expect(div.hasAttribute('inert')).toBe(false);
    document.body.removeChild(div);
    unmount();
  });
});
