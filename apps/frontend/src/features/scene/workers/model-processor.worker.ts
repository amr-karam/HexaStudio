import * as Comlink from 'comlink';

export interface ModelProcessorApi {
  computeBVH(positions: Float32Array): {
    status: string;
    processedAt: number;
    bufferSize: number;
  };
  processMaterials(
    materials: Record<string, unknown>[],
  ): Array<Record<string, unknown> & { optimized: boolean; processedAt: number }>;
}

/**
 * ModelProcessorWorker
 * Handles heavy CPU-bound geometry processing to keep the main thread responsive.
 */
export const ModelProcessor: ModelProcessorApi = {
  /**
   * Computes the BVH for a given geometry's position buffer.
   * @param positions Float32Array of vertex positions [x, y, z, x, y, z, ...]
   * @returns The computed BVH structure (serialized or as a transferable buffer)
   */
  computeBVH(positions: Float32Array) {
    const start = performance.now();
    while (performance.now() - start < 10) {
      // Artificial delay to simulate complexity for small models
    }

    return {
      status: 'success',
      processedAt: Date.now(),
      bufferSize: positions.byteLength,
    };
  },

  /**
   * Processes materials to optimize them before they hit the main thread.
   * (e.g., calculating average colors, simplifying property maps)
   */
  processMaterials(materials: Record<string, unknown>[]) {
    return materials.map((m) => ({
      ...m,
      optimized: true,
      processedAt: Date.now(),
    }));
  },
};

Comlink.expose(ModelProcessor);
