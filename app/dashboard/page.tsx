'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import UploadZone from '@/components/UploadZone';
import { Sparkles, History, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  const handleSubmit = (jobId: string) => {
    router.push(`/processing/${jobId}`);
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Paste an arXiv link or upload a PDF to start extracting.
          </p>
        </motion.div>

        {/* Upload card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 mb-8 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Analyze a paper</h2>
          </div>
          <UploadZone onSubmit={handleSubmit} />
        </motion.div>

        {/* Quick examples */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <History size={16} className="text-zinc-400" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Try these papers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: '1706.03762', title: 'Attention Is All You Need', desc: 'Transformer — very clear, score ~2/10' },
              { id: '1512.03385', title: 'Deep Residual Learning (ResNet)', desc: 'Computer vision classic' },
              { id: '2005.14165', title: 'Language Models are Few-Shot Learners (GPT-3)', desc: 'Large language model' },
              { id: '1406.2661', title: 'Generative Adversarial Networks (GAN)', desc: 'Seminal GAN paper' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => router.push(`/processing/demo_${p.id}`)}
                className="text-left p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-0.5">{p.title}</p>
                    <p className="text-xs text-zinc-400">{p.desc}</p>
                    <code className="text-xs text-indigo-500 mt-1 block">{p.id}</code>
                  </div>
                  <ArrowRight size={14} className="text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors mt-0.5 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
