/* -------------------------------------------------------------------------- */
/*  Executive Reporting v1.0                                                      */
/* -------------------------------------------------------------------------- */

export interface ExecutiveReport {
  projectId: number;
  projectName: string;
  generatedAt: string;
  
  /** The high-level aural/visual narrative of the project's current state */
  executiveSummary: {
    narrative: string;
    sentiment: 'positive' | 'neutral' | 'urgent';
    confidenceScore: number; // 0-100
  };

  /** Key performance indicators synthesized from Odoo and CMS */
  metrics: {
    timelineHealth: {
      status: 'on-track' | 'at-risk' | 'delayed';
      currentPhase: string;
      completionPercentage: number;
      nextMilestone: string;
      predictedCompletionDate: string;
    };
    budgetHealth: {
      status: 'on-track' | 'over-budget' | 'under-budget';
      totalAllocated: number;
      totalSpent: number;
      burnRate: string;
      forecastedOverrun?: number;
    };
    qualityHealth: {
      status: 'excellent' | 'good' | 'needs-attention';
      approvedDeliverables: number;
      pendingRevisions: number;
      clientSatisfactionIndex: number;
    };
  };

  /** Specific high-impact achievements since the last report */
  highlights: Array<{
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    category: 'design' | 'technical' | 'financial' | 'milestone';
  }>;

  /** Proactive interventions suggested by the AI Lead */
  interventions: Array<{
    issue: string;
    proposedSolution: string;
    urgency: 'low' | 'medium' | 'high';
    owner: string;
  }>;

  /** Metadata for the 3D visualizer to highlight specific areas in the model */
  visualizationCues: Array<{
    elementId: string;
    highlightColor: string;
    note: string;
  }>;
}
