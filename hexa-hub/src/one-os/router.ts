/**
 * HEXA ONE OS — deterministic intent router.
 *
 * Rule: Hermes decides, OpenCode does, ONE-OS remembers.
 * - Hermes route: memory / skills / gateway / messaging / desktop shell / providers.
 * - OpenCode route: bounded code build / refactor / review / tests.
 * - Hybrid route: ambiguous or full features — Hermes plans, OpenCode executes.
 *
 * Pure function: no I/O, no network, fully unit-testable.
 */
import type { OneOsIntent, OneOsIntentKind, OneOsRoute } from './types.js';

const HERMES_SIGNALS: string[] = [
  'remember',
  'memory',
  'skill',
  'gateway',
  'telegram',
  'discord',
  'slack',
  'whatsapp',
  'imessage',
  'signal',
  'matrix',
  'teams',
  'email',
  'bot mode',
  'cron',
  'curator',
  'kanban',
  'webhook',
  'profile',
  'provider setup',
  'oauth',
  'skin',
  'theme',
  'tui widget',
  'petdex',
  'desktop plugin',
  'proxy',
  'dashboard',
  'honcho',
];

const OPENCODE_SIGNALS: string[] = [
  'opencode',
  'implement',
  'refactor',
  'fix bug',
  'add test',
  'add tests',
  'unit test',
  'vitest',
  'review pr',
  'code review',
  'build feature',
  'scaffold',
  'migrate code',
  'commit',
  'merge request',
  'typescript error',
  'typecheck',
  'lint error',
  'nestjs',
  'next.js',
  'react component',
];

const DESKTOP_UI_SIGNALS: string[] = [
  'desktop',
  'electron',
  'cmd+k',
  'command palette',
  'cdp',
  'dom',
  'computed style',
  'hgui',
];

function containsAny(haystack: string, needles: string[]): string[] {
  const hits: string[] = [];
  for (const needle of needles) {
    if (haystack.includes(needle)) {
      hits.push(needle);
    }
  }
  return hits;
}

function pickAgentForCode(prompt: string): 'build' | 'plan' {
  const lowered = prompt.toLowerCase();
  if (
    lowered.startsWith('plan') ||
    lowered.includes('review') ||
    lowered.includes('audit') ||
    lowered.includes('analyze only') ||
    lowered.includes('dry run')
  ) {
    return 'plan';
  }
  return 'build';
}

export function pickOpenCodeAgent(prompt: string): 'build' | 'plan' {
  return pickAgentForCode(prompt);
}

export function routeIntent(prompt: string): OneOsIntent {
  const lowered = prompt.toLowerCase();

  const hermesHits = containsAny(lowered, HERMES_SIGNALS);
  const codeHits = containsAny(lowered, OPENCODE_SIGNALS);
  const desktopHits = containsAny(lowered, DESKTOP_UI_SIGNALS);

  const hasHermes = hermesHits.length > 0;
  const hasCode = codeHits.length > 0;
  const hasDesktop = desktopHits.length > 0;

  if (hasHermes && hasCode) {
    const kind: OneOsIntentKind = 'hybrid';
    const route: OneOsRoute = 'hybrid';
    return {
      kind,
      route,
      confidence: 0.9,
      reason: `hybrid: hermes[${hermesHits.slice(0, 3).join(',')}] + code[${codeHits.slice(0, 3).join(',')}] — Hermes plans, OpenCode executes`,
    };
  }

  if (hasCode) {
    const isReview =
      lowered.includes('review') || lowered.includes('audit') || lowered.includes('pr ');
    const kind: OneOsIntentKind = isReview ? 'code-review' : 'code-build';
    return {
      kind,
      route: 'opencode',
      confidence: 0.88,
      reason: `opencode: matched code signal [${codeHits.slice(0, 3).join(',')}]`,
    };
  }

  if (hasHermes || hasDesktop) {
    const matched = [...hermesHits, ...desktopHits].slice(0, 3).join(',');
    const kind: OneOsIntentKind = hasDesktop ? 'desktop-ui' : 'memory';
    const desktopNote = hasDesktop ? 'desktop-shell' : 'brain';
    return {
      kind,
      route: 'hermes',
      confidence: 0.86,
      reason: `hermes: matched ${desktopNote} signal [${matched}]`,
    };
  }

  return {
    kind: 'hybrid',
    route: 'hybrid',
    confidence: 0.55,
    reason: 'ambiguous — default hybrid: Hermes plans, OpenCode executes, ONE-OS remembers',
  };
}
