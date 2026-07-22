import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssistantsService } from './assistants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CEOAssistantService } from './services/ceo-assistant.service';
import { SalesAssistantService } from './services/sales-assistant.service';
import { PMAssistantService } from './services/pm-assistant.service';
import { LightingDesignerService } from './services/lighting-designer.service';
import { MaterialRecommenderService } from './services/material-recommender.service';
import { PredictiveAnalyticsService } from './services/predictive-analytics.service';

interface DashboardData {
  projects: { total: number; active: number; completed: number; atRisk: number };
  revenue: { current: number; target: number; growth: number };
  pipeline: { leads: number; qualified: number; proposals: number; conversion: number };
  team: { utilization: number; capacity: number };
}

interface ExecutiveSummaryBody {
  dashboardData: DashboardData;
  period: string;
}

interface StrategicRiskBody {
  revenueTrend: number[];
  projectDelays: number;
  clientChurn: number;
  teamTurnover: number;
  marketSignals: string[];
}

interface BoardReportBody {
  quarter: string;
  kpis: Record<string, number>;
  initiatives: { name: string; status: string; progress: number }[];
}

interface AskQuestionBody {
  question: string;
  context: { dashboardData: Record<string, unknown>; recentDecisions: string[] };
}

interface QualifyLeadBody {
  company: string;
  contact: string;
  budget: string;
  timeline: string;
  requirements: string;
}

interface GenerateProposalBody {
  clientName: string;
  projectType: string;
  scope: string[];
  timeline: string;
  budget: string;
}

interface PlanSprintBody {
  teamCapacity: number;
  backlog: string[];
  dependencies: Record<string, string[]>;
  velocity: number;
}

interface PredictRiskBody {
  projectData: { timeline: string; team: number; complexity: number; budget: number };
}

interface DesignLightingBody {
  projectType: string;
  style: string;
  space: string;
  mood: string;
  timeOfDay: string;
  constraints?: string[];
}

interface RecommendMaterialsBody {
  projectType: string;
  style: string;
  referenceImages?: string[];
  sustainability?: boolean;
}

interface ForecastTimelineBody {
  projectType: string;
  complexity: number;
  teamSize: number;
  scopeItems: number;
  historicalVelocity: number;
}

interface AssessRisksBody {
  projectData: { timeline: string; team: number; complexity: number; budget: number; scopeChanges: number; dependencies: string[] };
}

interface OptimizeResourcesBody {
  projects: Array<{ id: string; team: number; deadline: string; priority: number }>;
  availableTeam: number;
}

interface ForecastBudgetBody {
  projectType: string;
  scopeItems: string[];
  timeline: string;
  teamRate: number;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'editor')
