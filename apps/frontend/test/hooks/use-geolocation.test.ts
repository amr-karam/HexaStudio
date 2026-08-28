import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from '@/hooks/useGeolocation';

describe('useGeolocation', () => {
  const mockCoords = {
    latitude: 48.8566,
    longitude: 2.3522,
    altitude: null,
    accuracy: 10,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    toJSON() { return this; },
  } as unknown as GeolocationCoordinates;

  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => vi.restoreAllMocks());

  it('returns loading initially when geolocation available', () => {
    const getCurrentPosition = vi.fn();
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition, watchPosition: vi.fn(), clearWatch: vi.fn() },
      configurable: true,
      writable: true,
    });
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.isLoading).toBe(true);
  });

  it('sets coords on success', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({ coords: mockCoords, timestamp: Date.now() } as GeolocationPosition);
    });
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition, watchPosition: vi.fn(), clearWatch: vi.fn() },
      configurable: true,
      writable: true,
    });
    const { result } = renderHook(() => useGeolocation());
    await act(async () => {});
    expect(result.current.coords).toEqual(mockCoords);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failure', async () => {
    const error = { code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as unknown as GeolocationPositionError;
    const getCurrentPosition = vi.fn((_s: PositionCallback, err: PositionErrorCallback) => err(error));
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition, watchPosition: vi.fn(), clearWatch: vi.fn() },
      configurable: true,
      writable: true,
    });
    const { result } = renderHook(() => useGeolocation());
    await act(async () => {});
    expect(result.current.error).toBe(error);
    expect(result.current.isLoading).toBe(false);
  });

  it('disabled does not call geolocation', () => {
    const getCurrentPosition = vi.fn();
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition, watchPosition: vi.fn(), clearWatch: vi.fn() },
      configurable: true,
      writable: true,
    });
    renderHook(() => useGeolocation({ enabled: false }));
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it('refresh triggers getCurrentPosition', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) =>
      success({ coords: mockCoords, timestamp: Date.now() } as GeolocationPosition),
    );
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition, watchPosition: vi.fn(), clearWatch: vi.fn() },
      configurable: true,
      writable: true,
    });
    const { result } = renderHook(() => useGeolocation());
    getCurrentPosition.mockClear();
    await act(async () => {
      result.current.refresh();
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('watch mode uses watchPosition and cleans up', () => {
    const watchPosition = vi.fn(() => 123);
    const clearWatch = vi.fn();
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: vi.fn(), watchPosition, clearWatch },
      configurable: true,
      writable: true,
    });
    const { unmount } = renderHook(() => useGeolocation({ watch: true }));
    expect(watchPosition).toHaveBeenCalledTimes(1);
    unmount();
    expect(clearWatch).toHaveBeenCalledWith(123);
  });
});
