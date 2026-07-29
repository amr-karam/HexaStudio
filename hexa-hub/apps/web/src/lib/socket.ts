// ─── HEXA Hub — Socket.IO Client Singleton ──────────────────────────────────
// One socket connection per app, reconnect on auth token change.
// Exposes imperative connect/disconnect/getSocket.
// ─────────────────────────────────────────────────────────────────────────────

import { io, type Socket } from 'socket.io-client';

// ─── Constants ──────────────────────────────────────────────────────────────

const TOKEN_KEY = 'hub_token';
const REALTIME_URL =
  process.env.NEXT_PUBLIC_REALTIME_URL ?? 'http://localhost:3001';

// ─── Singleton State ────────────────────────────────────────────────────────

let socket: Socket | null = null;
let currentToken: string | null = null;

// ─── Helpers ────────────────────────────────────────────────────────────────

function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// ─── Connection Management ──────────────────────────────────────────────────

/**
 * Creates or returns the singleton Socket.IO connection.
 *
 * - If already connected with the same token, returns the existing socket.
 * - If the token has changed, disconnects the old socket and creates a new one.
 * - If no token is provided, reads it from localStorage via `TOKEN_KEY`.
 *
 * Returns `null` on the server side or if no token is available.
 */
export function connectSocket(token?: string | null): Socket | null {
  if (typeof window === 'undefined') return null;

  const authToken = token ?? readToken();
  if (!authToken) return null;

  // Already connected with the same token — no-op
  if (socket?.connected && currentToken === authToken) {
    return socket;
  }

  // Token changed — tear down the old connection
  if (socket && currentToken !== authToken) {
    socket.removeAllListeners();
    socket.close();
    socket = null;
  }

  currentToken = authToken;

  socket = io(REALTIME_URL, {
    auth: { token: authToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 5_000,
    timeout: 10_000,
  });

  return socket;
}

/**
 * Cleanly disconnects the singleton socket and resets all state.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.close();
    socket = null;
  }
  currentToken = null;
}

/**
 * Returns the current socket instance, or `null` if not connected.
 */
export function getSocket(): Socket | null {
  return socket;
}