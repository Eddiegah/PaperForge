'use client';

import { motion } from 'framer-motion';
import { DifficultyScore } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface Props { score: DifficultyScore; }

const confidenceBadge: Record<string, string> = {
  medium: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  low:    'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
  missing:'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
};

function ScoreGauge({ score }: { score: number }) {
  const color = score <= 3 ? '#10b981' : score <= 6 ? '#f59e0b' : score <= 8 ? '#f97316' : '#ef4444';
  const pct = (score / 10) * 100;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e4e4e7" className="dark:stroke-zinc-700" strokeWidth="10" />
          <motion.circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
            animate={{ strokeDashoffset: (2 * Math.PI * 40) * (1 - pct / 100) }}
            transition={{ duration: 1, ease: 'easeOut' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-zinc-400 text-xs">/10</span>
        </div>
      </div>
      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Replication Difficulty</span>
    </div>
  );
}

function ClarityBar({ label, value }: { label: string; value: number }) {
  const color = value > 0.75 ? '#10b981' : value > 0.5 ? '#f59e0b' : '#ef4444';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>{label}</span>
        <span style={{ color }}>{Math.round(value * 100)}% clear</span>
      </div>
      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }} />
      </div>
    </div>
  );
}

export default function DifficultyScorePanel({ score }: Props) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-start gap-6">
        <ScoreGauge score={score.score} />
        <div className="flex-1">
          <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">{score.overallAssessment}</p>
          <div className="mt-4 space-y-2.5">
            <ClarityBar label="Model Architecture" value={score.breakdown.modelClarityScore} />
            <ClarityBar label="Dataset" value={score.breakdown.dataClarityScore} />
            <ClarityBar label="Training Recipe" value={score.breakdown.trainingClarityScore} />
            <ClarityBar label="Evaluation" value={score.breakdown.evaluationClarityScore} />
          </div>
        </div>
      </div>

      {score.ambiguousFields.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Fields Requiring Verification ({score.ambiguousFields.length})
            </h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {score.ambiguousFields.map((field, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-indigo-600 dark:text-indigo-400 text-xs font-mono">{field.fieldName}</code>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md border font-medium ${confidenceBadge[field.confidence]}`}>
                    {field.confidence}
                  </span>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">{field.issue}</p>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs italic">→ {field.recommendation}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
