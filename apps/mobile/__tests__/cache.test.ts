import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCachedData, setCachedData, clearCache, getCacheAge } from '../src/lib/cache';

const mockSetItem = AsyncStorage.setItem as jest.Mock;
const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockRemoveItem = AsyncStorage.removeItem as jest.Mock;
const mockGetAllKeys = AsyncStorage.getAllKeys as jest.Mock;
const mockMultiRemove = AsyncStorage.multiRemove as jest.Mock;

describe('cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
  });

  it('stores and retrieves cached data', async () => {
    mockGetItem.mockResolvedValueOnce(
      JSON.stringify({ data: { hello: 'world' }, cachedAt: Date.now(), expiresAt: Date.now() + 60000 }),
    );
    const data = await getCachedData<{ hello: string }>('test');
    expect(data).toEqual({ hello: 'world' });
  });

  it('returns null for expired entries', async () => {
    mockGetItem.mockResolvedValueOnce(
      JSON.stringify({ data: { hello: 'world' }, cachedAt: Date.now() - 120000, expiresAt: Date.now() - 60000 }),
    );
    const data = await getCachedData<{ hello: string }>('test');
    expect(data).toBeNull();
    expect(mockRemoveItem).toHaveBeenCalledWith('cache:test');
  });

  it('writes cache entries with TTL', async () => {
    await setCachedData('test', { value: 42 }, 5);
    expect(mockSetItem).toHaveBeenCalledWith('cache:test', expect.stringContaining('value'));
  });

  it('clears all cache keys', async () => {
    mockGetAllKeys.mockResolvedValueOnce(['cache:a', 'cache:b', 'other']);
    await clearCache();
    expect(mockMultiRemove).toHaveBeenCalledWith(['cache:a', 'cache:b']);
  });

  it('returns cache age in minutes', async () => {
    mockGetItem.mockResolvedValueOnce(
      JSON.stringify({ data: {}, cachedAt: Date.now() - 120000, expiresAt: Date.now() + 60000 }),
    );
    const age = await getCacheAge('test');
    expect(age).toBeCloseTo(2, 0);
  });
});
