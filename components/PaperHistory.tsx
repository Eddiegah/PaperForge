'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, BarChart3 } from 'lucide-react';

interface HistoryItem {
  id: string;
  jobId: string;
  paperTitle: string;
  arxivId: string | null;
  difficultyScore: number | null;
  createdAt: string;
}

function ScoreDot({ score }: { score: number | null }) {
  if (!score) return <span className="text-zinc-400 text-xs">-</span>;
  const color = score <= 3 ? 'bg-emerald-500' : score <= 6 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{score}/10</span>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function PaperHistory() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-sm">
        <Clock size={20} className="mx-auto mb-2 opacity-50" />
        No papers analyzed yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((item, i) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => router.push(`/processing/${item.jobId}`)}
          className="w-full text-left p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800
            hover:border-indigo-200 dark:hover:border-indigo-800
            hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20
            transition-all group"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate leading-snug mb-1">
                {item.paperTitle}
              </p>
              <div className="flex items-center gap-3">
                <ScoreDot score={item.difficultyScore} />
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {timeAgo(item.createdAt)}
                </span>
                {item.arxivId && (
                  <code className="text-[10px] text-indigo-400">{item.arxivId}</code>
                )}
              </div>
            </div>
            <ArrowRight size={13} className="text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors flex-shrink-0 mt-0.5" />
          </div>
        </motion.button>
      ))}
    </div>
  );
}
