import { Body, Controller, Get, Logger, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LeadScoringService } from './lead-scoring.service';
import { TimelinePredictorService, ProjectTimelineInput } from './timeline-predictor.service';
import { LeadScore } from './lead-score.schema';
import { TimelinePrediction } from './timeline-prediction.schema';

class ScoreLeadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;

  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  service?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  budget?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  message!: string;
}

class PredictTimelineQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  projectName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  projectType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  progress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  daysUntilNextMilestone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  revisionCount?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  recentActivityCount?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  historicalAvgCompletionDays?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  historicalOnTimeRate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

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
  async scoreLead(@Body() body: ScoreLeadDto): Promise<LeadScore> {
    this.logger.log(`Scoring lead for ${body.email}`);
    return this.leadScoringService.scoreLead(body);
  }

  @Get('projects/:id/prediction')
  @Roles('admin', 'editor')
  async predictTimeline(
    @Param('id') id: string,
    @Query() query: PredictTimelineQueryDto,
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
