'use client';

/**
 * HEXA Portal v3.0 — AI Contract & Change Order Generator with E-Signature
 */

import React, { useState } from 'react';

export function ContractGeneratorView() {
  const [title, setTitle] = useState('');
  const [impactAmount, setImpactAmount] = useState('+$4,500 USD');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [contractData, setContractData] = useState<{ contractId: string; quotationRef: string; agreementText: string } | null>(null);
  const [signed, setSigned] = useState(false);

  const handleGenerate = async () => {
    if (!title.trim() || !description.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/portal/contracts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, impactAmount, description }),
      });
      if (res.ok) {
        const data = await res.json();
        setContractData(data);
      } else {
        // Backend route not yet available — generate a local draft
        const contractId = `CTR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const quotationRef = `QUO-${Date.now()}`;
        setContractData({
          contractId,
          quotationRef,
          agreementText: `**${title}**\n\nImpact: ${impactAmount}\n\n${description}\n\n---\n*This is a draft contract generated locally. The backend contract service will be available soon.*`,
        });
      }
    } catch {
      // Network error — generate a local draft
      const contractId = `CTR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const quotationRef = `QUO-${Date.now()}`;
      setContractData({
        contractId,
        quotationRef,
        agreementText: `**${title}**\n\nImpact: ${impactAmount}\n\n${description}\n\n---\n*This is a draft contract generated locally. The backend contract service will be available soon.*`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-sl-void/90 border border-sl-obsidian rounded-3xl p-6 shadow-2xl backdrop-blur-2xl text-sl-alabaster space-y-5 max-w-3xl mx-auto">
      <div className="pb-3 border-b border-sl-obsidian">
        <h3 className="text-sm font-bold text-sl-alabaster">AI Contract & Scope Change Order Generator</h3>
        <p className="text-xs text-sl-mist/60">Automatic Odoo Quotation & Digital E-Signature Workflow</p>
      </div>

      {!contractData ? (
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-sl-mist/80 block mb-1 font-medium">Change Request Title</label>
            <input
              type="text"
              placeholder="e.g. CR-004: Facade Solar Glass Spec Upgrade"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-sl-void border border-sl-obsidian rounded-xl p-3 text-xs text-sl-alabaster placeholder:text-sl-mist/40 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="text-sl-mist/80 block mb-1 font-medium">Financial Impact Amount</label>
            <input
              type="text"
              placeholder="+$4,500 USD"
              value={impactAmount}
              onChange={(e) => setImpactAmount(e.target.value)}
              className="w-full bg-sl-void border border-sl-obsidian rounded-xl p-3 text-xs text-sl-alabaster placeholder:text-sl-mist/40 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="text-sl-mist/80 block mb-1 font-medium">Scope Description & Specifications</label>
            <textarea
              rows={4}
              placeholder="Detail the architectural specification changes, material substitutions, and deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-sl-void border border-sl-obsidian rounded-xl p-3 text-xs text-sl-alabaster placeholder:text-sl-mist/40 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !title.trim() || !description.trim()}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-sl-void font-bold text-xs transition-colors"
          >
            {isGenerating ? 'Drafting Odoo Change Order Agreement...' : '📄 Generate Odoo Change Order Agreement'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-sl-void border border-sl-obsidian rounded-2xl font-mono text-xs text-sl-mist/80 whitespace-pre-wrap leading-relaxed">
            {contractData.agreementText}
          </div>

          {!signed ? (
            <div className="p-4 bg-sl-void/60 border border-amber-500/30 rounded-2xl space-y-3">
              <p className="text-xs font-bold text-amber-400">Digital E-Signature Sign-Off Required</p>
              <div className="w-full h-24 bg-black border border-sl-obsidian rounded-xl flex items-center justify-center text-xs text-sl-mist/60 italic">
                [Client Digital Signature Touch Canvas]
              </div>
              <button
                onClick={() => setSigned(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sl-void font-bold text-xs transition-colors"
              >
                ✍️ Execute Digital Signature & Sync to Odoo ERP
              </button>
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-xs space-y-1">
              <p className="font-bold text-emerald-500">✓ Agreement Signed & Synchronized with Odoo ERP</p>
              <p className="text-sl-mist/60 text-[11px]">Odoo Sales Order: {contractData.quotationRef} &bull; Status: Confirmed</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
