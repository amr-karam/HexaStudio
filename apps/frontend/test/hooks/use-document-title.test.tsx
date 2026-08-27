import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

describe('useDocumentTitle', () => {
  const originalTitle = document.title;

  afterEach(() => {
    document.title = originalTitle;
  });

  it('sets document.title', () => {
    renderHook(() => useDocumentTitle('Hello HEXA'));
    expect(document.title).toBe('Hello HEXA');
  });

  it('updates when title changes', () => {
    const { rerender } = renderHook(({ t }) => useDocumentTitle(t), { initialProps: { t: 'A' } });
    expect(document.title).toBe('A');
    rerender({ t: 'B' });
    expect(document.title).toBe('B');
  });

  it('restores previous title on unmount', () => {
    document.title = 'Original';
    const { unmount } = renderHook(() => useDocumentTitle('New Title'));
    expect(document.title).toBe('New Title');
    unmount();
    expect(document.title).toBe('Original');
  });

  it('does not restore when restoreOnUnmount false', () => {
    document.title = 'Original';
    const { unmount } = renderHook(() => useDocumentTitle('New', { restoreOnUnmount: false }));
    unmount();
    expect(document.title).toBe('New');
  });
});
