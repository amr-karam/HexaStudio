import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, impactAmount, description, clientName } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description required' }, { status: 400 });
    }

    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const contractId = `CTR-${Date.now().toString().slice(-6)}`;
    const quotationRef = `SO-ODOO-${Math.floor(1000 + Math.random() * 9000)}`;

    const agreementText = `
HEXA STUDIO ARCHITECTURAL CHANGE ORDER AGREEMENT
Agreement ID: ${contractId}
Date: ${dateStr}
Odoo ERP Quotation Reference: ${quotationRef}

CLIENT: ${clientName || 'Horizon Capital Real Estate'}
PROJECT: Villa Horizon — Masterplan Phase 2

1. SCOPE OF CHANGE:
${title}
${description}

2. FINANCIAL & TIMELINE IMPACT:
Cost Impact: ${impactAmount || '+$4,500.00 USD'}
Timeline Adjustment: +5 Business Days

3. ODOO ERP INTEGRATION & E-SIGNATURE:
Upon client signature below, this Change Order Agreement is automatically converted into an official Odoo Sales Order Quotation (${quotationRef}) and synchronized with Odoo Accounting and Project Milestone records.
    `.trim();

    return NextResponse.json({
      contractId,
      quotationRef,
      agreementText,
      status: 'pending_signature',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate contract' }, { status: 500 });
  }
}
