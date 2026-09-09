/**
 * HEXA ONE OS — unified session contract.
 *
 * One canonical id (`one_<ms>_<base36>`) maps to the two native ids:
 * Hermes `state.db` session + OpenCode `ses_*` session.
 * Immutable link helpers keep the contract easy to reason about.
 */
import type { OneOsSessionRef } from './types.js';
import { DEFAULT_SESSION_TTL_MS } from './config.js';

function randomSuffix(rand: () => number): string {
  const value = rand();
  const normalized = Number.isFinite(value) && value >= 0 && value < 1 ? value : Math.random();
  return Math.floor(normalized * 36 * 36 * 36 * 36).toString(36);
}

export function createOneId(nowMs: number = Date.now(), rand: () => number = Math.random): string {
  const safeNow = Number.isFinite(nowMs) && nowMs > 0 ? Math.floor(nowMs) : Date.now();
  return `one_${safeNow}_${randomSuffix(rand)}`;
}

export function createSessionRef(
  oneId: string,
  ttl: number = DEFAULT_SESSION_TTL_MS,
  nowMs: number = Date.now(),
): OneOsSessionRef {
  const createdAt = Number.isFinite(nowMs) && nowMs > 0 ? Math.floor(nowMs) : Date.now();
  const safeTtl = Number.isFinite(ttl) && ttl > 0 ? Math.floor(ttl) : DEFAULT_SESSION_TTL_MS;
  return {
    oneId,
    createdAt,
    expiresAt: createdAt + safeTtl,
    ttl: safeTtl,
  };
}

export function linkHermesSession(ref: OneOsSessionRef, hermesSessionId: string): OneOsSessionRef {
  return { ...ref, hermesSessionId };
}

export function linkOpencodeSession(
  ref: OneOsSessionRef,
  opencodeSessionId: string,
): OneOsSessionRef {
  return { ...ref, opencodeSessionId };
}

export function isSessionExpired(ref: OneOsSessionRef, nowMs: number = Date.now()): boolean {
  return nowMs > ref.expiresAt;
}
