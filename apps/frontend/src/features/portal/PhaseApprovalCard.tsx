'use client';

import { useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';

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
  pending: 'bg-sl-gold-subtle/10 text-sl-gold-hover border-sl-gold-subtle/20',
  submitted: 'bg-sl-obsidian-raised/20 text-sl-gold border-sl-gold-subtle/20',
  approved: 'bg-success/10 text-success-ink border-success/20',
  rejected: 'bg-destructive/10 text-destructive-ink border-destructive/20',
  revision: 'bg-sl-gold-deep/10 text-sl-gold-deep border-sl-gold-deep/20',
};

export function PhaseApprovalCard({ phase, onSubmit, onReview, isAdmin }: PhaseApprovalCardProps) {
  const [comment, setComment] = useState('');
  const [showReview, setShowReview] = useState(false);
  const { t } = useLocale();

  return (
    <div className="rounded-2xl border border-sl-gold-subtle/15 bg-sl-obsidian p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-sl-alabaster">{phase.name}</h4>
          {phase.description && (
            <p className="mt-1 text-xs text-sl-alabaster/40">{phase.description}</p>
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
            className="rounded-md bg-sl-gold-subtle px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-sl-gold-subtle-dark"
          >
            {t('portal.approval.submitForApproval')}
          </button>
        )}

        {isAdmin && phase.status === 'submitted' && (
          <>
            <button
              onClick={() => {
                onReview?.(phase.id, 'approve', comment);
                setShowReview(false);
              }}
              className="rounded-md bg-success-600 px-3 py-1.5 text-xs font-medium text-sl-alabaster transition-colors hover:bg-success"
            >
              {t('portal.approval.approve')}
            </button>
            <button
              onClick={() => setShowReview(!showReview)}
              className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-sl-alabaster transition-colors hover:bg-white/20"
            >
              {t('portal.approval.requestRevision')}
            </button>
            <button
              onClick={() => {
                onReview?.(phase.id, 'reject', comment);
                setShowReview(false);
              }}
              className="rounded-md bg-destructive-deep/80 px-3 py-1.5 text-xs font-medium text-sl-alabaster transition-colors hover:bg-destructive-deep"
            >
              {t('portal.approval.reject')}
            </button>
          </>
        )}

        {isAdmin && phase.status === 'submitted' && showReview && (
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('portal.approval.revisionNotes')}
              className="mt-2 w-full rounded-md border border-white/10 bg-black/50 p-2 text-xs text-sl-alabaster placeholder-white/30"
              rows={2}
            />
                <button
                  onClick={() => {
                    onReview?.(phase.id, 'revision', comment);
                    setShowReview(false);
                    setComment('');
                  }}
                  className="mt-1 rounded-md bg-sl-gold-deep px-3 py-1.5 text-xs font-medium text-sl-alabaster transition-colors hover:bg-sl-gold-hover"
                >
                  {t('portal.approval.sendRevision')}
                </button>
          </div>
        )}
      </div>
    </div>
  );
}
