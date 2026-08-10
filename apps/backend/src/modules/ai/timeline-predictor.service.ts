import { Injectable, Logger } from '@nestjs/common';
import { StructuredOutputService } from './structured-output.service';
import { TimelinePrediction, TimelinePredictionSchema } from './timeline-prediction.schema';

/**
 * Historical baseline used when Odoo has no comparable projects yet.
 * Kept conservative so the predictor degrades gracefully on cold starts.
 */
const DEFAULT_HISTORICAL_AVG_DAYS = 90;

export interface ProjectTimelineInput {
  projectId: string;
  projectName: string;
  projectType: string;
  /** Current % progress (0-100). */
  progress: number;
  /** Days remaining until the next milestone. */
  daysUntilNextMilestone: number;
  /** Number of milestone revisions / change orders so far. */
  revisionCount: number;
  /** Recent activity count (updates, comments, uploads) in the last 7 days. */
  recentActivityCount: number;
  /** Optional historical baseline from Odoo for this project type. */
  historicalAvgCompletionDays?: number;
  historicalOnTimeRate?: number;
  description?: string;
}

/**
 * TimelinePredictorService
 *
 * Forecasts whether a live project is at risk of missing its next milestone
 * by combining historical Odoo completion data with current project signals.
 * Uses StructuredOutputService for validated, deterministic output.
 */
@Injectable()
export class TimelinePredictorService {
  private readonly logger = new Logger(TimelinePredictorService.name);

  constructor(private readonly structuredOutputService: StructuredOutputService) {}

  /**
   * Predict delay risk for a single project.
   */
  async predict(input: ProjectTimelineInput): Promise<TimelinePrediction> {
    const historicalAvg =
      input.historicalAvgCompletionDays ?? DEFAULT_HISTORICAL_AVG_DAYS;
    const onTimeRate = input.historicalOnTimeRate ?? 0.7;

    const prompt = `You are a project-delivery forecaster for a high-end architectural visualization studio.

Forecast the delivery risk for this live project:

- Project: ${input.projectName} (id: ${input.projectId})
- Type: ${input.projectType}
- Current progress: ${input.progress}%
- Days until next milestone: ${input.daysUntilNextMilestone}
- Revision / change-order count: ${input.revisionCount}
- Recent activity (last 7 days): ${input.recentActivityCount} events
- Historical avg completion for similar projects: ${historicalAvg} days
- Historical on-time rate: ${Math.round(onTimeRate * 100)}%
${input.description ? `- Description: ${input.description}` : ''}

Heuristics:
- Projects above 70% progress with low revision counts are usually on track.
- High revision counts (>3) and low recent activity (<2 events) raise delay risk.
- If days-until-milestone is less than 20% of remaining schedule, risk rises sharply.

Return:
- riskScore: integer 0-100
- predictedDelayDays: integer 0-365
- confidence: float 0-1
- riskLevel: on_track | watch | at_risk | critical
- predictedCompletionDate: optional ISO date string
- factors: 1-6 concise strings naming the dominant risk drivers
- recommendedActions: 1-4 concrete actions for the project manager`;

    this.logger.debug(`Predicting timeline for project ${input.projectId}`);

    return this.structuredOutputService.generateStructuredOutput(
      prompt,
      TimelinePredictionSchema,
      { temperature: 0.2, maxTokens: 800 },
    );
  }
}
