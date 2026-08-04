'use client';

import { useState } from 'react';
import { GeneratedCode } from '@/types';
import { Copy, Check, GitBranch, ExternalLink, Loader2 } from 'lucide-react';

interface Props {
  code: GeneratedCode;
  onExport: () => void;
  jobId?: string;
}

const langDot: Record<string, string> = {
  python:   'bg-blue-500',
  markdown: 'bg-purple-500',
  text:     'bg-zinc-400',
};

export default function CodeExplorer({ code, onExport, jobId }: Props) {
  const [active, setActive] = useState(code.files[0]?.path || '');
  const [copied, setCopied] = useState(false);
  const [colabLoading, setColabLoading] = useState(false);

  const file = code.files.find((f) => f.path === active);

  const copy = () => {
    if (!file) return;
    navigator.clipboard.writeText(file.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openInColab = async () => {
    if (!jobId) return;
    setColabLoading(true);
    try {
      const res = await fetch('/api/export-colab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('Colab export failed:', err.error);
        setColabLoading(false);
        return;
      }

      // Trigger file download
      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition') || '';
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? 'notebook.ipynb';

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Colab export error:', e);
    } finally {
      setColabLoading(false);
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-900" style={{ height: 560 }}>
      {/* File tabs */}
      <div className="flex items-center overflow-x-auto border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/80 flex-shrink-0">
        {code.files.map((f) => (
          <button key={f.path} onClick={() => setActive(f.path)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-r border-zinc-100 dark:border-zinc-800 whitespace-nowrap transition-colors ${
              active === f.path
                ? 'bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${langDot[f.language] || 'bg-zinc-400'}`} />
            {f.path}
          </button>
        ))}
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto">
        {file && (
          <pre className="text-xs leading-relaxed p-5 font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap min-h-full">
            {file.content}
          </pre>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/80 flex-shrink-0">
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {code.files.length} files · <span className="font-mono text-amber-600 dark:text-amber-400"># NOTE</span> comments flag ambiguities
        </span>
        <div className="flex items-center gap-2">
          <button onClick={copy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors">
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {jobId && (
            <button
              onClick={openInColab}
              disabled={colabLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              {colabLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <ExternalLink size={12} />
              )}
              {colabLoading ? 'Exporting…' : 'Open in Colab'}
            </button>
          )}
          <button onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium transition-colors">
            <GitBranch size={12} />
            Push to GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
