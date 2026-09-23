import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { OdooApiService } from '../odoo/odoo-api.service';
import { AGENTS_PORT } from '../../ports/agents.port';
import type { AgentsPort } from '../../ports/agents.port';
import { WorkflowEngineService } from '../workflow/workflow-engine.service';

export interface CoordinatorDecision {
  shouldUpdate: boolean;
  projectIdentifier: string | null;
  newStatus: string | null;
  reasoning: string;
}

export interface CoordinatorResult {
  action: 'updated' | 'skipped' | 'not_found' | 'error';
  odooProjectId?: number;
  projectName?: string;
  previousStatus?: string;
  newStatus?: string;
  reasoning: string;
  agentToolCalls: number;
}

const VALID_STATUSES = [
  'inquiry',
  'consultation',
  'proposal',
  'active',
  'on_hold',
  'completed',
  'archived',
] as const;

@Injectable()
export class GitLabOdooCoordinatorService {
  private readonly logger = new Logger(GitLabOdooCoordinatorService.name);

  constructor(
    private readonly odooApi: OdooApiService,
    @Inject(AGENTS_PORT) private readonly agentsService: AgentsPort,
    @Optional() private readonly workflowEngine?: WorkflowEngineService,
  ) {}

  /**
   * Coordinate a GitLab event into an Odoo project status transition.
   *
   * 1. Extract semantic intent from the raw GitLab payload.
   * 2. Delegate to HEXA-PM agent for reasoning (with memory + tools).
   * 3. Resolve the Odoo project by slug or fuzzy name.
   * 4. Apply the status transition via OdooApiService.
   */
  async coordinate(
    payload: Record<string, unknown>,
  ): Promise<CoordinatorResult> {
    const extracted = this.extractContext(payload);
    this.logger.log(
      `Coordinator received ${extracted.eventKind} for ${extracted.repo} — ${extracted.title}`,
    );

    const decision = await this.analyzeWithAgent(extracted);
    this.logger.log(
      `Agent decision: shouldUpdate=${decision.shouldUpdate} project=${decision.projectIdentifier} status=${decision.newStatus} — ${decision.reasoning}`,
    );

    if (!decision.shouldUpdate || !decision.projectIdentifier || !decision.newStatus) {
      return {
        action: 'skipped',
        reasoning: decision.reasoning,
        agentToolCalls: 0,
      };
    }

    if (!this.isValidStatus(decision.newStatus)) {
      this.logger.warn(
        `Agent returned invalid status "${decision.newStatus}" — allowed: ${VALID_STATUSES.join(', ')}`,
      );
      return {
        action: 'skipped',
        reasoning: `Invalid status "${decision.newStatus}" — coordinator aborted. Original reasoning: ${decision.reasoning}`,
        agentToolCalls: 0,
      };
    }

    // Resolve Odoo project
    const project = await this.resolveProject(decision.projectIdentifier);
    if (!project) {
      this.logger.warn(
        `Odoo project not found for identifier "${decision.projectIdentifier}"`,
      );
      return {
        action: 'not_found',
        reasoning: `Project "${decision.projectIdentifier}" not found in Odoo. Agent wanted to set ${decision.newStatus}. ${decision.reasoning}`,
        agentToolCalls: 0,
      };
    }

    const previousStatus = (project.x_hexa_status as string) ?? 'unknown';

    // Idempotency: skip if already at target status
    if (previousStatus === decision.newStatus) {
      return {
        action: 'skipped',
        odooProjectId: project.id as number,
        projectName: project.name as string,
        previousStatus,
        newStatus: decision.newStatus,
        reasoning: `Already at status "${decision.newStatus}" — no update needed. ${decision.reasoning}`,
        agentToolCalls: 0,
      };
    }

    try {
      await this.odooApi.updateProject(project.id as number, {
        x_hexa_status: decision.newStatus,
      });
      this.logger.log(
        `Odoo project #${project.id} "${project.name}" → ${previousStatus} → ${decision.newStatus} (trigger: ${extracted.eventKind})`,
      );

      // Audit trail: fire workflow event for downstream automation + history
      if (this.workflowEngine) {
        try {
          await this.workflowEngine.handleEvent('project.updated' as unknown as never, {
            projectId: project.id as number,
            projectName: project.name as string,
            previousStatus,
            newStatus: decision.newStatus,
            trigger: extracted.eventKind,
            repo: extracted.repo,
            reasoning: decision.reasoning,
          } as Record<string, unknown>);
        } catch (wfError) {
          this.logger.debug(`Workflow audit emit skipped: ${wfError}`);
        }
      }

      return {
        action: 'updated',
        odooProjectId: project.id as number,
        projectName: project.name as string,
        previousStatus,
        newStatus: decision.newStatus,
        reasoning: decision.reasoning,
        agentToolCalls: 0,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update Odoo project #${project.id}: ${message}`);
      return {
        action: 'error',
        odooProjectId: project.id as number,
        projectName: project.name as string,
        previousStatus,
        newStatus: decision.newStatus,
        reasoning: `Odoo write failed: ${message}. Agent reasoning: ${decision.reasoning}`,
        agentToolCalls: 0,
      };
    }
  }

  private extractContext(payload: Record<string, unknown>): {
    eventKind: string;
    repo: string;
    title: string;
    description: string;
    state: string;
    targetBranch: string;
    labels: string;
  } {
    // GitLab Merge Request payload
    const objectKind = (payload.object_kind as string) ?? 'unknown';
    const objectAttrs = (payload.object_attributes as Record<string, unknown>) ?? {};
    const project = (payload.project as Record<string, unknown>) ?? {};

    // Fallback to pr-review DTO shape (prTitle/repo) for direct calls
    const repo =
      (project.path_with_namespace as string) ??
      (payload.repo as string) ??
      'unknown/repo';
    const title =
      (objectAttrs.title as string) ??
      (payload.prTitle as string) ??
      (payload.title as string) ??
      '';
    const description =
      (objectAttrs.description as string) ??
      (payload.prDescription as string) ??
      '';
    const state =
      (objectAttrs.state as string) ??
      (objectAttrs.action as string) ??
      (payload.state as string) ??
      '';
    const targetBranch =
      (objectAttrs.target_branch as string) ??
      (payload.target_branch as string) ??
      '';
    const labelsRaw =
      (objectAttrs.labels as unknown[]) ??
      ((payload as Record<string, unknown>).labels as unknown[]) ??
      [];
    const labels = Array.isArray(labelsRaw)
      ? labelsRaw
          .map((l) =>
            typeof l === 'string' ? l : ((l as Record<string, unknown>).title as string) ?? '',
          )
          .join(', ')
      : '';

    return {
      eventKind: objectKind,
      repo,
      title,
      description,
      state,
      targetBranch,
      labels,
    };
  }

  private async analyzeWithAgent(extracted: {
    eventKind: string;
    repo: string;
    title: string;
    description: string;
    state: string;
    targetBranch: string;
    labels: string;
  }): Promise<CoordinatorDecision> {
    const prompt = `You are HEXA-PM, the autonomous project coordinator. Analyze this GitLab engineering event and decide if an Odoo ERP project status should be updated.

Event:
- kind: ${extracted.eventKind}
- repo: ${extracted.repo}
- title: ${extracted.title}
- description: ${extracted.description.slice(0, 800)}
- state/action: ${extracted.state}
- target_branch: ${extracted.targetBranch}
- labels: ${extracted.labels || 'none'}

Odoo project statuses (use EXACTLY one of these if updating): ${VALID_STATUSES.join(', ')}
- inquiry: initial contact
- consultation: discovery phase
- proposal: proposal sent
- active: work in progress
- on_hold: paused
- completed: delivered
- archived: closed/cancelled

Rules:
1. Only return shouldUpdate=true if the event clearly signals a business-phase transition (e.g., MR merged to main with label "release" or title contains "feat: ..." that completes a milestone).
2. projectIdentifier should be a slug or name derived from repo (e.g., "platform" from "hexastudio/platform") or from title. Use lowercase kebab-case.
3. If the event is a push to feature branch, draft MR, or non-main target, usually shouldUpdate=false.
4. Be conservative — prefer skipped over false positives.

Respond with ONLY valid JSON (no markdown, no explanation outside JSON):
{"shouldUpdate": boolean, "projectIdentifier": string|null, "newStatus": string|null, "reasoning": string}`;

    try {
      const result = await this.agentsService.chat(prompt, 'pm');
      const json = this.extractJson(result.response);
      if (!json) {
        return {
          shouldUpdate: false,
          projectIdentifier: null,
          newStatus: null,
          reasoning: `Agent did not return JSON — raw: ${result.response.slice(0, 400)}`,
        };
      }
      const parsed = JSON.parse(json) as CoordinatorDecision;
      return {
        shouldUpdate: Boolean(parsed.shouldUpdate),
        projectIdentifier: parsed.projectIdentifier ?? null,
        newStatus: parsed.newStatus ?? null,
        reasoning: parsed.reasoning ?? 'No reasoning provided',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Agent analysis failed, falling back to heuristic: ${message}`);
      return this.heuristicDecision(extracted);
    }
  }

  private extractJson(text: string): string | null {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : null;
  }

  private heuristicDecision(extracted: {
    repo: string;
    title: string;
    state: string;
    targetBranch: string;
    labels: string;
  }): CoordinatorDecision {
    const isMerged =
      extracted.state === 'merged' ||
      extracted.state === 'closed' ||
      extracted.labels.includes('merged');
    const isMain = extracted.targetBranch === 'main' || extracted.targetBranch === 'master';
    const titleLower = extracted.title.toLowerCase();

    if (isMerged && isMain) {
      const slug = this.slugFromRepo(extracted.repo);
      let newStatus: string | null = 'active';
      if (titleLower.includes('release') || extracted.labels.includes('release')) {
        newStatus = 'completed';
      } else if (titleLower.includes('fix') || titleLower.includes('hotfix')) {
        newStatus = 'active';
      }
      return {
        shouldUpdate: true,
        projectIdentifier: slug,
        newStatus,
        reasoning: 'Heuristic fallback: merged to main → active/completed',
      };
    }

    return {
      shouldUpdate: false,
      projectIdentifier: null,
      newStatus: null,
      reasoning: 'Heuristic fallback: no main-branch merge detected',
    };
  }

  private slugFromRepo(repo: string): string {
    const parts = repo.split('/');
    const last = parts[parts.length - 1] ?? repo;
    return last.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  private async resolveProject(
    identifier: string,
  ): Promise<Record<string, unknown> | null> {
    // 1. Try slug exact match
    try {
      const bySlug = await this.odooApi.findProjectBySlug(identifier);
      if (bySlug) return bySlug as unknown as Record<string, unknown>;
    } catch {
      // ignore
    }

    // 2. Fuzzy search by name (ilike)
    try {
      const projects = await this.odooApi.getProjects(50, 0);
      const lower = identifier.toLowerCase();
      const match = (projects as unknown as Record<string, unknown>[]).find((p) => {
        const name = String(p.name ?? '').toLowerCase();
        const slug = String(p.x_slug ?? '').toLowerCase();
        return name.includes(lower) || slug.includes(lower) || lower.includes(name);
      });
      return match ?? null;
    } catch {
      return null;
    }
  }

  private isValidStatus(status: string): boolean {
    return (VALID_STATUSES as readonly string[]).includes(status);
  }
}
