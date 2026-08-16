import * as Comlink from 'comlink';

export class ModelWorkerManager {
  private static instance: ModelWorkerManager;
  private worker: Worker;
  public api: Comlink.Remote<any>;

  private constructor() {
    // Use the worker with a compatible loader (Next.js / Webpack)
    this.worker = new Worker(
      new URL('./workers/model-processor.worker.ts', import.meta.url),
      { type: 'module' }
    );
    this.api = Comlink.wrap(this.worker);
  }

  public static getInstance(): ModelWorkerManager {
    if (!ModelWorkerManager.instance) {
      ModelWorkerManager.instance = new ModelWorkerManager();
    }
    return ModelWorkerManager.instance;
  }

  public terminate() {
    this.worker.terminate();
  }
}
