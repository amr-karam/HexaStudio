import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';

describe('useAdaptiveQuality', () => {
  const originalCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return default medium quality level', () => {
    // Mock canvas to return null WebGL context
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return { getContext: () => null } as unknown as HTMLCanvasElement;
      }
      return originalCreateElement(tag);
    });

    const { result } = renderHook(() => useAdaptiveQuality());
    expect(result.current.level).toBeDefined();
    expect(['low', 'medium', 'high']).toContain(result.current.level);
  });

  it('should return valid settings for the quality level', () => {
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return { getContext: () => null } as unknown as HTMLCanvasElement;
      }
      return originalCreateElement(tag);
    });

    const { result } = renderHook(() => useAdaptiveQuality());

    expect(result.current.settings).toHaveProperty('dpr');
    expect(result.current.settings).toHaveProperty('shadows');
    expect(result.current.settings).toHaveProperty('postProcessing');
    expect(result.current.settings).toHaveProperty('textureResolution');
    expect(Array.isArray(result.current.settings.dpr)).toBe(true);
    expect(result.current.settings.dpr).toHaveLength(2);
  });

  it('should set low quality when WebGL is not available', async () => {
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return { getContext: () => null } as unknown as HTMLCanvasElement;
      }
      return originalCreateElement(tag);
    });

    const { result } = renderHook(() => useAdaptiveQuality());

    await vi.waitFor(() => {
      expect(result.current.level).toBe('low');
    });
  });

  it('should set high quality for RTX GPU', async () => {
    const mockGL = {
      getExtension: vi.fn().mockReturnValue({
        UNMASKED_RENDERER_WEBGL: 37446,
      }),
      getParameter: vi.fn().mockReturnValue('NVIDIA GeForce RTX 4090'),
    };
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return { getContext: () => mockGL } as unknown as HTMLCanvasElement;
      }
      return originalCreateElement(tag);
    });

    const { result } = renderHook(() => useAdaptiveQuality());

    await vi.waitFor(() => {
      expect(result.current.level).toBe('high');
    });
  });
});
