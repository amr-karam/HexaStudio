export interface RealtimePort {
  broadcastEvent(event: string, payload: Record<string, unknown>): void;
  broadcastToRoom(roomId: string, event: string, payload: Record<string, unknown>): void;
  joinRoom(clientId: string, roomId: string): void;
  leaveRoom(clientId: string, roomId: string): void;
  // EventBus methods for SwarmOrchestrator
  on(event: string, handler: (payload: unknown) => void | Promise<void>): () => void;
  emit(event: string, payload: unknown): Promise<void>;
}

export const REALTIME_PORT = Symbol('REALTIME_PORT');