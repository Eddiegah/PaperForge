'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, X, ExternalLink, Lock, Globe } from 'lucide-react';

interface Props {
  jobId: string;
  paperTitle: string;
  onClose: () => void;
  githubAccessToken?: string; // Set automatically when signed in with GitHub
}

export default function GitHubExportModal({ jobId, paperTitle, onClose, githubAccessToken }: Props) {
  const hasOAuthToken = !!githubAccessToken;

  const [token, setToken] = useState('');
  const [repoName, setRepoName] = useState(
    paperTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'paperforge-replication'
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null);

  const handleExport = async () => {
    const activeToken = hasOAuthToken ? githubAccessToken : token.trim();
    if (!activeToken || !repoName.trim()) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/github-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, githubToken: activeToken, repoName: repoName.trim(), isPrivate }),
      });
      const data = await res.json();
      if (res.ok) setResult({ url: data.repoUrl });
      else setResult({ error: data.error || 'Export failed' });
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
              <GitBranch size={16} className="text-white dark:text-zinc-900" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Push to GitHub</h2>
              <p className="text-xs text-zinc-400">Creates a new repository</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {result?.url ? (
          /* Success state */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <p className="text-emerald-700 dark:text-emerald-300 font-medium text-sm mb-2">Repository created!</p>
              <a href={result.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-sm hover:underline break-all">
                {result.url} <ExternalLink size={12} />
              </a>
            </div>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <>
            {/* OAuth badge or manual token */}
            {hasOAuthToken ? (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                  Connected via GitHub sign-in — no key needed
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-zinc-400">
                  Needs the <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">repo</code> scope · Used once, never stored · Or{' '}
                  <a href="/auth/signin" className="text-indigo-500 hover:underline">sign in with GitHub</a> to skip this
                </p>
              </div>
            )}

            {/* Repo name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Repository name</label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Visibility toggle */}
            <div className="flex rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
              {[
                { value: false, label: 'Public', icon: <Globe size={13} /> },
                { value: true, label: 'Private', icon: <Lock size={13} /> },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setIsPrivate(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors ${
                    isPrivate === opt.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {opt.icon}{opt.label}
                </button>
              ))}
            </div>

            {result?.error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {result.error}
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={isSubmitting || (!hasOAuthToken && !token.trim()) || !repoName.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-zinc-900 font-medium text-sm transition-colors"
            >
              {isSubmitting ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : <GitBranch size={16} />}
              {isSubmitting ? 'Creating repository...' : 'Create & push repository'}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
