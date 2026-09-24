import { describe, it, expect, vi } from 'vitest';
import { OneOsBridge } from '../../src/one-os/one-os-bridge.js';

describe('ONE-OS bridge', () => {
  it('runs Hermes-only prompts through Hermes', async () => {
    const hermes = vi.fn(async (prompt: string) => ({ output: `plan:${prompt}`, sessionId: 'h-1' }));
    const opencode = vi.fn(async () => ({ output: {}, sessionId: 's-1' }));
    const bridge = new OneOsBridge({ hermes, opencode, now: () => 1_000, random: () => 0.5 });

    const res = await bridge.run('remember my deploy workflow as a skill');
    expect(res.ok).toBe(true);
    expect(res.route).toBe('hermes');
    expect(hermes).toHaveBeenCalledTimes(1);
    expect(opencode).not.toHaveBeenCalled();
    expect(res.hermesSessionId).toBe('h-1');
    expect(res.oneId.startsWith('one_')).toBe(true);
  });

  it('runs code prompts through OpenCode build', async () => {
    const hermes = vi.fn(async () => ({ output: 'x', sessionId: 'h-1' }));
    const opencode = vi.fn(async (agent: string) => ({ output: { agent }, sessionId: 's-2' }));
    const bridge = new OneOsBridge({ hermes, opencode, now: () => 1_000, random: () => 0.5 });

    const res = await bridge.run('implement retry logic and add tests');
    expect(res.ok).toBe(true);
    expect(res.route).toBe('opencode');
    expect(opencode).toHaveBeenCalledTimes(1);
    expect(opencode.mock.calls[0]?.[0]).toBe('build');
    expect(res.opencodeSessionId).toBe('s-2');
  });

  it('runs hybrid as Hermes plan then OpenCode execute', async () => {
    const hermes = vi.fn(async () => ({ output: 'STEP 1 do X', sessionId: 'h-9' }));
    const opencode = vi.fn(async () => ({ output: 'DONE', sessionId: 's-9' }));
    const bridge = new OneOsBridge({ hermes, opencode, now: () => 1_000, random: () => 0.5 });

    const res = await bridge.run('remember this repo and implement the fix');
    expect(res.ok).toBe(true);
    expect(res.route).toBe('hybrid');
    expect(hermes).toHaveBeenCalledTimes(1);
    expect(opencode).toHaveBeenCalledTimes(1);
    expect(res.hermesSessionId).toBe('h-9');
    expect(res.opencodeSessionId).toBe('s-9');
  });

  it('rejects empty prompts and captures executor errors', async () => {
    const hermes = vi.fn(async () => ({ output: 'x', sessionId: 'h-1' }));
    const opencode = vi.fn(async () => {
      throw new Error('OPENCODE_DOWN');
    });
    const bridge = new OneOsBridge({ hermes, opencode, now: () => 1_000, random: () => 0.5 });

    const empty = await bridge.run('   ');
    expect(empty.ok).toBe(false);
    expect(empty.error).toBe('EMPTY_PROMPT');

    const failed = await bridge.run('implement retry logic');
    expect(failed.ok).toBe(false);
    expect(failed.error).toBe('OPENCODE_DOWN');
  });
});
