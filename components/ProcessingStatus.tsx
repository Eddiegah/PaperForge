'use client';

import { motion } from 'framer-motion';
import { ProcessingJob } from '@/types';
import { Check } from 'lucide-react';

interface Props { job: ProcessingJob; }

const STEPS = [
  { status: 'uploading',  label: 'Reading paper' },
  { status: 'extracting', label: 'Extracting architecture & training details' },
  { status: 'analyzing',  label: 'Computing Replication Difficulty Score' },
  { status: 'generating', label: 'Generating annotated starter code' },
];

function stepState(stepStatus: string, current: string) {
  const order = STEPS.map((s) => s.status);
  const si = order.indexOf(stepStatus), ci = order.indexOf(current);
  if (current === 'failed') return si < ci ? 'done' : 'pending';
  if (si < ci) return 'done';
  if (si === ci) return 'active';
  return 'pending';
}

export default function ProcessingStatus({ job }: Props) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>{job.statusMessage}</span>
          <span>{job.progress}%</span>
        </div>
        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${job.status === 'failed' ? 'bg-red-500' : 'bg-indigo-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${job.progress}%` }}
            transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step) => {
          const state = stepState(step.status, job.status);
          return (
            <div key={step.status} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                state === 'done'    ? 'bg-emerald-500' :
                state === 'active'  ? 'bg-indigo-500' :
                                      'bg-zinc-100 dark:bg-zinc-800'
              }`}>
                {state === 'done' && <Check size={12} className="text-white" />}
                {state === 'active' && (
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                    className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span className={`text-sm transition-colors ${
                state === 'active' ? 'text-zinc-900 dark:text-zinc-100 font-medium' :
                state === 'done'   ? 'text-zinc-400 dark:text-zinc-500 line-through' :
                                     'text-zinc-300 dark:text-zinc-600'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {job.status === 'failed' && job.error && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300 font-medium text-sm mb-1">Processing failed</p>
          <p className="text-red-500 dark:text-red-400 text-sm">{job.error}</p>
        </motion.div>
      )}
    </div>
  );
}
