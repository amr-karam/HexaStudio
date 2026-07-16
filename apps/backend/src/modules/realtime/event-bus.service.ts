import { Injectable } from '@nestjs/common';

type EventHandler = (payload: unknown) => void | Promise<void>;

@Injectable()
export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  async emit(event: string, payload: unknown) {
    const handlers = this.handlers.get(event);
    if (!handlers) return;
    const results: (void | Promise<void>)[] = [];
    for (const handler of handlers) {
      results.push(handler(payload));
    }
    await Promise.all(results);
  }
}
