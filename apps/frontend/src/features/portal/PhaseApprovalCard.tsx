'use client';

import { useState } from 'react';

interface PhaseApprovalCardProps {
  phase: {
    id: string;
    name: string;
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'revision';
    description?: string;
  };
  onSubmit?: (phaseId: string) => void;
  onReview?: (phaseId: string, action: 'approve' | 'reject' | 'revision', comment?: string) => void;
  isAdmin?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  submitted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  revision: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export function PhaseApprovalCard({ phase, onSubmit, onReview, isAdmin }: PhaseApprovalCardProps) {
  const [comment, setComment] = useState('');
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-white">{phase.name}</h4>
          {phase.description && (
            <p className="mt-1 text-xs text-white/40">{phase.description}</p>
          )}
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[phase.status]}`}>
          {phase.status}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        {!isAdmin && phase.status === 'pending' && onSubmit && (
          <button
            onClick={() => onSubmit(phase.id)}
            className="rounded-md bg-[#D4AF37] px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-[#C49A2F]"
          >
            Submit for Approval
          </button>
        )}

        {isAdmin && phase.status === 'submitted' && (
          <>
            <button
              onClick={() => {
                onReview?.(phase.id, 'approve', comment);
                setShowReview(false);
              }}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500"
            >
              Approve
            </button>
            <button
              onClick={() => setShowReview(!showReview)}
              className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
            >
              Request Revision
            </button>
            <button
              onClick={() => {
                onReview?.(phase.id, 'reject', comment);
                setShowReview(false);
              }}
              className="rounded-md bg-red-600/80 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600"
            >
              Reject
            </button>
          </>
        )}

        {isAdmin && phase.status === 'submitted' && showReview && (
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add revision notes..."
              className="mt-2 w-full rounded-md border border-white/10 bg-black/50 p-2 text-xs text-white placeholder-white/30"
              rows={2}
            />
            <button
              onClick={() => {
                onReview?.(phase.id, 'revision', comment);
                setShowReview(false);
                setComment('');
              }}
              className="mt-1 rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-500"
            >
              Send Revision Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
