import AsyncStorage from '@react-native-async-storage/async-storage';

const MODEL_CACHE_PREFIX = 'model_cache:';
const MAX_MODEL_CACHE_ENTRIES = 20;

export interface CachedModelMeta {
  projectId: string;
  modelUrl: string;
  format: 'gltf' | 'usdz' | 'obj';
  fileSizeBytes: number;
  cachedAt: number;
  lastAccessedAt: number;
  localUri?: string;
}

/**
 * Stores metadata and offline caching status for 3D architectural models.
 */
export async function cacheModelMetadata(meta: CachedModelMeta): Promise<void> {
  try {
    const key = `${MODEL_CACHE_PREFIX}${meta.projectId}`;
    await AsyncStorage.setItem(key, JSON.stringify(meta));
  } catch {
    // Fail silently without crashing UI
  }
}

/**
 * Retrieves cached 3D model metadata for quick AR loading.
 */
export async function getCachedModelMetadata(projectId: string): Promise<CachedModelMeta | null> {
  try {
    const key = `${MODEL_CACHE_PREFIX}${projectId}`;
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const meta: CachedModelMeta = JSON.parse(raw);
    // Update last accessed
    meta.lastAccessedAt = Date.now();
    await AsyncStorage.setItem(key, JSON.stringify(meta));
    return meta;
  } catch {
    return null;
  }
}

/**
 * Clears expired or least-recently used cached 3D models.
 */
export async function pruneModelCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const modelKeys = keys.filter((k) => k.startsWith(MODEL_CACHE_PREFIX));
    if (modelKeys.length > MAX_MODEL_CACHE_ENTRIES) {
      const items = await AsyncStorage.multiGet(modelKeys);
      const parsed = items
        .map(([k, v]) => ({ key: k, meta: v ? (JSON.parse(v) as CachedModelMeta) : null }))
        .filter((i): i is { key: string; meta: CachedModelMeta } => i.meta !== null)
        .sort((a, b) => a.meta.lastAccessedAt - b.meta.lastAccessedAt);

      const toRemove = parsed.slice(0, modelKeys.length - MAX_MODEL_CACHE_ENTRIES).map((i) => i.key);
      if (toRemove.length > 0) {
        await AsyncStorage.multiRemove(toRemove);
      }
    }
  } catch {
    // Ignore cleanup failure
  }
}
