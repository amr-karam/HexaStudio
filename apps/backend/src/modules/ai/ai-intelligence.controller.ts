import { Body, Controller, Get, Logger, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LeadScoringService } from './lead-scoring.service';
import { TimelinePredictorService, ProjectTimelineInput } from './timeline-predictor.service';
import { LeadScore } from './lead-score.schema';
import { TimelinePrediction } from './timeline-prediction.schema';

/**
 * AI Intelligence Controller
 *
 * Exposes the new Horizon-3 intelligence endpoints:
 *  - POST /ai/leads/score      → autonomous lead classification
 *  - GET  /ai/projects/:id/prediction → delay risk forecast
 */
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiIntelligenceController {
  private readonly logger = new Logger(AiIntelligenceController.name);

  constructor(
    private readonly leadScoringService: LeadScoringService,
    private readonly timelinePredictorService: TimelinePredictorService,
  ) {}

  @Post('leads/score')
  @Roles('admin', 'editor')
  async scoreLead(
    @Body()
    body: {
      name: string;
      company?: string;
      email: string;
      service?: string;
      budget?: string;
      location?: string;
      message: string;
    },
  ): Promise<LeadScore> {
    this.logger.log(`Scoring lead for ${body.email}`);
    return this.leadScoringService.scoreLead(body);
  }

  @Get('projects/:id/prediction')
  @Roles('admin', 'editor')
  async predictTimeline(
    @Param('id') id: string,
    @Query() query: Record<string, string>,
  ): Promise<TimelinePrediction> {
    const input: ProjectTimelineInput = {
      projectId: id,
      projectName: query.projectName ?? `Project ${id}`,
      projectType: query.projectType ?? 'architectural_visualization',
      progress: Number(query.progress ?? 0),
      daysUntilNextMilestone: Number(query.daysUntilNextMilestone ?? 30),
      revisionCount: Number(query.revisionCount ?? 0),
      recentActivityCount: Number(query.recentActivityCount ?? 0),
      historicalAvgCompletionDays: query.historicalAvgCompletionDays
        ? Number(query.historicalAvgCompletionDays)
        : undefined,
      historicalOnTimeRate: query.historicalOnTimeRate
        ? Number(query.historicalOnTimeRate)
        : undefined,
      description: query.description,
    };
    this.logger.log(`Predicting timeline for project ${id}`);
    return this.timelinePredictorService.predict(input);
  }
}
