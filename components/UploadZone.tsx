'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link as LinkIcon, ArrowRight, FileText } from 'lucide-react';

interface UploadZoneProps {
  onSubmit: (jobId: string) => void;
}

export default function UploadZone({ onSubmit }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'upload' | 'arxiv'>('arxiv');
  const [arxivInput, setArxivInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitArxiv = async () => {
    if (!arxivInput.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arxivId: arxivInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start processing');
      onSubmit(data.jobId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const submitFile = async (file: File) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/ingest', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start processing');
      onSubmit(data.jobId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) submitFile(file);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode toggle */}
      <div className="flex p-1 mb-5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
        {([
          { id: 'arxiv', label: 'arXiv ID / URL', icon: <LinkIcon size={14} /> },
          { id: 'upload', label: 'Upload PDF', icon: <FileText size={14} /> },
        ] as const).map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === m.id
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'arxiv' ? (
          <motion.div
            key="arxiv"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={arxivInput}
                onChange={(e) => setArxivInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitArxiv()}
                placeholder="e.g. 1706.03762 or https://arxiv.org/abs/1706.03762"
                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
              <button
                onClick={submitArxiv}
                disabled={isSubmitting || !arxivInput.trim()}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-sm whitespace-nowrap"
              >
                {isSubmitting ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <ArrowRight size={16} />
                )}
                {isSubmitting ? 'Submitting...' : 'Analyze'}
              </button>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
              Try: <button onClick={() => setArxivInput('1706.03762')} className="text-indigo-500 hover:underline">1706.03762</button> (Attention Is All You Need) or <button onClick={() => setArxivInput('2005.14165')} className="text-indigo-500 hover:underline">2005.14165</button> (GPT-3)
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) submitFile(f); }} />
              <Upload size={32} className={`mx-auto mb-3 transition-colors ${isDragging ? 'text-indigo-500' : 'text-zinc-400'}`} />
              <p className="text-zinc-700 dark:text-zinc-200 font-medium mb-1">
                {isDragging ? 'Drop to analyze' : 'Drop a PDF or click to browse'}
              </p>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm">Up to 32MB · Text-searchable PDFs only</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
