import { describe, it, expect } from 'vitest';
import { resolveOneOsConfig, resolveHermesHome } from '../../src/one-os/config.js';

describe('ONE-OS config', () => {
  it('resolves Hermes home from HERMES_HOME', () => {
    const home = resolveHermesHome({ HERMES_HOME: '/tmp/hermes-test' } as NodeJS.ProcessEnv);
    expect(home).toBe('/tmp/hermes-test');
  });

  it('resolves profile homes without hardcoding', () => {
    const home = resolveHermesHome({ HERMES_PROFILE: 'work' } as NodeJS.ProcessEnv);
    expect(home).toContain('work');
    expect(home).toContain('.hermes');
  });

  it('never returns secret values, only presence', () => {
    const cfg = resolveOneOsConfig(
      {
        HONCHO_API_KEY: 'super-secret-value',
        HONCHO_BASE_URL: 'http://19.16.1.100:8000/',
        REPO_PATH: '/repo',
      } as NodeJS.ProcessEnv,
      '/fallback',
    );
    expect(cfg.hasHonchoKey).toBe(true);
    expect(cfg.honchoBaseUrl).toBe('http://19.16.1.100:8000');
    expect(cfg.repoPath).toBe('/repo');
    expect(JSON.stringify(cfg)).not.toContain('super-secret-value');
  });

  it('falls back to safe defaults', () => {
    const cfg = resolveOneOsConfig({} as NodeJS.ProcessEnv, '/fallback');
    expect(cfg.hasHonchoKey).toBe(false);
    expect(cfg.honchoBaseUrl).toBe('http://19.16.1.100:8000');
    expect(cfg.repoPath).toBe('/fallback');
    expect(cfg.sessionTtl).toBe(30 * 60 * 1000);
  });
});
