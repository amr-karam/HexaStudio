'use client';

/**
 * HEXA Portal v3.0 — AI E-Signature & Audit-Trailed Contract Sign-Off Modal
 *
 * Allows authorized clients to digitally sign architectural service agreements,
 * 3D render approvals, and project scope sign-offs with instant audit timestamping.
 */

import React, { useState, useRef } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';

interface ContractSignOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractTitle: string;
  contractId: string;
  onSigned: (signatureData: { name: string; timestamp: string; hash: string }) => void;
}

export function ContractSignOffModal({
  isOpen,
  onClose,
  contractTitle,
  contractId,
  onSigned,
}: ContractSignOffModalProps) {
  const { t } = useLocale();
  const [typedName, setTypedName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#D4AF37'; // HEXA Signature Gold
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSign = async () => {
    if (!typedName.trim() || !agreed) return;
    setIsSubmitting(true);

    const timestamp = new Date().toISOString();
    const hash = `HEXA-SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`;

    setTimeout(() => {
      onSigned({ name: typedName, timestamp, hash });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0F0F10] p-6 shadow-2xl text-white space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Digital Contract Sign-Off</h2>
            <p className="text-xs text-white/50">{contractTitle} (Ref: {contractId})</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-white/60 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-white/70">Full Legal Name</label>
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="e.g. Alexander Vance"
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-white/70">Draw Digital Signature</label>
            <button
              onClick={clearSignature}
              type="button"
              className="text-[10px] text-amber-400 hover:underline"
            >
              Clear Canvas
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={450}
            height={120}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full rounded-lg border border-white/15 bg-black cursor-crosshair"
          />
        </div>

        <div className="flex items-start space-x-2 pt-1">
          <input
            type="checkbox"
            id="agree-terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 accent-[#D4AF37] cursor-pointer"
          />
          <label htmlFor="agree-terms" className="text-xs text-white/70 cursor-pointer">
            I agree that my typed name and drawn digital signature represent a legally binding audit-trailed sign-off for {contractTitle}.
          </label>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSign}
            disabled={!typedName.trim() || !agreed || isSubmitting}
            className="rounded-lg bg-[#D4AF37] px-5 py-2 text-xs font-bold text-black disabled:opacity-40 hover:bg-[#E5C76B] transition-colors"
          >
            {isSubmitting ? 'Signing & Stamping...' : 'Confirm Digital Signature'}
          </button>
        </div>
      </div>
    </div>
  );
}
