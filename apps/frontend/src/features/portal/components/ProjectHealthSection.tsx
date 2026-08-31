'use client';

import React from 'react';
import { Icon } from './PortalIcons';
import { motion } from 'framer-motion';
import { EASE, DURATION } from '@/lib/motion';

interface ProjectHealthSectionProps {
  healthScore?: {
    score: number;
    status: string;
    sentiment?: 'positive' | 'neutral' | 'frustrated' | 'urgent';
    metricBreakdown?: {
      timeline: number;
      budget: number;
      quality: number;
      communication: number;
    };
  };
  className?: string;
}

export function ProjectHealthSection({ healthScore }: ProjectHealthSectionProps) {

  const score = healthScore?.score ?? 0;
  const status = healthScore?.status ?? 'Unknown';
  const sentiment = healthScore?.sentiment ?? 'neutral';
  const breakdown = healthScore?.metricBreakdown;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'smile';
      case 'neutral': return 'meh';
      case 'frustrated': return 'frown';
      case 'urgent': return 'alert-triangle';
      default: return 'help-circle';
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-500';
      case 'neutral': return 'text-sl-mist/60';
      case 'frustrated': return 'text-orange-500';
      case 'urgent': return 'text-red-500';
      default: return 'text-sl-mist/60';
    }
  }

  const metrics = breakdown
    ? [
        { label: 'Timeline', value: breakdown.timeline, key: 'timeline' },
        { label: 'Budget', value: breakdown.budget, key: 'budget' },
        { label: 'Quality', value: breakdown.quality, key: 'quality' },
        { label: 'Communication', value: breakdown.communication, key: 'communication' },
      ]
    : [];

  return (
    <section className="space-y-6" aria-label="Project health">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-sl-mist/60">Project Health</h2>
        <span className="text-[10px] font-mono text-sl-mist/60">Live</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.component, ease: EASE.entrance }}
        className="artisan-glass rounded-xl p-6 space-y-6 border border-sl-silver/20"
      >
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE.entrance }}
            className="relative w-32 h-32 flex-shrink-0"
          >
            <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="54"
                strokeWidth="8"
                fill="none"
                stroke="currentColor"
                className="text-sl-silver/10"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                strokeWidth="8"
                fill="none"
                stroke="currentColor"
                strokeDasharray={2 * Math.PI * 54}
                strokeLinecap="round"
                className={getScoreColor(score)}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: score / 100 }}
                transition={{ duration: 1.5, delay: 0.2, ease: 'power2.out' }}
                style={{
                  strokeDashoffset: 2 * Math.PI * 54 * (1 - score / 100),
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6, ease: 'back.out' }}
                className="font-mono text-4xl sm:text-5xl font-bold text-foreground tabular-nums"
              >
                {score}%
              </motion.span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-sl-mist/60">Health Score</span>
            </div>
          </motion.div>

          <div className="flex flex-col items-end space-y-2 text-right">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <Icon
                name={getSentimentIcon(sentiment)}
                className={`w-5 h-5 ${getSentimentColor(sentiment)}`}
              />
              <span className={`font-mono text-sm capitalize ${getSentimentColor(sentiment)}`}>
                {sentiment}
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="font-serif text-lg font-light text-foreground capitalize"
            >
              {status}
            </motion.p>
          </div>
        </div>

        {metrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.component, delay: 0.4, ease: EASE.entrance }}
            className="grid grid-cols-2 gap-4 pt-6 border-t border-sl-silver/20"
          >
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.08, ease: EASE.entrance }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-sl-mist/60">
                    {metric.label}
                  </span>
                  <span className="font-mono text-sm font-medium text-foreground">{metric.value}%</span>
                </div>
                <div className="h-1.5 bg-sl-silver/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: metric.value / 100 }}
                    transition={{ duration: 1.2, delay: 0.6 + i * 0.08, ease: 'power2.out' }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.component, delay: 0.7, ease: EASE.entrance }}
          className="flex items-center gap-3 pt-4 border-t border-sl-silver/20"
        >
          <Icon
            name={getSentimentIcon(sentiment)}
            className={`w-5 h-5 ${getSentimentColor(sentiment)}`}
          />
          <div>
            <p className={`font-mono text-sm capitalize ${getSentimentColor(sentiment)}`}>
              Client Sentiment: {sentiment}
            </p>
            <p className="text-[10px] font-mono text-sl-mist/60">
              Based on communication analysis & approval velocity
            </p>
           </div>
        </motion.div>
      </motion.div>
      </section>
   );
   }


export default ProjectHealthSection;