export const REALTIME_PORT = Symbol('REALTIME_PORT');

export interface RealtimePort {
  // Define methods needed by other modules
  emitApprovalUpdate(data: Record<string, unknown>): void;
}
