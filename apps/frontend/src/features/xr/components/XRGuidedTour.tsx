'use client';

import { useState, useEffect } from 'react';
import { useXRStore } from '../store/xr-store';

export function XRGuidedTour() {
  const { status } = useXRStore();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === 'requesting' || status === 'active') {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [status]);

  if (!visible) return null;

  const steps = [
    { title: 'Welcome to HEXA Studio', desc: 'Point your device at a flat surface to begin.' },
    { title: 'Place the Model', desc: 'Tap to place the architectural model in your space.' },
    { title: 'Explore', desc: 'Move around to view from different angles.' },
  ];

  const current = steps[step];

  return (
    <div className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="max-w-md rounded-2xl bg-void/90 p-8 shadow-2xl border border-white/10 text-center">
        <h2 className="text-2xl font-medium text-sl-alabaster mb-2">{current.title}</h2>
        <p className="text-sl-alabaster/70 mb-6">{current.desc}</p>
        <div className="flex gap-2 justify-center">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 w-2 rounded-full ${i === step ? 'bg-sl-gold-subtle' : 'bg-white/20'}`} />
          ))}
        </div>
        <button
          onClick={() => {
            if (step < steps.length - 1) setStep(step + 1);
            else setVisible(false);
          }}
          className="mt-6 rounded-lg bg-sl-gold-subtle px-6 py-3 text-sm font-medium text-black shadow-lg transition-all hover:bg-sl-gold-subtle-dark active:scale-95"
        >
          {step < steps.length - 1 ? 'Next' : 'Start Exploring'}
        </button>
      </div>
    </div>
  );
}
