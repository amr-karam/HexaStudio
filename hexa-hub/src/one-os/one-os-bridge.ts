/**
 * HEXA ONE OS — the perfect merge orchestrator.
 *
 * Hermes decides, OpenCode does, ONE-OS remembers.
 *
 * - `hermes` route: single Hermes call (memory / skill / gateway / desktop).
 * - `opencode` route: single OpenCode run (`build` or `plan` agent).
 * - `hybrid` route: Hermes drafts the plan, OpenCode executes it, ONE-OS
 *   returns the combined summary with both native session ids linked.
 *
 * Executors are injected so unit tests never spawn processes and the class
 * stays decoupled from any service database (Clean Architecture).
 */
import type {
  HermesExecutor,
  OneOsResult,
  OneOsRoute,
  OpencodeExecutor,
} from './types.js';
import { pickOpenCodeAgent, routeIntent } from './router.js';
import { createOneId } from './session.js';

export interface OneOsRunOptions {
  oneId?: string;
  hermesSessionId?: string;
  opencodeSessionId?: string;
}

export interface OneOsBridgeDeps {
  hermes: HermesExecutor;
  opencode: OpencodeExecutor;
  now?: () => number;
  random?: () => number;
}

function preview(prompt: string, max = 160): string {
  const clean = prompt.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) {
    return clean;
  }
  return `${clean.slice(0, max)}…`;
}

export class OneOsBridge {
  private readonly hermes: HermesExecutor;
  private readonly opencode: OpencodeExecutor;
  private readonly now: () => number;
  private readonly random: () => number;

  constructor(deps: OneOsBridgeDeps) {
    this.hermes = deps.hermes;
    this.opencode = deps.opencode;
    this.now = deps.now ?? Date.now;
    this.random = deps.random ?? Math.random;
  }

  async run(prompt: string, options: OneOsRunOptions = {}): Promise<OneOsResult> {
    const trimmed = prompt.trim();
    if (trimmed.length === 0) {
      return {
        ok: false,
        route: 'hybrid',
        oneId: options.oneId ?? createOneId(this.now(), this.random),
        summary: 'Empty prompt — nothing routed.',
        error: 'EMPTY_PROMPT',
      };
    }

    const intent = routeIntent(trimmed);
    const route: OneOsRoute = intent.route;
    const oneId = options.oneId ?? createOneId(this.now(), this.random);

    try {
      if (route === 'hermes') {
        const res = await this.hermes(trimmed, options.hermesSessionId);
        return {
          ok: true,
          route,
          oneId,
          summary: `Hermes completed: ${preview(trimmed)}`,
          output: res.output,
          hermesSessionId: res.sessionId,
          opencodeSessionId: options.opencodeSessionId,
        };
      }

      if (route === 'opencode') {
        const agent = pickOpenCodeAgent(trimmed);
        const res = await this.opencode(agent, trimmed, options.opencodeSessionId);
        return {
          ok: true,
          route,
          oneId,
          summary: `OpenCode (${agent}) completed: ${preview(trimmed)}`,
          output: res.output,
          hermesSessionId: options.hermesSessionId,
          opencodeSessionId: res.sessionId,
        };
      }

      const plan = await this.hermes(
        `Create a concise execution plan for: ${trimmed}`,
        options.hermesSessionId,
      );
      const agent = pickOpenCodeAgent(trimmed);
      const execPrompt = `Plan:\n${plan.output}\n\nTask:\n${trimmed}`;
      const exec = await this.opencode(agent, execPrompt, options.opencodeSessionId);
      return {
        ok: true,
        route,
        oneId,
        summary: `Hybrid completed (${agent}): Hermes planned, OpenCode executed: ${preview(trimmed)}`,
        output: { plan: plan.output, result: exec.output },
        hermesSessionId: plan.sessionId,
        opencodeSessionId: exec.sessionId,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        route,
        oneId,
        summary: `ONE-OS ${route} run failed: ${preview(trimmed)}`,
        error: message,
        hermesSessionId: options.hermesSessionId,
        opencodeSessionId: options.opencodeSessionId,
      };
    }
  }
}
