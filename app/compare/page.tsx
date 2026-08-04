'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ProcessingJob } from '@/types';
import { ArrowLeft, GitCompare, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ── helpers ──────────────────────────────────────────────────────────────────

function extractValue(field: { value: unknown } | undefined): string {
  if (!field) return '—';
  const v = field.value;
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v)) return v.length > 0 ? v.join(', ') : '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function getConfidence(field: { confidence?: { value?: string } } | undefined): string {
  return field?.confidence?.value ?? 'missing';
}

const POLL_MS = 3000;

async function submitArxiv(arxivId: string): Promise<string> {
  const res = await fetch('/api/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ arxivId: arxivId.trim() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to start processing');
  return data.jobId as string;
}

async function pollJob(jobId: string): Promise<ProcessingJob> {
  const res = await fetch(`/api/status/${jobId}`);
  if (!res.ok) throw new Error('Job not found');
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ComparisonRow {
  label: string;
  value1: string;
  value2: string;
  conf1: string;
  conf2: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const router = useRouter();

  const [arxiv1, setArxiv1] = useState('');
  const [arxiv2, setArxiv2] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [jobId1, setJobId1] = useState<string | null>(null);
  const [jobId2, setJobId2] = useState<string | null>(null);
  const [job1, setJob1] = useState<ProcessingJob | null>(null);
  const [job2, setJob2] = useState<ProcessingJob | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);

  const bothComplete =
    job1?.status === 'complete' && job2?.status === 'complete';

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleCompare = async () => {
    if (!arxiv1.trim() || !arxiv2.trim()) return;
    setSubmitError(null);
    setSubmitting(true);
    setJob1(null);
    setJob2(null);
    setPollError(null);
    try {
      const [id1, id2] = await Promise.all([submitArxiv(arxiv1), submitArxiv(arxiv2)]);
      setJobId1(id1);
      setJobId2(id2);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Polling ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!jobId1) return;
    let timer: ReturnType<typeof setInterval>;
    const poll = async () => {
      try {
        const j = await pollJob(jobId1);
        setJob1(j);
        if (j.status === 'complete' || j.status === 'failed') clearInterval(timer);
      } catch {
        setPollError('Failed to fetch job 1 status');
        clearInterval(timer);
      }
    };
    poll();
    timer = setInterval(poll, POLL_MS);
    return () => clearInterval(timer);
  }, [jobId1]);

  useEffect(() => {
    if (!jobId2) return;
    let timer: ReturnType<typeof setInterval>;
    const poll = async () => {
      try {
        const j = await pollJob(jobId2);
        setJob2(j);
        if (j.status === 'complete' || j.status === 'failed') clearInterval(timer);
      } catch {
        setPollError('Failed to fetch job 2 status');
        clearInterval(timer);
      }
    };
    poll();
    timer = setInterval(poll, POLL_MS);
    return () => clearInterval(timer);
  }, [jobId2]);

  // ── Build comparison rows ───────────────────────────────────────────────────

  const rows: ComparisonRow[] = bothComplete
    ? [
        {
          label: 'Model Architecture',
          value1: extractValue(job1!.technicalSpec?.modelArchitecture.name),
          value2: extractValue(job2!.technicalSpec?.modelArchitecture.name),
          conf1: getConfidence(job1!.technicalSpec?.modelArchitecture.name),
          conf2: getConfidence(job2!.technicalSpec?.modelArchitecture.name),
        },
        {
          label: 'Dataset',
          value1: extractValue(job1!.technicalSpec?.dataset.name),
          value2: extractValue(job2!.technicalSpec?.dataset.name),
          conf1: getConfidence(job1!.technicalSpec?.dataset.name),
          conf2: getConfidence(job2!.technicalSpec?.dataset.name),
        },
        {
          label: 'Optimizer',
          value1: extractValue(job1!.technicalSpec?.trainingRecipe.optimizer),
          value2: extractValue(job2!.technicalSpec?.trainingRecipe.optimizer),
          conf1: getConfidence(job1!.technicalSpec?.trainingRecipe.optimizer),
          conf2: getConfidence(job2!.technicalSpec?.trainingRecipe.optimizer),
        },
        {
          label: 'Learning Rate',
          value1: extractValue(job1!.technicalSpec?.trainingRecipe.learningRate),
          value2: extractValue(job2!.technicalSpec?.trainingRecipe.learningRate),
          conf1: getConfidence(job1!.technicalSpec?.trainingRecipe.learningRate),
          conf2: getConfidence(job2!.technicalSpec?.trainingRecipe.learningRate),
        },
        {
          label: 'Batch Size',
          value1: extractValue(job1!.technicalSpec?.trainingRecipe.batchSize),
          value2: extractValue(job2!.technicalSpec?.trainingRecipe.batchSize),
          conf1: getConfidence(job1!.technicalSpec?.trainingRecipe.batchSize),
          conf2: getConfidence(job2!.technicalSpec?.trainingRecipe.batchSize),
        },
        {
          label: 'Primary Metric',
          value1: extractValue(job1!.technicalSpec?.evaluationMetrics.primary),
          value2: extractValue(job2!.technicalSpec?.evaluationMetrics.primary),
          conf1: getConfidence(job1!.technicalSpec?.evaluationMetrics.primary),
          conf2: getConfidence(job2!.technicalSpec?.evaluationMetrics.primary),
        },
        {
          label: 'Difficulty Score',
          value1: job1!.difficultyScore ? `${job1!.difficultyScore.score}/10` : '—',
          value2: job2!.difficultyScore ? `${job2!.difficultyScore.score}/10` : '—',
          conf1: 'high',
          conf2: 'high',
        },
      ]
    : [];

  // ── Render ──────────────────────────────────────────────────────────────────

  const isPolling = jobId1 && jobId2 && !bothComplete && !pollError;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft size={15} />
            Dashboard
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <div className="flex items-center gap-1.5">
            <GitCompare size={16} className="text-indigo-500" />
            <h1 className="font-semibold text-zinc-900 dark:text-zinc-100">Compare papers</h1>
          </div>
        </div>

        {/* Input panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <PaperInputPanel
            label="Paper 1"
            value={arxiv1}
            onChange={setArxiv1}
            disabled={submitting || !!jobId1}
            placeholder="e.g. 1706.03762"
          />
          <PaperInputPanel
            label="Paper 2"
            value={arxiv2}
            onChange={setArxiv2}
            disabled={submitting || !!jobId2}
            placeholder="e.g. 1512.03385"
          />
        </div>

        {/* Compare button */}
        {!jobId1 && !jobId2 && (
          <div className="flex flex-col items-center gap-3 mb-8">
            {submitError && (
              <p className="text-sm text-red-500 dark:text-red-400">{submitError}</p>
            )}
            <button
              onClick={handleCompare}
              disabled={submitting || !arxiv1.trim() || !arxiv2.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-sm"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <GitCompare size={15} />
              )}
              {submitting ? 'Submitting…' : 'Compare'}
            </button>
          </div>
        )}

        {/* Reset button once jobs submitted */}
        {(jobId1 || jobId2) && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => {
                setJobId1(null);
                setJobId2(null);
                setJob1(null);
                setJob2(null);
                setArxiv1('');
                setArxiv2('');
                setPollError(null);
                setSubmitError(null);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              ← Start over
            </button>
          </div>
        )}

        {/* Loading / progress */}
        <AnimatePresence>
          {isPolling && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <JobStatusCard label="Paper 1" job={job1} />
                <JobStatusCard label="Paper 2" job={job2} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {pollError && (
          <p className="text-sm text-red-500 dark:text-red-400 text-center mb-6">{pollError}</p>
        )}

        {/* Comparison table */}
        <AnimatePresence>
          {bothComplete && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Paper title header */}
              <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Field</div>
                <div className="px-5 py-3 border-l border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-0.5">Paper 1</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {job1!.paperMetadata?.title || arxiv1}
                  </p>
                </div>
                <div className="px-5 py-3 border-l border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-0.5">Paper 2</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {job2!.paperMetadata?.title || arxiv2}
                  </p>
                </div>
              </div>

              {rows.map((row, i) => (
                <ComparisonRowUI key={row.label} row={row} isEven={i % 2 === 0} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PaperInputPanel({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  placeholder: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
        {label}
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition-all"
      />
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">arXiv ID or URL</p>
    </div>
  );
}

function JobStatusCard({ label, job }: { label: string; job: ProcessingJob | null }) {
  const statusColor =
    job?.status === 'complete'
      ? 'text-emerald-500'
      : job?.status === 'failed'
      ? 'text-red-500'
      : 'text-indigo-500';

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-3">
      {!job || (job.status !== 'complete' && job.status !== 'failed') ? (
        <Loader2 size={16} className="text-indigo-500 animate-spin flex-shrink-0" />
      ) : (
        <span className="text-base">{job.status === 'complete' ? '✅' : '❌'}</span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-0.5">{label}</p>
        <p className={`text-xs ${statusColor} truncate`}>
          {job ? job.statusMessage : 'Waiting…'}
        </p>
      </div>
    </div>
  );
}

function rowColor(row: ComparisonRow): string {
  if (row.conf1 === 'missing' || row.conf2 === 'missing' || row.value1 === '—' || row.value2 === '—') {
    return 'bg-red-50 dark:bg-red-950/10 border-l-2 border-l-red-300 dark:border-l-red-700';
  }
  if (row.value1.toLowerCase() === row.value2.toLowerCase()) {
    return 'bg-emerald-50 dark:bg-emerald-950/10 border-l-2 border-l-emerald-300 dark:border-l-emerald-700';
  }
  return 'bg-amber-50 dark:bg-amber-950/10 border-l-2 border-l-amber-300 dark:border-l-amber-700';
}

function ComparisonRowUI({ row, isEven }: { row: ComparisonRow; isEven: boolean }) {
  const color = rowColor(row);
  const base = isEven ? 'bg-zinc-50/50 dark:bg-zinc-800/20' : '';

  return (
    <div className={`grid grid-cols-[1fr_1fr_1fr] border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 ${base} ${color}`}>
      <div className="px-5 py-3.5">
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{row.label}</span>
      </div>
      <div className="px-5 py-3.5 border-l border-zinc-100 dark:border-zinc-800">
        <span className="text-xs text-zinc-700 dark:text-zinc-300">{row.value1}</span>
        {row.conf1 !== 'high' && (
          <ConfidenceBadge confidence={row.conf1} />
        )}
      </div>
      <div className="px-5 py-3.5 border-l border-zinc-100 dark:border-zinc-800">
        <span className="text-xs text-zinc-700 dark:text-zinc-300">{row.value2}</span>
        {row.conf2 !== 'high' && (
          <ConfidenceBadge confidence={row.conf2} />
        )}
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const colors: Record<string, string> = {
    medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    low: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    missing: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };
  return (
    <span className={`ml-1.5 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[confidence] ?? ''}`}>
      {confidence}
    </span>
  );
}
