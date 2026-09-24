import { describe, it, expect } from 'vitest';
import { routeIntent, pickOpenCodeAgent } from '../../src/one-os/router.js';

describe('ONE-OS router', () => {
  it('routes memory/skill prompts to Hermes', () => {
    const intent = routeIntent('remember my preferred deploy workflow as a skill');
    expect(intent.route).toBe('hermes');
    expect(intent.confidence).toBeGreaterThan(0.5);
  });

  it('routes desktop shell prompts to Hermes', () => {
    const intent = routeIntent('add a desktop plugin pane with Cmd+K command');
    expect(intent.route).toBe('hermes');
    expect(intent.kind).toBe('desktop-ui');
  });

  it('routes code build prompts to OpenCode', () => {
    const intent = routeIntent('implement retry logic for API calls and add tests');
    expect(intent.route).toBe('opencode');
    expect(intent.kind).toBe('code-build');
  });

  it('routes review prompts to OpenCode plan agent', () => {
    const intent = routeIntent('review PR 42 for security risks and test gaps');
    expect(intent.route).toBe('opencode');
    expect(intent.kind).toBe('code-review');
    expect(pickOpenCodeAgent('review PR 42')).toBe('plan');
    expect(pickOpenCodeAgent('implement OAuth refresh flow')).toBe('build');
  });

  it('routes mixed prompts to hybrid', () => {
    const intent = routeIntent('remember this repo and implement the fix with opencode');
    expect(intent.route).toBe('hybrid');
    expect(intent.kind).toBe('hybrid');
  });

  it('defaults ambiguous prompts to hybrid', () => {
    const intent = routeIntent('hello, what can you do?');
    expect(intent.route).toBe('hybrid');
    expect(intent.confidence).toBeLessThan(0.7);
  });
});
