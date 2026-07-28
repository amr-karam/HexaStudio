import { renderHook, waitFor } from '@testing-library/react-native';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';
import NetInfo from '@react-native-community/netinfo';

const mockAddEventListener = NetInfo.addEventListener as jest.Mock;
const mockFetch = NetInfo.fetch as jest.Mock;

describe('useNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    const originalError = console.error;
    jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
      if (typeof message === 'string' && message.includes('was not wrapped in act')) {
        return;
      }
      originalError(message, ...args);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('reports online when connected', async () => {
    mockFetch.mockResolvedValueOnce({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
      expect(result.current.connectionType).toBe('wifi');
    });
  });

  it('reports offline when disconnected', async () => {
    mockFetch.mockResolvedValueOnce({
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    });

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
    });
  });

  it('subscribes to network changes', () => {
    renderHook(() => useNetworkStatus());
    expect(mockAddEventListener).toHaveBeenCalled();
  });
});
