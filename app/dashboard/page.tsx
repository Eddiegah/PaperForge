'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import UploadZone from '@/components/UploadZone';
import ArxivSearch from '@/components/ArxivSearch';
import PaperHistory from '@/components/PaperHistory';
import UsageBar from '@/components/UsageBar';
import { Sparkles, History, ArrowRight, Search, GitCompare, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  const handleSubmit = (jobId: string) => router.push(`/processing/${jobId}`);

  const handleAnalyze = (arxivId: string) => {
    fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arxivId }),
    })
      .then(r => r.json())
      .then(d => { if (d.jobId) router.push(`/processing/${d.jobId}`); })
      .catch(console.error);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

          {/* Main column */}
          <div className="space-y-6">
            {/* Welcome */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''} 👋
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
                Paste an arXiv link or upload a PDF to start extracting.
              </p>
            </motion.div>

            {/* Upload card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-500" />
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Analyze a paper</h2>
                </div>
                <Link href="/compare"
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <GitCompare size={12} />
                  Compare papers
                </Link>
              </div>
              <UploadZone onSubmit={handleSubmit} />
            </motion.div>

            {/* arXiv search */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Search size={15} className="text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Search papers</h2>
              </div>
              <ArxivSearch onAnalyze={handleAnalyze} />
            </motion.div>

            {/* Quick examples */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <History size={15} className="text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Try these papers</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: '1706.03762', title: 'Attention Is All You Need', desc: 'Transformer — very clear, score ~2/10' },
                  { id: '1512.03385', title: 'Deep Residual Learning (ResNet)', desc: 'Computer vision classic' },
                  { id: '2005.14165', title: 'GPT-3: Few-Shot Learners', desc: 'Large language model' },
                  { id: '1406.2661',  title: 'Generative Adversarial Networks', desc: 'Seminal GAN paper' },
                ].map((p) => (
                  <button key={p.id} onClick={() => handleAnalyze(p.id)}
                    className="text-left p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-0.5">{p.title}</p>
                        <p className="text-xs text-zinc-400">{p.desc}</p>
                        <code className="text-xs text-indigo-500 mt-1 block">{p.id}</code>
                      </div>
                      <ArrowRight size={13} className="text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors mt-0.5 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Usage bar */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <UsageBar />
            </motion.div>

            {/* Paper history */}
            <motion.div
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock size={15} className="text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Recent papers</h2>
              </div>
              <PaperHistory />
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
