import { renderHook, waitFor, act } from '@testing-library/react-native';
import * as Updates from 'expo-updates';
import { useOTAUpdates } from '../src/hooks/useOTAUpdates';

const mockCheckForUpdateAsync = Updates.checkForUpdateAsync as jest.Mock;
const mockFetchUpdateAsync = Updates.fetchUpdateAsync as jest.Mock;
const mockReloadAsync = Updates.reloadAsync as jest.Mock;

describe('useOTAUpdates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.__DEV__ = false;
  });

  afterEach(() => {
    global.__DEV__ = true;
  });

  it('checks for updates on mount', async () => {
    mockCheckForUpdateAsync.mockResolvedValueOnce({ isAvailable: true });

    const { result } = renderHook(() => useOTAUpdates());

    await waitFor(() => {
      expect(result.current.status).toBe('available');
      expect(result.current.isUpdateAvailable).toBe(true);
    });
  });

  it('reports up-to-date when no update is available', async () => {
    mockCheckForUpdateAsync.mockResolvedValueOnce({ isAvailable: false });

    const { result } = renderHook(() => useOTAUpdates());

    await waitFor(() => {
      expect(result.current.status).toBe('up-to-date');
    });
  });

  it('downloads and applies an update', async () => {
    mockCheckForUpdateAsync.mockResolvedValueOnce({ isAvailable: true });
    mockFetchUpdateAsync.mockResolvedValueOnce({ isNew: true });

    const { result } = renderHook(() => useOTAUpdates());

    await waitFor(() => expect(result.current.status).toBe('available'));

    await act(async () => {
      await result.current.download();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
      expect(result.current.isUpdatePending).toBe(true);
    });

    await act(async () => {
      await result.current.restart();
    });
    expect(mockReloadAsync).toHaveBeenCalled();
  });

  it('handles update check errors gracefully', async () => {
    mockCheckForUpdateAsync.mockRejectedValueOnce(new Error('Network failure'));

    const { result } = renderHook(() => useOTAUpdates());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
      expect(result.current.error).not.toBeNull();
    });
  });
});
