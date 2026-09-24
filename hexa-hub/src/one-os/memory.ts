/**
 * HEXA ONE OS — unified memory renderer.
 *
 * Merges Hermes brain (Honcho workspace / peer / representation) with
 * OpenCode hands (project memory: name + stack) and the live bridge
 * (active session count + recent summaries) into one markdown snapshot
 * that either surface can consume.
 *
 * Pure + secret-free: callers pass already-redacted strings. Long inputs
 * are truncated so one surface can never blow up the other's context.
 */
import type { OneOsMemoryInputs, OneOsRoute } from './types.js';

const MAX_REPRESENTATION_CHARS = 4000;
const MAX_SUMMARIES = 10;
const MAX_SUMMARY_CHARS = 280;

function truncate(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max)}…`;
}

export function summarizeRoute(route: OneOsRoute): string {
  if (route === 'hermes') {
    return 'Hermes brain — memory / skills / gateway / desktop shell';
  }
  if (route === 'opencode') {
    return 'OpenCode hands — autonomous code execution';
  }
  return 'Hybrid — Hermes plans, OpenCode executes, ONE-OS remembers';
}

export function renderOneOsMemory(inputs: OneOsMemoryInputs, nowMs: number = Date.now()): string {
  const generatedAt = new Date(nowMs).toISOString();
  const representation =
    inputs.hermesRepresentation.trim().length > 0
      ? truncate(inputs.hermesRepresentation.trim(), MAX_REPRESENTATION_CHARS)
      : '_No Hermes representation yet._';

  const stack =
    inputs.opencodeStack.length > 0 ? inputs.opencodeStack.join(', ') : '_unknown stack_';

  const summaries = inputs.recentSummaries.slice(0, MAX_SUMMARIES).map((entry) => {
    const clean = entry.trim().length > 0 ? entry.trim() : '_empty summary_';
    return `- ${truncate(clean, MAX_SUMMARY_CHARS)}`;
  });

  const lines: string[] = [
    '# HEXA ONE OS — Unified Memory',
    '',
    `- Generated: \`${generatedAt}\``,
    `- Hermes workspace: \`${inputs.hermesWorkspaceId}\` / peer \`${inputs.hermesPeerId}\``,
    `- OpenCode project: \`${inputs.opencodeProjectName}\` (${stack})`,
    `- Bridge sessions: \`${inputs.bridgeSessionCount}\``,
    '',
    '## Hermes Brain',
    '',
    representation,
    '',
    '## OpenCode Hands',
    '',
    `- Project: ${inputs.opencodeProjectName}`,
    `- Stack: ${stack}`,
    `- Active bridge sessions: ${inputs.bridgeSessionCount}`,
    '',
    '## Recent Work',
    '',
  ];

  if (summaries.length > 0) {
    lines.push(...summaries);
  } else {
    lines.push('- No recent summaries yet.');
  }
  lines.push('');

  return lines.join('\n');
}
