'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ProcessingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Processing page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center space-y-5 max-w-md">
        <div className="text-4xl">⚠️</div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Something went wrong
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          This can happen after a new deployment. Please submit your paper again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
