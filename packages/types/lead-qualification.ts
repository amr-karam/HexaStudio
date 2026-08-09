export interface LeadQualificationCriteria {
  budget: number; // Estimated budget in USD
  projectScale: 'small' | 'medium' | 'large' | 'enterprise';
  timeline: 'immediate' | '3-6-months' | '6-plus-months';
  aestheticAlignment: number; // Score 0-100 based on AI analysis
  industry: string;
}

export interface QualifiedLead {
  contactName: string;
  email: string;
  company?: string;
  phone?: string;
  criteria: LeadQualificationCriteria;
  aiSummary: string;
  leadScore: number; // 0-100
  priority: '0' | '1' | '2' | '3'; // Odoo priority mapping
}

export interface LeadQualificationResponse {
  success: boolean;
  leadId?: string;
  message: string;
  nextStep: 'partner_contact' | 'generic_thank_you';
}