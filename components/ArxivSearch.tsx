'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArxivResult {
  arxivId: string;
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  year: string;
}

interface Props {
  onAnalyze: (arxivId: string) => void;
}

export default function ArxivSearch({ onAnalyze }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ArxivResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/arxiv-search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Search failed');
        setResults(data as ArxivResult[]);
        setSearched(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="w-full">
      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search arXiv papers… e.g. diffusion models, ViT, RLHF"
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        {loading && (
          <Loader2
            size={15}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin"
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mt-4 space-y-3"
          >
            {results.map((paper) => (
              <PaperCard key={paper.arxivId} paper={paper} onAnalyze={onAnalyze} />
            ))}
          </motion.div>
        )}

        {searched && results.length === 0 && !loading && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-sm text-zinc-400 dark:text-zinc-500 text-center py-6"
          >
            No papers found for &quot;{query}&quot;
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function PaperCard({ paper, onAnalyze }: { paper: ArxivResult; onAnalyze: (id: string) => void }) {
  const displayAuthors =
    paper.authors.length > 3
      ? paper.authors.slice(0, 3).join(', ') + ` +${paper.authors.length - 3} more`
      : paper.authors.join(', ');

  const snippet =
    paper.abstract.length > 180
      ? paper.abstract.slice(0, 180).trimEnd() + '…'
      : paper.abstract;

  return (
    <div className="group flex flex-col gap-2 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug mb-1">
            {paper.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <User size={11} className="flex-shrink-0" />
            <span className="truncate">{displayAuthors}</span>
            {paper.year && (
              <>
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span>{paper.year}</span>
              </>
            )}
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <code className="text-indigo-500">{paper.arxivId}</code>
          </div>
        </div>
        <button
          onClick={() => onAnalyze(paper.arxivId)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors whitespace-nowrap"
        >
          Analyze
          <ArrowRight size={11} />
        </button>
      </div>
      {snippet && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{snippet}</p>
      )}
    </div>
  );
}
