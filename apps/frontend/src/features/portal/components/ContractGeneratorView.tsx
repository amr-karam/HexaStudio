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
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-neutral-950/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl text-neutral-100 space-y-5 max-w-3xl mx-auto">
      <div className="pb-3 border-b border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-100">AI Contract & Scope Change Order Generator</h3>
        <p className="text-xs text-neutral-400">Automatic Odoo Quotation & Digital E-Signature Workflow</p>
      </div>

      {!contractData ? (
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-neutral-300 block mb-1 font-medium">Change Request Title</label>
            <input
              type="text"
              placeholder="e.g. CR-004: Facade Solar Glass Spec Upgrade"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="text-neutral-300 block mb-1 font-medium">Financial Impact Amount</label>
            <input
              type="text"
              placeholder="+$4,500 USD"
              value={impactAmount}
              onChange={(e) => setImpactAmount(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="text-neutral-300 block mb-1 font-medium">Scope Description & Specifications</label>
            <textarea
              rows={4}
              placeholder="Detail the architectural specification changes, material substitutions, and deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !title.trim() || !description.trim()}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs transition-colors"
          >
            {isGenerating ? 'Drafting Odoo Change Order Agreement...' : '📄 Generate Odoo Change Order Agreement'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
            {contractData.agreementText}
          </div>

          {!signed ? (
            <div className="p-4 bg-neutral-900/60 border border-amber-500/30 rounded-2xl space-y-3">
              <p className="text-xs font-bold text-amber-400">Digital E-Signature Sign-Off Required</p>
              <div className="w-full h-24 bg-black border border-neutral-800 rounded-xl flex items-center justify-center text-xs text-neutral-500 italic">
                [Client Digital Signature Touch Canvas]
              </div>
              <button
                onClick={() => setSigned(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors"
              >
                ✍️ Execute Digital Signature & Sync to Odoo ERP
              </button>
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-xs space-y-1">
              <p className="font-bold text-emerald-400">✓ Agreement Signed & Synchronized with Odoo ERP</p>
              <p className="text-neutral-400 text-[11px]">Odoo Sales Order: {contractData.quotationRef} &bull; Status: Confirmed</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
