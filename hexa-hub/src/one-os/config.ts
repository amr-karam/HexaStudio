/**
 * HEXA ONE OS — environment-first configuration.
 *
 * Profile-safe: resolves Hermes home from `$HERMES_HOME` (never hardcodes
 * `~/.hermes` when a profile is active). Never returns secret values.
 */
import os from 'node:os';
import path from 'node:path';
import type { OneOsConfig } from './types.js';

export const DEFAULT_HONCHO_BASE_URL = 'http://19.16.1.100:8000';
export const DEFAULT_SESSION_TTL_MS = 30 * 60 * 1000;

function homeDir(): string {
  return os.homedir();
}

export function resolveHermesHome(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = env['HERMES_HOME'];
  if (typeof explicit === 'string' && explicit.trim().length > 0) {
    return explicit;
  }
  const profile = env['HERMES_PROFILE'];
  if (typeof profile === 'string' && profile.trim().length > 0) {
    return path.join(homeDir(), '.hermes', 'profiles', profile);
  }
  return path.join(homeDir(), '.hermes');
}

export function resolveHermesProfile(env: NodeJS.ProcessEnv = process.env): string {
  const profile = env['HERMES_PROFILE'];
  if (typeof profile === 'string' && profile.trim().length > 0) {
    return profile;
  }
  return 'default';
}

export function resolveOpencodeConfigPath(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = env['OPENCODE_CONFIG'];
  if (typeof explicit === 'string' && explicit.trim().length > 0) {
    return explicit;
  }
  return path.join(homeDir(), '.config', 'opencode', 'opencode.json');
}

export function resolveOneOsConfig(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
): OneOsConfig {
  const repoPathRaw = env['REPO_PATH'];
  const repoPath =
    typeof repoPathRaw === 'string' && repoPathRaw.trim().length > 0 ? repoPathRaw : cwd;

  const honchoRaw = env['HONCHO_BASE_URL'];
  const honchoBaseUrl =
    typeof honchoRaw === 'string' && honchoRaw.trim().length > 0
      ? honchoRaw.replace(/\/+$/, '')
      : DEFAULT_HONCHO_BASE_URL;

  const ttlRaw = env['ONE_OS_SESSION_TTL_MS'];
  const parsedTtl = typeof ttlRaw === 'string' ? Number.parseInt(ttlRaw, 10) : Number.NaN;
  const sessionTtl =
    Number.isFinite(parsedTtl) && parsedTtl > 0 ? parsedTtl : DEFAULT_SESSION_TTL_MS;

  const honchoKey = env['HONCHO_API_KEY'];

  return {
    hermesHome: resolveHermesHome(env),
    hermesProfile: resolveHermesProfile(env),
    opencodeConfigPath: resolveOpencodeConfigPath(env),
    honchoBaseUrl,
    repoPath,
    sessionTtl,
    hasHonchoKey: typeof honchoKey === 'string' && honchoKey.length > 0,
  };
}