@ApiTags('Assistants')
@ApiBearerAuth()
@Controller({ path: 'assistants', version: '1' })
export class AssistantsController {
  constructor(
    private readonly assistantsService: AssistantsService,
    private readonly ceoAssistant: CEOAssistantService,
    private readonly salesAssistant: SalesAssistantService,
    private readonly pmAssistant: PMAssistantService,
    private readonly lightingDesigner: LightingDesignerService,
    private readonly materialRecommender: MaterialRecommenderService,
    private readonly predictiveAnalytics: PredictiveAnalyticsService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for assistants service' })
  async healthCheck() {
    return this.assistantsService.healthCheck();
  }

  // CEO Assistant endpoints
  @Post('ceo/strategic-summary')
  @ApiOperation({ summary: 'Generate strategic summary for CEO' })
  async getStrategicSummary(
    @Body() body: { kpis: Record<string, number>; risks: string[]; opportunities: string[] },
  ) {
    return this.ceoAssistant.getStrategicSummary(body.kpis, body.risks, body.opportunities);
  }

  @Post('ceo/risk-alert')
  @ApiOperation({ summary: 'Get risk alert analysis for CEO' })
  async getRiskAlert(
    @Body() body: { risk: string; impact: 'low' | 'medium' | 'high'; context: string },
  ) {
    return this.ceoAssistant.getRiskAlert(body.risk, body.impact, body.context);
  }

  @Post('ceo/executive-summary')
  @ApiOperation({ summary: 'Generate executive summary' })
  async getExecutiveSummary(
    @Body() body: ExecutiveSummaryBody,
  ) {
    return this.ceoAssistant.generateExecutiveSummary(body.dashboardData, body.period);
  }

  @Post('ceo/strategic-risks')
  @ApiOperation({ summary: 'Identify strategic risks' })
  async getStrategicRisks(@Body() body: StrategicRiskBody) {
    return this.ceoAssistant.identifyStrategicRisks(body);
  }

  @Post('ceo/board-report')
  @ApiOperation({ summary: 'Generate board report' })
  async getBoardReport(@Body() body: BoardReportBody) {
    return this.ceoAssistant.generateBoardReport(body.quarter, body.kpis, body.initiatives);
  }

  @Post('ceo/question')
  @ApiOperation({ summary: 'Ask CEO assistant a strategic question' })
  async askQuestion(@Body() body: AskQuestionBody) {
    return this.ceoAssistant.answerStrategicQuestion(body.question, body.context);
  }

  // Sales Assistant endpoints
  @Post('sales/qualify-lead')
  @ApiOperation({ summary: 'Qualify a sales lead' })
  async qualifyLead(@Body() body: QualifyLeadBody) {
    return this.salesAssistant.qualifyLead(body.company, body.contact, body.budget, body.timeline, body.requirements);
  }

  @Post('sales/generate-proposal')
  @ApiOperation({ summary: 'Generate a sales proposal' })
  async generateProposal(@Body() body: GenerateProposalBody) {
    return this.salesAssistant.generateProposal(body.clientName, body.projectType, body.scope, body.timeline, body.budget);
  }

  // PM Assistant endpoints
  @Post('pm/plan-sprint')
  @ApiOperation({ summary: 'Plan a sprint with PM assistant' })
  async planSprint(@Body() body: PlanSprintBody) {
    return this.pmAssistant.planSprint(body.teamCapacity, body.backlog, body.dependencies, body.velocity);
  }

  @Post('pm/predict-risk')
  @ApiOperation({ summary: 'Predict project risk with PM assistant' })
  async predictRisk(@Body() body: PredictRiskBody) {
    return this.pmAssistant.predictRisk(body.projectData);
  }

  // Generative Visualization endpoints
  @Post('visualization/lighting-design')
  @ApiOperation({ summary: 'Design lighting for a project' })
  async designLighting(@Body() body: DesignLightingBody) {
    return this.lightingDesigner.designLighting(
      body.projectType,
      body.style,
      body.space,
      body.mood,
      body.timeOfDay,
      body.constraints || [],
    );
  }

  @Post('visualization/lighting-from-reference')
  @ApiOperation({ summary: 'Recommend lighting from reference image' })
  async lightingFromReference(@Body() body: { referenceImageDescription: string; targetSpace: string }) {
    return this.lightingDesigner.recommendFromReference(body.referenceImageDescription, body.targetSpace);
  }

  @Post('visualization/material-recommendations')
  @ApiOperation({ summary: 'Get material recommendations' })
  async recommendMaterials(@Body() body: RecommendMaterialsBody) {
    return this.materialRecommender.recommendMaterials(
      body.projectType,
      body.style,
      body.referenceImages || [],
      body.sustainability || false,
    );
  }

  @Post('visualization/material-from-reference')
  @ApiOperation({ summary: 'Match material from reference image' })
  async materialFromReference(@Body() body: { referenceDescription: string; targetElement: string }) {
    return this.materialRecommender.matchFromReference(body.referenceDescription, body.targetElement);
  }

  // Predictive Analytics endpoints
  @Post('analytics/forecast-timeline')
  @ApiOperation({ summary: 'Forecast project timeline' })
  async forecastTimeline(@Body() body: ForecastTimelineBody) {
    return this.predictiveAnalytics.forecastTimeline(
      body.projectType,
      body.complexity,
      body.teamSize,
      body.scopeItems,
      body.historicalVelocity,
    );
  }

  @Post('analytics/assess-risks')
  @ApiOperation({ summary: 'Assess project risks' })
  async assessRisks(@Body() body: AssessRisksBody) {
    return this.predictiveAnalytics.assessRisks(body.projectData);
  }

  @Post('analytics/optimize-resources')
  @ApiOperation({ summary: 'Optimize resource allocation' })
  async optimizeResources(@Body() body: OptimizeResourcesBody) {
    return this.predictiveAnalytics.optimizeResources(body.projects, body.availableTeam);
  }

  @Post('analytics/forecast-budget')
  @ApiOperation({ summary: 'Forecast project budget' })
  async forecastBudget(@Body() body: ForecastBudgetBody) {
    return this.predictiveAnalytics.forecastBudget(
      body.projectType,
      body.scopeItems,
      body.timeline,
      body.teamRate,
    );
  }

  // Health check for all assistants
  @Get('health')
  @ApiOperation({ summary: 'Health check for all assistants' })
  async getHealth() {
    return this.assistantsService.healthCheck();
  }
}
