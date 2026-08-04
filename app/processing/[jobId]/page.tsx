'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProcessingJob } from '@/types';
import ProcessingStatus from '@/components/ProcessingStatus';
import DifficultyScorePanel from '@/components/DifficultyScorePanel';
import SpecTable from '@/components/SpecTable';
import CodeExplorer from '@/components/CodeExplorer';
import ArchitectureDiagram from '@/components/ArchitectureDiagram';
import GitHubExportModal from '@/components/GitHubExportModal';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, FileText, Code2, GitBranch } from 'lucide-react';

const POLL_MS = 3000;

export default function ProcessingPage({ params }: { params: Promise<{ jobId: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'spec' | 'code' | 'diagram'>('spec');
  const [showExport, setShowExport] = useState(false);

  useEffect(() => { params.then((p) => setJobId(p.jobId)); }, [params]);

  useEffect(() => {
    if (!jobId) return;
    // Handle demo redirects from dashboard
    if (jobId.startsWith('demo_')) {
      const arxivId = jobId.replace('demo_', '');
      router.replace(`/?arxivId=${arxivId}`);
      return;
    }
    let timer: ReturnType<typeof setInterval>;
    const poll = async () => {
      try {
        const res = await fetch(`/api/status/${jobId}`);
        if (res.status === 404) { setFetchError('Job not found. Please resubmit the paper.'); return; }
        const data: ProcessingJob = await res.json();
        setJob(data);
        if (data.status === 'complete' || data.status === 'failed') clearInterval(timer);
      } catch (e) {
        setFetchError(`Connection error: ${e instanceof Error ? e.message : String(e)}`);
        clearInterval(timer);
      }
    };
    poll();
    timer = setInterval(poll, POLL_MS);
    return () => clearInterval(timer);
  }, [jobId]);

  const isProcessing = !job || (job.status !== 'complete' && job.status !== 'failed');

  if (fetchError) return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md px-4">
          <p className="text-red-500">{fetchError}</p>
          <button onClick={() => router.push('/dashboard')} className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">← Back to dashboard</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      {/* Sub-header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-14 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors text-sm"
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>
          {job?.paperMetadata?.title && (
            <>
              <span className="text-zinc-300 dark:text-zinc-600">/</span>
              <span className="text-zinc-500 dark:text-zinc-400 text-sm truncate max-w-md">
                {job.paperMetadata.title}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Analyzing paper...</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">This typically takes 30–90 seconds.</p>
              </div>
              {job && <ProcessingStatus job={job} />}
            </motion.div>
          ) : job?.status === 'failed' ? (
            <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
              <div className="text-center space-y-2">
                <p className="text-4xl">❌</p>
                <h1 className="text-xl font-semibold text-red-500">Processing failed</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md">{job.error}</p>
              </div>
              <button onClick={() => router.push('/dashboard')} className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                Try another paper
              </button>
            </motion.div>
          ) : (
            <motion.div key="complete" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Paper header */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-1">
                  {job!.paperMetadata?.title || 'Paper Analysis'}
                </h1>
                {job!.paperMetadata?.authors?.length ? (
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-3">{job!.paperMetadata.authors.join(', ')}</p>
                ) : null}
                {job!.paperMetadata?.abstract && (
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3">
                    {job!.paperMetadata.abstract}
                  </p>
                )}
              </div>

              {/* Difficulty score */}
              {job!.difficultyScore && <DifficultyScorePanel score={job!.difficultyScore} />}

              {/* Tabs */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                <div className="flex border-b border-zinc-100 dark:border-zinc-800">
                  {([
                    { id: 'spec', label: 'Technical Spec', icon: <FileText size={14} /> },
                    { id: 'code', label: 'Generated Code', icon: <Code2 size={14} /> },
                    { id: 'diagram', label: 'Architecture', icon: <GitBranch size={14} /> },
                  ] as const).map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                          : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      }`}>
                      {tab.icon}{tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === 'spec' && job!.technicalSpec && (
                      <motion.div key="spec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SpecTable spec={job!.technicalSpec} />
                      </motion.div>
                    )}
                    {activeTab === 'code' && job!.generatedCode && (
                      <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <CodeExplorer code={job!.generatedCode} onExport={() => setShowExport(true)} />
                      </motion.div>
                    )}
                    {activeTab === 'diagram' && job!.architectureDiagram && (
                      <motion.div key="diagram" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ArchitectureDiagram mermaidCode={job!.architectureDiagram} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showExport && job && (
          <GitHubExportModal
            jobId={jobId!}
            paperTitle={job.paperMetadata?.title || 'paper'}
            onClose={() => setShowExport(false)}
            githubAccessToken={(session as any)?.githubAccessToken}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
