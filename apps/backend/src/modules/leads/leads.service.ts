import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { OdooApiService } from "@/modules/odoo/odoo-api.service";
import { QualifiedLead, LeadQualificationResponse } from "@hexastudio/types";

@Injectable()
export class LeadsService {
  constructor(private readonly odooService: OdooApiService) {}

  async qualifyLead(lead: QualifiedLead): Promise<LeadQualificationResponse> {
    try {
      const odooPayload = {
        name: `[AI QUALIFIED] ${lead.company || lead.contactName}`,
        contact_name: lead.contactName,
        email_from: lead.email,
        phone: lead.phone,
        priority: lead.priority,
        description: `AI Summary: ${lead.aiSummary}\n\nBudget: $${lead.criteria.budget}\nScale: ${lead.criteria.projectScale}\nTimeline: ${lead.criteria.timeline}\nScore: ${lead.leadScore}/100`,
        expected_revenue: lead.criteria.budget,
      };

      const odooId = await this.odooService.create("crm.lead", odooPayload);
      
      return {
        success: true,
        leadId: odooId.toString(),
        message: "Lead successfully synchronized to Odoo CRM",
        nextStep: lead.leadScore > 80 ? "partner_contact" : "generic_thank_you",
      };
    } catch (error) {
      console.error("Odoo Lead Sync Error:", error);
      throw new InternalServerErrorException("Failed to synchronize lead with CRM");
    }
  }
}
