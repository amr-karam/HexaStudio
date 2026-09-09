import { describe, it, expect } from 'vitest';
import {
  createOneId,
  createSessionRef,
  isSessionExpired,
  linkHermesSession,
  linkOpencodeSession,
} from '../../src/one-os/session.js';

describe('ONE-OS session', () => {
  it('creates canonical one_ ids', () => {
    const id = createOneId(1725900000000, () => 0.5);
    expect(id.startsWith('one_1725900000000_')).toBe(true);
  });

  it('creates refs with ttl window', () => {
    const ref = createSessionRef('one_1_x', 60_000, 1_000);
    expect(ref.createdAt).toBe(1_000);
    expect(ref.expiresAt).toBe(61_000);
    expect(isSessionExpired(ref, 2_000)).toBe(false);
    expect(isSessionExpired(ref, 61_001)).toBe(true);
  });

  it('links native sessions immutably', () => {
    const base = createSessionRef('one_1_x', 60_000, 1_000);
    const withHermes = linkHermesSession(base, 'hermes-abc');
    const withBoth = linkOpencodeSession(withHermes, 'ses_xyz');
    expect(base.hermesSessionId).toBeUndefined();
    expect(withHermes.hermesSessionId).toBe('hermes-abc');
    expect(withBoth.opencodeSessionId).toBe('ses_xyz');
    expect(withBoth.hermesSessionId).toBe('hermes-abc');
  });
});
